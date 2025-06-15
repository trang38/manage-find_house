from datetime import date
from django.utils import timezone
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from house.models import Room
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from dateutil.relativedelta import relativedelta
from book.models import Booking
from django.forms.models import model_to_dict
# Create your models here.
class Contract(models.Model):
    STATUS = [
        ('creating', 'Đang tạo hợp đồng'),
        # ('waiting_tenant', 'Chờ tenant xác nhận'),
        # ('waiting_landlord', 'Chờ landlord xác nhận'),
        ('canceled', 'Hủy hợp đồng'),
        ('completed', 'Hoàn thành'),
        ('end', 'Kết thúc hợp đồng')
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
    landlord_confirm = models.BooleanField(default=False) # landlord xác nhận thôg tin của tenant ok hết
    tenant_confirm = models.BooleanField(default=False)
    revision_requested_lanlord = models.BooleanField(default=False) # landlord yêu cầu tenant sửa hợp đồng
    revision_requested_tenant = models.BooleanField(default=False) # tenant yêu cầu landlord sửa hợp đồng
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
    end_at = models.DateTimeField(null=True, blank=True) 
    status = models.CharField(max_length=20, choices=STATUS, default='creating')
    data = models.JSONField(default=dict, blank=True)

    def clean(self):
        # Chặn update khi đã completed
        # if self.completed_at is not None:
        if self.pk:
            old = Contract.objects.get(pk=self.pk)
            if old.completed_at is not None:
                current_data = model_to_dict(self)
                old_data = model_to_dict(old)

                ignored_fields = ['id', 'end_date', 'updated_at', 'created_at', 'completed_at']
                changed_fields = []

                for key in current_data:
                    if key in ignored_fields:
                        continue
                    if current_data[key] != old_data[key]:
                        changed_fields.append(key)

                if changed_fields:
                    raise ValidationError(f"Hợp đồng đã hoàn thành, chỉ được thay đổi 'end_date'. Các trường bị thay đổi: {', '.join(changed_fields)}.")
            # Chặn sửa nếu đã bị hủy
            if old.status == 'canceled':
                raise ValidationError("Hợp đồng đã bị hủy, không thể cập nhật.")

            # Chặn sửa nếu đã kết thúc hợp đồng sớm
            if old.status == 'end':
                raise ValidationError("Hợp đồng đã bị chấm dứt, không thể cập nhật.")
    def save(self, *args, **kwargs):
        if self.booking:
            if not self.room:
                self.room = self.booking.post.room
            if not self.tenant:
                self.tenant = self.booking.tenant
            if not self.landlord:
                self.landlord = self.booking.post.room.house.owner
        is_completed_now = (
            self.landlord_completed and
            self.tenant_completed and
            self.landlord_confirm and
            self.tenant_confirm and
            not self.completed_at
        )

        self.full_clean()  

        if is_completed_now:
            # Gán completed_at tạm thời vì updated_at chưa có
            self.completed_at = timezone.now()
            self.status = 'completed'
            self.booking.post.is_active = False
            self.booking.post.save(update_fields=['is_active'])
            self.room.is_posted = False
            self.room.status = 'occupied'
            self.room.save(update_fields=['is_posted', 'status'])
            
            # Lưu snapshot vào JSONField
            self.data = {
                "landlord_fullname": self.landlord.infor.full_name,
                "landlord_email": self.landlord.email,
                "landlord_ward": self.landlord.infor.ward.path_with_type,
                "landlord_address_detail": self.landlord.infor.address_detail,
                "landlord_phone_number": self.landlord.infor.phone_number,
                "landlord_national_id": self.landlord.infor.national_id,
                "landlord_national_id_date": self.landlord.infor.national_id_date.isoformat(),
                "landlord_national_id_address": self.landlord.infor.national_id_address,
                "landlord_id_front_image": self.landlord.infor.id_front_image.url,
                "landlord_id_back_image": self.landlord.infor.id_back_image.url,
                "landlord_bank_name": self.landlord.infor.bank_name or "",
                "landlord_bank_account": self.landlord.infor.bank_account or "",
                "landlord_bank_account_name": self.landlord.infor.bank_account_name or "",

                "tenant_fullname": self.tenant.infor.full_name,
                "tenant_email": self.tenant.email,
                "tenant_ward": self.tenant.infor.ward.path_with_type,
                "tenant_address_detail": self.tenant.infor.address_detail,
                "tenant_phone_number": self.tenant.infor.phone_number,
                "tenant_national_id": self.tenant.infor.national_id,
                "tenant_national_id_date": self.tenant.infor.national_id_date.isoformat(),
                "tenant_national_id_address": self.tenant.infor.national_id_address,
                "tenant_id_front_image": self.tenant.infor.id_front_image.url,
                "tenant_id_back_image": self.tenant.infor.id_back_image.url,
                "tenant_bank_name": self.tenant.infor.bank_name or "",
                "tenant_bank_account": self.tenant.infor.bank_account or "",
                "tenant_bank_account_name": self.tenant.infor.bank_account_name or "",

                "room_ward": self.room.house.ward.path_with_type,
                "room_address_detail" : self.room.house.address_detail,
                "room_type": self.room.room_type,
                "room_price": self.room.price,
                "room_deposit": self.room.deposit,
                "room_electric": self.room.electric,
                "room_water": self.room.water,
                "room_service_price": self.room.service_price,
                "room_area": float(self.room.area),
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

        

    @property
    def remaining_time(self):
        if not self.end_date: 
            return (0, 0)
        today = date.today()
        if self.end_date < today:
            return (0, 0)
        delta = relativedelta(self.end_date, today)
        return (delta.months + delta.years * 12, delta.days)
    
    @property
    def is_expiring_soon(self):
        if not self.end_date:
            return False
        today = date.today()
        remaining_days = (self.end_date - today).days
        if remaining_days == 0 and self.status != 'end':
            self.status = 'end'
            self.save(update_fields=['status'])
        if remaining_days < 30:
            if self.room and self.room.status != 'checkout_soon':
                self.room.status = 'checkout_soon'
                self.room.save(update_fields=['status'])
        return remaining_days == 30 or remaining_days == 7 or remaining_days == 25 or remaining_days == 26