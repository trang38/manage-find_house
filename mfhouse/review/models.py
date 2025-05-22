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
    # room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="ratings")
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ratings")
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="ratings")
    rating = models.PositiveIntegerField(choices=RATING_CHOICES)  
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class RoomFeedback(models.Model):
    # room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="feedbacks")
    # landlord = models.ForeignKey(User, on_delete=models.CASCADE, related_name="feedbacks")
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="feedbacks")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="feedbacks")

    feedback = models.TextField()
    response_to_rating = models.ForeignKey(Rating, on_delete=models.CASCADE, null=True, blank=True, related_name="responses")
    response_to_feedback = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    created_at = models.DateTimeField(auto_now_add=True)
    def clean(self):

        # Chỉ được phản hồi cho 1 trong 2: Rating hoặc Feedback
        if self.response_to_rating and self.response_to_feedback:
            raise ValidationError("RoomFeedback cannot respond to both a Rating and another Feedback.")
        if not self.response_to_rating and not self.response_to_feedback:
            raise ValidationError("RoomFeedback must respond to either a Rating or another Feedback.")
