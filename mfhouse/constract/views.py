from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from mfhouse.permissions import CannotDeleteCompletedContract, IsLandlord
from .models import Contract
from .serializers import ContractSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters


class ContractFilter(filters.FilterSet):
    landlord = filters.NumberFilter(field_name="landlord")
    tenant = filters.NumberFilter(field_name="tenant")
    booking = filters.NumberFilter(field_name="booking")

    class Meta:
        model = Contract
        fields = ['landlord', 'tenant', 'booking']

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all().order_by('-updated_at')
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated, IsLandlord, CannotDeleteCompletedContract]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ContractFilter
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'infor') or self.request.user.infor.role != 'landlord':
            raise PermissionDenied("Only landlords can create contracts.")
        serializer.save()

    @action(detail=True, methods=['post'])
    def request_revision(self, request, pk=None):
        contract = self.get_object()
        user = request.user

        reason = request.data.get('reason', '')
        if user == contract.tenant:
            contract.revision_requested_tenant = True
            contract.landlord_completed = False
        elif user == contract.landlord:
            contract.revision_requested_lanlord = True
            contract.tenant_completed = False
        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        contract.revision_reason = reason
        contract.updated_at = timezone.now()
        contract.save()
        return Response({'message': 'Revision requested'})

    @action(detail=True, methods=['post'])
    def mark_landlord_completed(self, request, pk=None):
        contract = self.get_object()
        if request.user != contract.landlord:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        contract.landlord_completed = True
        contract.revision_requested_tenant = False
        contract.updated_at = timezone.now()
        contract.save()
        return Response({'message': 'Landlord completed'})

    @action(detail=True, methods=['post'])
    def mark_tenant_completed(self, request, pk=None):
        contract = self.get_object()
        if request.user != contract.tenant:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        contract.tenant_completed = True
        contract.revision_requested_landlord = False
        contract.updated_at = timezone.now()
        contract.save()
        return Response({'message': 'Tenant completed'})
    
    @action(detail=True, methods=['post'])
    def approve_final(self, request, pk=None):
        contract = self.get_object()
        if request.user != contract.landlord:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        if not contract.landlord_completed or not contract.tenant_completed:
            return Response({'detail': 'landlord or tenant has not completed the contract'}, status=status.HTTP_400_BAD_REQUEST)
        if contract.status == 'completed':
            return Response({'detail': 'the contract has been completed.'}, status=status.HTTP_400_BAD_REQUEST)
        
        contract.landlord_confirm = True
        contract.updated_at = timezone.now()
        contract.save()
        return Response({'message': 'Contract has been completed'})
    

    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        contract = self.get_object()

        if contract.status in ['canceled', 'ended']:
            return Response({'error': 'Không thể gia hạn hợp đồng đã huỷ hoặc đã kết thúc.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if contract.status != 'completed':
            return Response({'error': 'Chỉ có thể gia hạn hợp đồng đã hoàn thành.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if contract.end_date < date.today():
            return Response({'error': 'Hợp đồng đã quá hạn, không thể gia hạn.'},
                            status=status.HTTP_400_BAD_REQUEST)

        new_end_date = request.data.get('new_end_date')
        if not new_end_date:
            return Response({'error': 'Vui lòng cung cấp ngày kết thúc mới (new_end_date).'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            contract.end_date = new_end_date
            contract.full_clean()  # đảm bảo chạy qua các check trong model
            contract.save(update_fields=['end_date'])
            return Response({'message': 'Gia hạn hợp đồng thành công.', 'new_end_date': new_end_date})
        except ValidationError as e:
            return Response({'error': e.message_dict}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        contract = self.get_object()
        if request.user != contract.landlord and request.user != contract.tenant:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        if contract.status in ['canceled', 'end']:
            return Response({'detail': 'can not cancel the contract which be canceled or ended'}, status=status.HTTP_400_BAD_REQUEST)
        now = timezone.now().date()
        if contract.status == 'creating':
            contract.status = 'canceled'
        if contract.status == 'completed' and contract.completed_at and now < contract.end_date:
            contract.status = 'end'
            contract.end_at = now
        contract.save()
        return Response({'message': 'Contract has been canceled.'})
