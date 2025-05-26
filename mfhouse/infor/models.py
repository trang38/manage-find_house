from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from vi_address.models import City, District, Ward

from mfhouse.permissions import PathAndRename
# Create your models here.

class Infor(models.Model):
    ROLE_CHOICES = (
        ('tenant', 'Tenant'),
        ('landlord', 'Landlord')
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="infor")
    full_name = models.CharField(max_length=800)
    bio = models.CharField(max_length=1000, blank=True, null=True)
    image = models.ImageField(upload_to=PathAndRename("user_images"), default="default.jpg")

    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True, related_name='user')
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True, related_name='user')
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True, blank=True, related_name='user')
    address_detail = models.CharField(max_length=255, blank=True, null=True)

    phone_number = models.CharField(max_length=20, blank=True, null=True)
    national_id = models.CharField(max_length=20, blank=True, null=True)
    national_id_date = models.DateField(blank=True, null=True)
    national_id_address = models.CharField(max_length=255, blank=True, null=True)
    id_front_image = models.ImageField(upload_to=PathAndRename("id_cards"), blank=True, null=True)
    id_back_image = models.ImageField(upload_to=PathAndRename("id_cards"), blank=True, null=True)
    
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    bank_account = models.CharField(max_length=255, blank=True, null=True)
    bank_account_name = models.CharField(max_length=255, blank=True, null=True)

    show_bio = models.BooleanField(default=True)
    show_phone_number = models.BooleanField(default=True)
    show_address = models.BooleanField(default=True)

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='tenant')
    
    def save(self, *args, **kwargs):
        if self.full_name == "" or self.full_name == None:
            self.full_name = self.user.username
        super(Infor, self).save(*args, **kwargs)

