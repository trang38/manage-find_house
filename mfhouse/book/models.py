from django.db import models
from django.contrib.auth.models import User

from house.models import Post

# Create your models here.
class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Đang xử lý'),
        ('accepted', 'Chấp nhận'),
        ('declined', 'Từ chối'),
        ('cancelled', 'Hủy bỏ')
    ]

    tenant = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='bookings')
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name='bookings')
    booking_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
