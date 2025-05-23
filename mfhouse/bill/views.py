from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions

from mfhouse.utils import CannotDeletePay
from .models import Payment, Refund
from .serializers import PaymentSerializer, RefundSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, CannotDeletePay]

    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(contract__landlord=user) | Payment.objects.filter(contract__tenant=user)


class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.all()
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated, CannotDeletePay]

    def get_queryset(self):
        user = self.request.user
        return Refund.objects.filter(contract__landlord=user) | Refund.objects.filter(contract__tenant=user)