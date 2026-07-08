from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .sharshabeel import BOT_NAME, sharshabeel_reply


class SharshabeelChatView(APIView):
    """شرشبيل — platform assistant for all users."""
    permission_classes = [AllowAny]

    def post(self, request):
        message = (request.data.get("message") or "").strip()
        if not message:
            return Response({"detail": "Message is required."}, status=400)

        page_path = (request.data.get("pagePath") or "")[:200]
        history = request.data.get("history") or []
        if not isinstance(history, list):
            history = []

        user = request.user if request.user.is_authenticated else None
        reply, suggestions = sharshabeel_reply(
            message, user=user, page_path=page_path, history=history, request=request
        )

        return Response({
            "reply": reply,
            "suggestions": suggestions[:4],
            "name": BOT_NAME,
        })
