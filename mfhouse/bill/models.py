from django.db import models

from constract.models import Contract

# Create your models here.
class Payment(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='payments')
    electric_num = models.IntegerField(null=True, blank=True)
    water_fee = models.IntegerField(null=True, blank=True)
    extra_fees = models.IntegerField(null=True, blank=True)
    total_amount = models.IntegerField(null=True, blank=True)
    confirm_paid = models.BooleanField(default=False)
    confirm_receive = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_total_amount(self):
        if self.contract:  # Ensure contract is not None
            self.total_amount = self.contract.room_price + \
                                (self.electric_num or 0) * self.contract.room_electric + \
                                (self.water_fee or 0) + \
                                self.contract.room_service_price + \
                                (self.extra_fees or 0)
        else:
            raise ValueError("Contract is not set for this payment.")
        
class Refund(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name='refunds')
    refund_amount = models.IntegerField(null=True,blank=True)
    refund_reason = models.CharField(max_length=255, null=True, blank=True)
    confirm_paid = models.BooleanField(default=False)
    confirm_receive = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
