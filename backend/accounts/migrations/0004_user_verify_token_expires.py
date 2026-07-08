from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_user_avatar"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="verify_token_expires",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
