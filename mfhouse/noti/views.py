from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Notification
from noti.serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(receiver=user).order_by('-created_at')