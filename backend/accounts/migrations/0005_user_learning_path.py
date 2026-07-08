from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0004_user_verify_token_expires"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="learning_path",
            field=models.CharField(
                blank=True,
                choices=[
                    ("coding", "Coding & Tech"),
                    ("design", "Design & Creative"),
                    ("business", "Business & Career"),
                    ("personal", "Personal Growth"),
                ],
                default="coding",
                max_length=20,
            ),
        ),
    ]
