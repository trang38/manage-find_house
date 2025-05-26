from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Notification(models.Model):
    TYPES = [
        ('booking', 'Booking'),
        ('contract', 'Contract'),
        ('bill', 'Bill'),
        ('review', 'Review'),
        ('chat', 'Chat')
    ]

    actor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='notification')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(
        max_length=20, choices=TYPES)
    