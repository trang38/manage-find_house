from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Rating, RoomFeedback
from .serializers import RatingSerializer, RoomFeedbackSerializer
from mfhouse.utils import IsTenantInContract, IsLandlordOrTenantInContract
from rest_framework.permissions import IsAuthenticated

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated, IsTenantInContract]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class RoomFeedbackViewSet(viewsets.ModelViewSet):
    queryset = RoomFeedback.objects.all()
    serializer_class = RoomFeedbackSerializer
    permission_classes = [IsAuthenticated, IsLandlordOrTenantInContract]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context