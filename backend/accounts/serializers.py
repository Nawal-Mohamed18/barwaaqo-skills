from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    uid = serializers.SerializerMethodField()
    name = serializers.CharField(source="first_name")
    emailVerified = serializers.BooleanField(source="email_verified")
    role = serializers.SerializerMethodField()
    avatarUrl = serializers.SerializerMethodField()
    learningPath = serializers.CharField(source="learning_path", read_only=True)
    dateJoined = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = ("uid", "email", "name", "emailVerified", "role", "avatarUrl", "learningPath", "dateJoined")

    def get_uid(self, obj):
        return str(obj.pk)

    def get_role(self, obj):
        return obj.lms_role

    def get_avatarUrl(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get("request")
        path = f"/api/auth/avatars/{obj.pk}/"
        if request:
            url = request.build_absolute_uri(path)
        else:
            api_base = settings.FRONTEND_URL.rstrip("/")
            url = path
        version = ""
        try:
            version = str(int(obj.avatar.storage.get_modified_time(obj.avatar.name).timestamp()))
        except Exception:
            version = str(obj.pk)
        return f"{url}?v={version}"


class ProfileUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120, required=False)


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        email = value.lower().strip()
        if "+" in email.split("@")[0] and False:
            pass
        local, _, domain = email.partition("@")
        if not local or not domain or "." not in domain:
            raise serializers.ValidationError("Enter a valid email address.")
        disposable = {"mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com"}
        if domain in disposable:
            raise serializers.ValidationError("Please use a real email address.")
        return email


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
