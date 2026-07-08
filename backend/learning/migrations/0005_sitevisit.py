from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("learning", "0004_lessonwatchprogress"),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteVisit",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("page_path", models.CharField(max_length=300)),
                ("page_title", models.CharField(blank=True, max_length=200)),
                ("session_key", models.CharField(blank=True, max_length=64)),
                ("user_agent", models.CharField(blank=True, max_length=400)),
                ("referrer", models.CharField(blank=True, max_length=500)),
                ("visited_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="site_visits",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-visited_at"],
                "indexes": [
                    models.Index(fields=["-visited_at"], name="learning_si_visited_6a0f0d_idx"),
                    models.Index(fields=["page_path"], name="learning_si_page_pa_8f2c1a_idx"),
                ],
            },
        ),
    ]
