from django.conf import settings
from django.core.mail import send_mail
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .avatar_utils import process_avatar
from .serializers import (
    LoginSerializer,
    ProfileUpdateSerializer,
    ResendVerificationSerializer,
    SignupSerializer,
    UserSerializer,
    VerifyEmailSerializer,
)


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def _user_payload(user, request=None):
    return UserSerializer(user, context={"request": request}).data


def _send_verification_email(user, request):
    token = user.issue_verify_token()
    frontend = settings.FRONTEND_URL.rstrip("/")
    verify_url = f"{frontend}/verify-email.html?email={user.email}&token={token}"
    send_mail(
        subject="Verify your Barwaaqo Skills account",
        message=f"Click to verify your email:\n\n{verify_url}\n",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
    return verify_url


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        email = data["email"].lower().strip()
        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=data["name"].strip(),
            password=data["password"],
            email_verified=False,
            learning_path=data.get("learning_path") or "coding",
        )
        verify_url = _send_verification_email(user, request)
        return Response(
            {"email": user.email, "verify_url": verify_url, "message": "Check your email to verify."},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        password = serializer.validated_data["password"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "No account found with this email."}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(password):
            return Response({"detail": "Incorrect password."}, status=status.HTTP_400_BAD_REQUEST)
        if not user.email_verified:
            return Response(
                {"detail": "Please verify your email before signing in.", "code": "unverified", "email": user.email},
                status=status.HTTP_403_FORBIDDEN,
            )
        tokens = _tokens_for(user)
        return Response({**tokens, "user": _user_payload(user, request)})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(_user_payload(request.user, request))

    def patch(self, request):
        serializer = ProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        data = serializer.validated_data
        fields = []
        if "name" in data:
            user.first_name = data["name"].strip()
            fields.append("first_name")
        if fields:
            user.save(update_fields=fields)
        return Response(_user_payload(user, request))


class AvatarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("avatar")
        if not file:
            return Response({"detail": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > 5 * 1024 * 1024:
            return Response({"detail": "Image must be under 5 MB."}, status=status.HTTP_400_BAD_REQUEST)
        if not (file.content_type or "").startswith("image/"):
            return Response({"detail": "Please upload an image file."}, status=status.HTTP_400_BAD_REQUEST)

        crop = None
        if request.data.get("cropX") is not None:
            try:
                crop = {
                    "x": float(request.data.get("cropX", 0)),
                    "y": float(request.data.get("cropY", 0)),
                    "size": float(request.data.get("cropSize", 1)),
                }
            except (TypeError, ValueError):
                crop = None

        user = request.user
        if user.avatar:
            user.avatar.delete(save=False)

        processed = process_avatar(file, crop=crop)
        user.avatar.save(processed.name, processed, save=True)
        return Response(_user_payload(user, request))

    def delete(self, request):
        user = request.user
        if user.avatar:
            user.avatar.delete(save=False)
            user.avatar = None
            user.save(update_fields=["avatar"])
        return Response(_user_payload(user, request))


class AvatarServeView(APIView):
    """Serve avatar images in production (Render does not expose /media/ by default)."""
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        if not user.avatar:
            raise Http404
        try:
            avatar_file = user.avatar.open("rb")
        except FileNotFoundError:
            raise Http404
        content_type = "image/jpeg"
        if user.avatar.name.lower().endswith(".png"):
            content_type = "image/png"
        elif user.avatar.name.lower().endswith(".webp"):
            content_type = "image/webp"
        response = FileResponse(avatar_file, content_type=content_type)
        response["Cache-Control"] = "public, max-age=300"
        return response


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        token = serializer.validated_data["token"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Invalid or expired verification link."}, status=status.HTTP_400_BAD_REQUEST)
        if not user.verify_token_valid(token):
            return Response(
                {"detail": "Invalid or expired verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.mark_verified()
        return Response({"message": "Email verified successfully."})


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower().strip()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Account not found."}, status=status.HTTP_400_BAD_REQUEST)
        if user.email_verified:
            return Response({"detail": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST)
        verify_url = _send_verification_email(user, request)
        return Response({"verify_url": verify_url})
