from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from house.models import Room
from django.contrib.auth.models import User
# Create your models here.
class Contract(models.Model):
    STATUS = [
        ('creating', 'Đang tạo hợp đồng'),
        ('completed', 'Hoàn thành'),
        ('canceled', 'Hủy hợp đồng')
    ]
    room = models.ForeignKey(
        Room, on_delete=models.RESTRICT, null=True, blank=True, related_name="contracts")
    landlord = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="landlord_contracts")
    tenant = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="tenant_contracts")

    
    landlord_completed = models.BooleanField(default=False)  # Landlord đã điền thông tin
    tenant_completed = models.BooleanField(default=False)  # Tenant đã điền thông tin
    revision_requested = models.BooleanField(default=False)
    revision_reason = models.TextField(null=True, blank=True)
    # terms and duration of contract
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    payment_day = models.IntegerField(blank=True, null=True, validators=[MinValueValidator(1), MaxValueValidator(31)])
    terms_landlord = models.TextField(blank=True, null=True)
    terms_tenant = models.TextField(blank=True, null=True)

    # time of created and updated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='creating')
