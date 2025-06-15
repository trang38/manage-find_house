from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions

# from noti.models import Notification
from noti.models import Notification
from constract.models import Contract
from mfhouse.permissions import CannotDeleteBooking
from .models import Booking
from .serializers import BookingSerializer
# from mfhouse.events import BookingCreatedLandlordHandler, BookingCreatedTenantHandler, BookingAcceptedLandlordHandler, BookingAcceptedTenantHandler, BookingCanceledLandlordHandler, BookingCanceledTenantHandler, BookingDeclinedLandlordHandler, BookingDeclinedTenantHandler
import os
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.core.mail import send_mail
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
# import snitch
class BookingFilter(filters.FilterSet):
    owner_id = filters.NumberFilter(field_name="post__room__house__owner__id")
    tenant_id = filters.NumberFilter(field_name="tenant")
    status = filters.CharFilter(field_name="status")
    room = filters.NumberFilter(field_name="post__room__id")

    class Meta:
        model = Booking
        fields = ['owner_id', 'tenant_id', 'status', 'room']
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, CannotDeleteBooking]
    filter_backends = [DjangoFilterBackend]
    filterset_class = BookingFilter
    
    def perform_create(self, serializer):
        booking = serializer.save(tenant=self.request.user)
        post = booking.post
        Notification.objects.create(receiver=post.room.house.owner, 
                                    message=f"{self.request.user.username} đã đặt phòng {post.room.room_name} tại {post.room.house.name}",
                                    type="booking")
        
        # send_mail(
        #         subject=f"Phòng {post.room.room_name} tại nhà {post.room.house.name} có một yêu cầu đặt phòng mới",
        #         message=f"Phòng {post.room.room_name} tại nhà {post.room.house.name} đã nhận được một yêu cầu đặt phòng mới từ {self.request.user.username}. Vui lòng kiểm tra website để biết thêm chi tiết.",
        #         from_email=os.getenv('EMAIL_HOST_USER'),
        #         recipient_list=[post.room.house.owner.email],
        #         fail_silently=False,
        #     )
        
        # send_mail(
        #         subject=f"Đặt phòng thành công",
        #         message=f"Bạn đã đặt thành công 1 phòng tại địa chỉ: {post.room.house.address_detail}. Vui lòng chờ chủ nhà xác nhận yêu cầu đặt phòng của bạn. Nếu có bất kỳ thắc mắc nào hãy liên hệ với chủ nhà qua website.",
        #         from_email=os.getenv('EMAIL_HOST_USER'),
        #         recipient_list=[self.request.user.email],
        #         fail_silently=False,
        #     )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tenant = request.user
        post = serializer.validated_data.get('post')

        if Booking.objects.filter(tenant=tenant, post=post, status__in=['pending', 'accepted']).exists():
            return Response({'detail': 'Bạn đã gửi yêu cầu đặt phòng này rồi.'},
                            status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)
    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.is_staff:
            return qs 
        return qs.filter(
            Q(tenant=user) |
            Q(post__room__house__owner=user)
        ).order_by('-updated_at')
    
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
        Notification.objects.create(receiver=post.room.house.owner, 
                                    message=f"Người dùng {self.request.user.username} đã hủy bỏ yêu cầu đặt phòng {post.room.room_name} tại {post.room.house.name}",
                                    type="booking")
        
        # send_mail(
        #         subject=f"Một yêu cầu đặt phòng đã bị hủy bỏ",
        #         message=f"Người dùng {self.request.user.username} đã hủy bỏ yêu cầu đặt phòng {post.room.room_name} tại {post.room.house.name}. Vui lòng kiểm tra website để biết thêm chi tiết.",
        #         from_email=os.getenv('EMAIL_HOST_USER'),
        #         recipient_list=[post.room.house.owner.email],
        #         fail_silently=False,
        #     )

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

        Notification.objects.create(receiver=booking.tenant, 
                                    message=f"Yêu cầu đặt phòng tại bài đăng {booking.post.title} chấp nhận. Vui lòng đợi chủ nhà tạo hợp đồng.",
                                    type="booking")
        
        # send_mail(
        #         subject=f"Yêu cầu đặt phòng của bạn đã được chấp nhận",
        #         message=f"Yêu cầu đặt phòng tại bài đăng {booking.post.title} của bạn lúc {booking.booking_at} đã được chấp nhận. Vui lòng kiểm tra website để biết thêm chi tiết và hoàn thiện hợp đồng.",
        #         from_email=os.getenv('EMAIL_HOST_USER'),
        #         recipient_list=[booking.tenant.email],
        #         fail_silently=False,
        #     )
        
        # send_mail(
        #         subject=f"Tạo hợp đồng mới",
        #         message=f"Bạn đã chấp nhận yêu cầu đặt phòng của {booking.tenant.username}. Vui lòng truy cập website để hoàn thiện hợp đồng.",
        #         from_email=os.getenv('EMAIL_HOST_USER'),
        #         recipient_list=[self.request.user.email],
        #         fail_silently=False,
        #     )        
        
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

        Notification.objects.create(receiver=booking.tenant, 
                                    message=f"Phòng bạn đặt tại bài đăng {booking.post.title} đã bị từ chối.",
                                    type="booking")
        
        # send_mail(
        #         subject=f"Yêu cầu đặt phòng đã bị từ chối",
        #         message=f"Yêu cầu đặt phòng tại bài đăng {booking.post.title} của bạn lúc {booking.booking_at} đã bị từ chối. Bạn có thể truy cập website và tìm kiếm nhà trọ phù hợp hơn.",
        #         from_email=os.getenv('EMAIL_HOST_USER'),
        #         recipient_list=[booking.tenant.email],
        #         fail_silently=False,
        #     )
        
        return Response({'detail': 'Booking đã bị từ chối.'}, status=status.HTTP_200_OK)