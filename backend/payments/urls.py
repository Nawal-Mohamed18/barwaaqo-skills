from django.urls import path

from .views import CheckoutConfirmView, CheckoutSessionView, PurchasesView, StripeWebhookView

urlpatterns = [
    path("purchases/", PurchasesView.as_view(), name="payments-purchases"),
    path("checkout/", CheckoutSessionView.as_view(), name="payments-checkout"),
    path("confirm/", CheckoutConfirmView.as_view(), name="payments-confirm"),
    path("webhook/", StripeWebhookView.as_view(), name="payments-webhook"),
]
