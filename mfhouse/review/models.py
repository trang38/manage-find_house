from django.db import models
from django.contrib.auth.models import User
from constract.models import Contract
from rest_framework.exceptions import ValidationError
# Create your models here.
class Rating(models.Model):
    RATING_CHOICES = [
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
    ]
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ratings")
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="ratings")
    rating = models.PositiveIntegerField(choices=RATING_CHOICES)  
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ('contract', 'tenant')

class RoomFeedback(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="feedbacks")
    landlord = models.ForeignKey(User, on_delete=models.CASCADE, related_name="feedbacks")

    feedback = models.TextField()
    response_to_rating = models.ForeignKey(Rating, on_delete=models.CASCADE, null=True, blank=True, related_name="responses")
    created_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ('response_to_rating', 'landlord')