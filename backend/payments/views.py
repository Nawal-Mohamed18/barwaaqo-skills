import stripe
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course
from learning.models import Enrollment

from .models import CoursePurchase
from .services import course_price_cents, get_purchased_course_slugs, mark_purchase_paid, user_has_course_access


def _stripe_configured() -> bool:
    return bool(getattr(settings, "STRIPE_SECRET_KEY", ""))


class PurchasesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"purchased": get_purchased_course_slugs(request.user)})


class CheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _stripe_configured():
            return Response(
                {
                    "ok": False,
                    "error": "payments_unconfigured",
                    "message": "Online checkout is not available yet. Add STRIPE_SECRET_KEY to backend/.env and restart the server.",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        course_id = request.data.get("course_id")
        try:
            course = Course.objects.get(slug=course_id)
        except Course.DoesNotExist:
            return Response({"ok": False, "message": "Course not found."}, status=404)

        if course.free:
            return Response(
                {"ok": False, "message": "This course is free — enroll directly from the course page."},
                status=400,
            )

        if user_has_course_access(request.user, course):
            return Response(
                {"ok": False, "message": "You already own this course."},
                status=400,
            )

        amount = course_price_cents(course)
        stripe.api_key = settings.STRIPE_SECRET_KEY

        purchase = CoursePurchase.objects.create(
            user=request.user,
            course=course,
            amount_cents=amount,
            currency="usd",
            status=CoursePurchase.STATUS_PENDING,
        )

        success_url = (
            f"{settings.FRONTEND_URL.rstrip('/')}/checkout-success.html"
            f"?session_id={{CHECKOUT_SESSION_ID}}"
        )
        cancel_url = (
            f"{settings.FRONTEND_URL.rstrip('/')}/course-preview.html?id={course.slug}"
        )

        session = stripe.checkout.Session.create(
            mode="payment",
            customer_email=request.user.email,
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "unit_amount": amount,
                        "product_data": {
                            "name": course.title,
                            "description": f"Lifetime access — {course.lessons.count()} lessons",
                        },
                    },
                    "quantity": 1,
                }
            ],
            metadata={
                "purchase_id": str(purchase.id),
                "course_slug": course.slug,
                "user_id": str(request.user.id),
            },
            success_url=success_url,
            cancel_url=cancel_url,
        )

        purchase.stripe_checkout_session_id = session.id
        purchase.save(update_fields=["stripe_checkout_session_id", "updated_at"])

        return Response({"ok": True, "checkout_url": session.url, "session_id": session.id})


class CheckoutConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get("session_id")
        if not session_id:
            return Response({"ok": False, "message": "Missing session_id."}, status=400)

        if not _stripe_configured():
            return Response({"ok": False, "message": "Payments not configured."}, status=503)

        try:
            purchase = CoursePurchase.objects.select_related("course").get(
                user=request.user,
                stripe_checkout_session_id=session_id,
            )
        except CoursePurchase.DoesNotExist:
            return Response({"ok": False, "message": "Purchase not found."}, status=404)

        if purchase.status == CoursePurchase.STATUS_PAID:
            return Response({"ok": True, "course_id": purchase.course.slug, "already_paid": True})

        stripe.api_key = settings.STRIPE_SECRET_KEY
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status != "paid":
            return Response({"ok": False, "message": "Payment not completed yet."}, status=402)

        mark_purchase_paid(purchase, payment_intent_id=session.payment_intent or "")
        _auto_enroll_after_purchase(request.user, purchase.course)

        return Response({"ok": True, "course_id": purchase.course.slug})


def _auto_enroll_after_purchase(user, course):
    from django.conf import settings as django_settings
    from learning.views import _active_enrollments

    if Enrollment.objects.filter(user=user, course=course).exists():
        return
    if _active_enrollments(user).count() >= django_settings.MAX_ENROLLED_COURSES:
        return
    Enrollment.objects.create(user=user, course=course)


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        if not _stripe_configured():
            return Response(status=503)

        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")

        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            if webhook_secret:
                event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            else:
                import json

                event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=400)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            if session.get("payment_status") == "paid":
                purchase_id = session.get("metadata", {}).get("purchase_id")
                if purchase_id:
                    try:
                        purchase = CoursePurchase.objects.select_related("course", "user").get(
                            id=purchase_id
                        )
                        mark_purchase_paid(purchase, payment_intent_id=session.get("payment_intent") or "")
                        _auto_enroll_after_purchase(purchase.user, purchase.course)
                    except CoursePurchase.DoesNotExist:
                        pass

        return Response({"received": True})
