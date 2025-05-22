from datetime import timezone
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from house.models import Room
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError

from book.models import Booking
# Create your models here.
class Contract(models.Model):
    STATUS = [
        ('creating', 'Đang tạo hợp đồng'),
        ('completed', 'Hoàn thành'),
        ('canceled', 'Hủy hợp đồng')
    ]
    booking = models.OneToOneField(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='contract')
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
    data = models.JSONField(default=dict, blank=True)

    def clean(self):
        # Chặn update khi đã completed
        if self.completed_at is not None:
            if self.pk:
                old = Contract.objects.get(pk=self.pk)
                if old.completed_at is not None:
                    raise ValidationError("Contract đã hoàn thành, không thể cập nhật.")
    def save(self, *args, **kwargs):
        is_completed_now = (
            self.landlord_completed and
            self.tenant_completed and
            not self.completed_at
        )

        self.full_clean()  # Kiểm tra không được update khi đã completed

        if is_completed_now:
            # Gán completed_at tạm thời vì updated_at chưa có
            self.completed_at = timezone.now()
            self.status = 'completed'

            # Lưu snapshot vào JSONField
            self.data = {
                "landlord_fullname": self.landlord.infor.full_name,
                "landlord_email": self.landlord.email,
                "landlord_city": self.landlord.infor.city,
                "landlord_district": self.landlord.infor.district,
                "landlord_ward": self.landlord.infor.ward,
                "landlord_address_detail": self.landlord.infor.address_detail,
                "landlord_phone_number": self.landlord.infor.phone_number,
                "landlord_national_id": self.landlord.infor.national_id,
                "landlord_national_id_date": self.landlord.infor.national_id_date,
                "landlord_national_id_address": self.landlord.infor.national_id_address,
                "landlord_id_front_image": self.landlord.infor.id_front_image,
                "landlord_id_back_image": self.landlord.infor.id_back_image,
                "landlord_bank_name": self.landlord.infor.bank_name or "",
                "landlord_bank_account": self.landlord.infor.bank_account or "",
                "landlord_bank_branch": self.landlord.infor.bank_branch or "",

                "tenant_fullname": self.tenant.infor.full_name,
                "tenant_email": self.tenant.email,
                "tenant_city": self.tenant.infor.city,
                "tenant_district": self.tenant.infor.district,
                "tenant_ward": self.tenant.infor.ward,
                "tenant_address_detail": self.tenant.infor.address_detail,
                "tenant_phone_number": self.tenant.infor.phone_number,
                "tenant_national_id": self.tenant.infor.national_id,
                "tenant_national_id_date": self.tenant.infor.national_id_date,
                "tenant_national_id_address": self.tenant.infor.national_id_address,
                "tenant_id_front_image": self.tenant.infor.id_front_image,
                "tenant_id_back_image": self.tenant.infor.id_back_image,
                "tenant_bank_name": self.tenant.infor.bank_name or "",
                "tenant_bank_account": self.tenant.infor.bank_account or "",
                "tenant_bank_branch": self.tenant.infor.bank_branch or "",

                "room_city": self.room.house.city,
                "room_district": self.room.house.district,
                "room_ward": self.room.house.ward,
                "room_address_detail" : self.room.house.address_detail,
                "room_type": self.room.room_type,
                "room_price": self.room.price,
                "room_deposit": self.room.deposit,
                "room_electric": self.room.electric,
                "room_water": self.room.water,
                "room_service_price": self.room.service_price,
                "room_area": self.room.area,
                "room_amenities": self.room.amenities,
                "room_description": self.room.description,
                "start_date": self.start_date.isoformat() if self.start_date else None,
                "end_date": self.end_date.isoformat() if self.end_date else None,
                "payment_day": self.payment_day,
                "terms_landlord": self.terms_landlord,
                "terms_tenant": self.terms_tenant,
            }

        super().save(*args, **kwargs)

        # Đảm bảo completed_at trùng với updated_at
        if self.completed_at and self.completed_at != self.updated_at:
            Contract.objects.filter(pk=self.pk).update(completed_at=self.updated_at)
            self.completed_at = self.updated_at