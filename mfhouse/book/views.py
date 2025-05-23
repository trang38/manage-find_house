from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions

from mfhouse.utils import CannotDeleteBooking
from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, CannotDeleteBooking]

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(tenant=user)