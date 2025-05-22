from django.db import models
from django.contrib.auth.models import User

from infor.models import Infor
# Create your models here.

class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="user")
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="sender")
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="receiver")
    
    message = models.TextField()

    is_read = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['date']
        verbose_name_plural = "Message"

    def __str__(self):
        return f"{self.sender} - {self.receiver}"

    @property
    def sender_infor(self):
        sender_infor = Infor.objects.get(user=self.sender)
        return sender_infor
    @property
    def receiver_infor(self):
        receiver_infor = Infor.objects.get(user=self.receiver)
        return receiver_infor