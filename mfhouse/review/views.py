from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets

from noti.models import Notification
from .models import Rating, RoomFeedback
from .serializers import RatingSerializer, RoomFeedbackSerializer
from mfhouse.permissions import IsTenantInContract, IsLandlordInContract
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from noti.utils import send_notification_ws

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsTenantInContract]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['contract']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        instance = serializer.save()
        notification = Notification.objects.create(
            receiver=instance.contract.landlord,
            message=f"{instance.contract.tenant.username} đã đánh giá về phòng {instance.contract.room.room_name} - nhà {instance.contract.room.house.name}.",
            type="contract"
        )
        send_notification_ws(notification)

    def perform_update(self, serializer):
        instance = serializer.save()
        notification = Notification.objects.create(
            receiver=instance.contract.landlord,
            message=f"{instance.contract.tenant.username} đã cập nhật đánh giá về phòng {instance.contract.room.room_name} - nhà {instance.contract.room.house.name}.",
            type="contract"
        )
        send_notification_ws(notification)

class RoomFeedbackViewSet(viewsets.ModelViewSet):
    queryset = RoomFeedback.objects.all()
    serializer_class = RoomFeedbackSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsLandlordInContract]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['response_to_rating']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        instance = serializer.save()
        notification = Notification.objects.create(
            receiver=instance.contract.tenant,
            message=f"Chủ nhà đã phản hồi đánh giá của bạn về phòng {instance.contract.room.room_name} - nhà {instance.contract.room.house.name}.",
            type="contract"
        )
        send_notification_ws(notification)

    def perform_update(self, serializer):
        instance = serializer.save()
        notification = Notification.objects.create(
            receiver=instance.contract.tenant,
            message=f"Chủ nhà đã cập nhật phản hồi đánh giá của bạn về phòng {instance.contract.room.room_name} - nhà {instance.contract.room.house.name}.",
            type="contract"
        )
        send_notification_ws(notification)