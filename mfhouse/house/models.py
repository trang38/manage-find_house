from django.db import models
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from vi_address.models import City, District, Ward

from mfhouse.permissions import PathAndRename

# Create your models here.
class House(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True, related_name='house')
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True, related_name='house')
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True, blank=True, related_name='house')
    address_detail = models.CharField(max_length=255, blank=True, null=True)
    num_floors = models.PositiveIntegerField()  # Chỉ áp dụng với nhà nhiều tầng
    rooms_per_floor = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Room(models.Model):
    STATUS_CHOICES = [
        ('available', 'Trống'),
        ('occupied', 'Đang có người thuê'),
        ('checkout_soon', 'Sắp trả phòng'),
        ('maintenance', 'Bảo trì'),
    ]
    ROOM_TYPES = [
        ('1', 'Phòng trọ'),
        ('2', 'Homestay'),
        ('3', 'Nhà nguyên căn'),
        ('4', 'Studio'),
        ('5', 'Chung cư mini'),
    ]

    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='rooms')
    room_name = models.CharField(max_length=50) 
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default="1")

    price = models.IntegerField()
    deposit = models.IntegerField(null=True, blank=True)
    electric = models.IntegerField(null=True, blank=True)
    water = models.CharField(max_length=255, null=True, blank=True)
    service_price = models.IntegerField(null=True, blank=True)

    area = models.DecimalField(max_digits=6, decimal_places=2)
    amenities = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(blank=True)

    is_posted = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')  
    updated_at = models.DateTimeField(auto_now=True)

class RoomMedia(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to=PathAndRename("room_files"))

class Post(models.Model):
    room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='post')
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
