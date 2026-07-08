from django.contrib import admin

from .models import CoursePurchase


@admin.register(CoursePurchase)
class CoursePurchaseAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "amount_cents", "status", "purchased_at", "created_at")
    list_filter = ("status", "course")
    search_fields = ("user__email", "course__slug", "stripe_checkout_session_id")
    readonly_fields = ("created_at", "updated_at", "purchased_at")
