from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions

from mfhouse.utils import CannotDeleteCompletedContract, IsLandlord
from .models import Contract
from .serializers import ContractSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.exceptions import PermissionDenied

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated, IsLandlord, CannotDeleteCompletedContract]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'infor') or self.request.user.infor.role != 'landlord':
            raise PermissionDenied("Only landlords can create contracts.")
        serializer.save()

