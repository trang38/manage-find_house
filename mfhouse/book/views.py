from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions

# from noti.models import Notification
from mfhouse.permissions import CannotDeleteBooking
from .models import Booking
from .serializers import BookingSerializer
from mfhouse.events import BookingCreatedLandlordHandler, BookingCreatedTenantHandler, BookingAcceptedLandlordHandler, BookingAcceptedTenantHandler, BookingCanceledLandlordHandler, BookingCanceledTenantHandler, BookingDeclinedLandlordHandler, BookingDeclinedTenantHandler
import os
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, CannotDeleteBooking]

    def perform_create(self, serializer):
        booking = serializer.save(tenant=self.request.user)
        post = booking.post
        # Notification.objects.create(actor=post.room.house.owner, 
        #                             message=f"{self.request.user.username} đã đặt phòng {post.room.room_name} tại {post.room.house.name}",
        #                             type="booking")
        BookingCreatedLandlordHandler.notify(
            actor=self.request.user, 
            target=post.room, 
            recipients = [post.room.house.owner],
            email_subject="Một phòng mới được đặt",
            email_from=os.getenv('EMAIL_HOST_USER'),
            )
        BookingCreatedTenantHandler.notify(
            actor=self.request.user, 
            target=post.room, 
            recipients = [self.request.user],
            email_subject="Một phòng mới được đặt",
            email_from=os.getenv('EMAIL_HOST_USER'),
            )

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(tenant=user)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.tenant != request.user:
            return Response({'detail': 'Bạn không thể hủy bỏ yêu cầu đặt phòng này'}, status=status.HTTP_403_FORBIDDEN)
        if booking.status != 'pending':
            return Response({'detail':'Chỉ có thể hủy yêu cầu đang chờ.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = 'cancelled'
        booking.updated_at = timezone.now()
        booking.save()

        BookingCanceledLandlordHandler.notify(
            actor=self.request.user, 
            target=booking.post.room, 
            recipients = [booking.post.room.house.owner],
            email_subject="Một yêu cầu đặt phòng đã bị hủy",
            email_from=os.getenv('EMAIL_HOST_USER'),
            )
        BookingCanceledTenantHandler.notify(
            actor=self.request.user, 
            target=booking.post.room, 
            recipients = [self.request.user],
            )
        return Response({'detail': 'Yêu cầu đặt phòng đã được hủy.'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        booking = self.get_object()
        landlord = booking.post.room.house.owner
        if landlord != request.user:
            return Response({'detail': 'Bạn không có quyền chấp nhận booking này.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.status != 'pending':
            return Response({'detail': 'Chỉ có thể chấp nhận các booking đang chờ xử lý.'}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'accepted'
        booking.updated_at = timezone.now()
        booking.save()

        # Tạo hợp đồng tương ứng
        Contract.objects.create(
            booking=booking,
            room=booking.post.room,
            landlord=landlord,
            tenant=booking.tenant,
            status='creating',
        )
        
        BookingAcceptedLandlordHandler.notify(
            actor=booking.tenant, 
            target=booking.post.room, 
            recipients = [self.request.user],
            email_subject="Tạo hợp đồng mới",
            email_from=os.getenv('EMAIL_HOST_USER'),
            )
        BookingAcceptedTenantHandler.notify(
            actor=booking.tenant, 
            target=booking.post.room, 
            recipients = [booking.tenant],
            email_subject="Yêu cầu đặt phòng được chấp nhận",
            email_from=os.getenv('EMAIL_HOST_USER'),
            )
        return Response({'detail': 'Booking đã được chấp nhận và hợp đồng đã được tạo.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        booking = self.get_object()
        landlord = booking.post.room.house.owner
        if landlord != request.user:
            return Response({'detail': 'Bạn không có quyền từ chối booking này.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.status != 'pending':
            return Response({'detail': 'Chỉ có thể từ chối các booking đang chờ xử lý.'}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'declined'
        booking.updated_at = timezone.now()
        booking.save()

        BookingCreatedLandlordHandler.notify(
            actor=booking.tenant, 
            target=booking.post.room, 
            recipients = [self.request.user],
            )
        BookingCreatedTenantHandler.notify(
            actor=booking.tenant, 
            target=booking.post.room, 
            recipients = [booking.tenant],
            email_subject="Yêu càu đặt phòng bị từ chối",
            email_from=os.getenv('EMAIL_HOST_USER'),
            )
        return Response({'detail': 'Booking đã bị từ chối.'}, status=status.HTTP_200_OK)