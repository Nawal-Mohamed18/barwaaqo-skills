from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "role", "email_verified", "is_staff", "is_active", "date_joined")
    search_fields = ("email", "first_name", "username")
    list_filter = ("role", "email_verified", "is_staff", "is_active")
