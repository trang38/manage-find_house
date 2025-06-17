from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from mfhouse.permissions import CannotDeletePay
from .models import Payment
from .serializers import PaymentSerializer
from rest_framework.decorators import action
from noti.models import Notification
from django.core.mail import send_mail
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
import os
from noti.utils import send_notification_ws

class PaymentFilter(filters.FilterSet):
    contract = filters.NumberFilter(field_name="contract")

    class Meta:
        model  = Payment
        fields = ['contract'
                  ]
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-updated_at')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, CannotDeletePay]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PaymentFilter

    def perform_create(self, serializer):
        payment = serializer.save()
        contract = payment.contract
        from noti.models import Notification
        notification = Notification.objects.create(
            receiver=contract.tenant,
            message=f"Chủ trọ {contract.landlord.username} đã tạo hóa đơn mới cho phòng {contract.room.room_name} - nhà {contract.room.house.name}.",
            type="bill"
        )
        send_notification_ws(notification)

        
    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(contract__landlord=user) | Payment.objects.filter(contract__tenant=user)
    
    @action(detail=False, methods=['get'], url_path='landlord-bills')
    def landlord_bills(self, request):
        user = request.user
        bills = Payment.objects.filter(contract__landlord=user).order_by('-updated_at')
        serializer = self.get_serializer(bills, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='tenant-bills')
    def tenant_bills(self, request):
        user = request.user
        bills = Payment.objects.filter(contract__tenant=user).order_by('-updated_at')
        serializer = self.get_serializer(bills, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_confirm_paid(self, request, pk=None):
        bill = self.get_object()
        if request.user != bill.contract.tenant:
            return Response({'error': 'not tenant'}, status=status.HTTP_403_FORBIDDEN)
        bill.confirm_paid = True
        bill.updated_at = timezone.now()
        bill.save()

        notification = Notification.objects.create(receiver=bill.contract.landlord, 
                            message=f"Khách {bill.contract.tenant.username} đã xác nhận đã thanh toán hóa đơn của phòng {bill.contract.room.room_name} - nhà {bill.contract.room.house.name}.",
                            type="bill")
        send_notification_ws(notification)
        # send_mail(
        #         subject=f"Một hóa đơn đã được thanh toán",
        #         message=f"Khách {contract.tenant.username} đã xác nhận đã thanh toán hóa đơn của phòng {contract.room.room_name} - nhà {contract.room.house.name}.. Vui lòng kiểm tra website để biết thêm chi tiết.",
        #         from_email=os.getenv('EMAIL_HOST_USER'),
        #         recipient_list=[contract.landlord.email],
        #         fail_silently=False,
        #     )

        return Response({'message': 'Bill has been paid'})


    @action(detail=True, methods=['post'])
    def mark_confirm_receive(self, request, pk=None):
        bill = self.get_object()
        if request.user != bill.contract.landlord:
            return Response({'error': 'not landlord'}, status=status.HTTP_403_FORBIDDEN)
        bill.confirm_receive = True
        bill.updated_at = timezone.now()
        bill.save()

        notification = Notification.objects.create(receiver=bill.contract.tenant, 
                            message=f"Chủ trọ {bill.contract.landlord.username} đã nhận được tiền.",
                            type="bill")
        send_notification_ws(notification)
        
        return Response({'message': 'Bill has been receive'})