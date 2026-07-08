from django.conf import settings
from django.utils import timezone

from courses.models import Course

from .models import CoursePurchase


def user_has_course_access(user, course: Course) -> bool:
    """All catalog courses are free for signed-in learners."""
    return True


def get_purchased_course_slugs(user) -> list[str]:
    return list(
        CoursePurchase.objects.filter(user=user, status=CoursePurchase.STATUS_PAID)
        .values_list("course__slug", flat=True)
        .distinct()
    )


def mark_purchase_paid(purchase: CoursePurchase, payment_intent_id: str = "") -> CoursePurchase:
    if purchase.status == CoursePurchase.STATUS_PAID:
        return purchase
    purchase.status = CoursePurchase.STATUS_PAID
    purchase.purchased_at = timezone.now()
    if payment_intent_id:
        purchase.stripe_payment_intent_id = payment_intent_id
    purchase.save(update_fields=["status", "purchased_at", "stripe_payment_intent_id", "updated_at"])
    return purchase


def course_price_cents(course: Course) -> int:
    if hasattr(course, "price_cents") and course.price_cents:
        return course.price_cents
    return settings.PREMIUM_COURSE_PRICE_CENTS
