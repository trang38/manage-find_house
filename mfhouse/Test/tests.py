from django.test import TestCase, override_settings
from django.core import mail
from django.core.mail import send_mail
import os

class EmailTest(TestCase):
    #@override_settings(EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend')
    def test_send_email(self):
        send_mail(
            subject="Test Email",
            message="This is a test email.",
            from_email=os.getenv('EMAIL_HOST_USER'),
            recipient_list=["nguyenthitra1ng@gmail.com"],
            fail_silently=False,
        )
