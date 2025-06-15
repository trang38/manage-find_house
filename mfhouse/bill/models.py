from django.db import models

from constract.models import Contract

# Create your models here.
class Payment(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='payments')
    electric_num = models.IntegerField(null=True, blank=True)
    water_fee = models.IntegerField(null=True, blank=True)
    extra_fees = models.IntegerField(null=True, blank=True)
    total_amount = models.IntegerField(null=True, blank=True)
    content = models.CharField(max_length=255, null=True)
    confirm_paid = models.BooleanField(default=False)
    confirm_receive = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_total_amount(self):
        if self.contract:  # Ensure contract is not None
            data = getattr(self.contract, 'data', {}) or {}
            room_price = data.get('room_price', 0)
            room_electric = data.get('room_electric', 0)
            room_service_price = data.get('room_service_price', 0)
            self.total_amount = (
                int(room_price)
                + int(room_electric) * (self.electric_num or 0)
                + (self.water_fee or 0)
                + int(room_service_price)
                + (self.extra_fees or 0)
            )
        else:
            raise ValueError("Contract is not set for this payment.")
        
