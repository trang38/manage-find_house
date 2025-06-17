from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from mfhouse.permissions import CannotDeleteCompletedContract
from .models import Contract
from .serializers import ContractSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from datetime import date
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from noti.models import Notification
from django.core.mail import send_mail
from noti.utils import send_notification_ws
import os
from django.http import FileResponse
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from django.shortcuts import get_object_or_404
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import ttfonts
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER



class ContractFilter(filters.FilterSet):
    landlord = filters.NumberFilter(field_name="landlord")
    tenant = filters.NumberFilter(field_name="tenant")
    booking = filters.NumberFilter(field_name="booking")
    room = filters.NumberFilter(field_name="room")

    class Meta:
        model = Contract
        fields = ['landlord', 'tenant', 'booking', 'room']

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all().order_by('-updated_at')
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated, CannotDeleteCompletedContract]
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
            notification = Notification.objects.create(receiver=contract.landlord, 
                            message=f"Người dùng {contract.tenant.username} đã yêu cầu bạn chỉnh sửa lại hợp đồng của phòng {contract.room.room_name} - nhà {contract.room.house.name}.",
                            type="contract")
            send_notification_ws(notification)

        elif user == contract.landlord:
            contract.revision_requested_lanlord = True
            contract.tenant_completed = False
            notification = Notification.objects.create(receiver=contract.tenant, 
                            message=f"Chủ trọ {contract.landlord.username} đã yêu cầu bạn chỉnh sửa lại hợp đồng của phòng {contract.room.room_name} - nhà {contract.room.house.name}.",
                            type="contract")
            send_notification_ws(notification)

        else:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        contract.revision_reason = reason
        contract.tenant_confirm = False
        contract.landlord_confirm = False
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
        notification = Notification.objects.create(receiver=contract.tenant, 
                            message=f"Chủ trọ {contract.landlord.username} đã chỉnh sửa hợp đồng của phòng {contract.room.room_name} - nhà {contract.room.house.name}. Hãy kiểm tra thông tin.",
                            type="contract")
        send_notification_ws(notification)

        return Response({'message': 'Landlord completed'})

    @action(detail=True, methods=['post'])
    def mark_tenant_completed(self, request, pk=None):
        contract = self.get_object()
        if request.user.id != contract.tenant.id:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        contract.tenant_completed = True
        contract.revision_requested_landlord = False
        contract.updated_at = timezone.now()
        contract.save()
        notification = Notification.objects.create(receiver=contract.landlord, 
                            message=f"Người dùng {contract.tenant.username} đã chỉnh sửa hợp đồng của phòng {contract.room.room_name} - nhà {contract.room.house.name}. Hãy kiểm tra lại thông tin.",
                            type="contract")
        send_notification_ws(notification)

        return Response({'message': 'Tenant completed'})
    
    @action(detail=True, methods=['post'])
    def approve_final_landlord(self, request, pk=None):
        contract = self.get_object()
        if request.user != contract.landlord:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        if not contract.landlord_completed or not contract.tenant_completed:
            return Response({'error': 'landlord or tenant has not completed the contract'}, status=status.HTTP_400_BAD_REQUEST)
        if contract.status == 'completed' or contract.status == 'end':
            return Response({'error': 'the contract has been completed.'}, status=status.HTTP_400_BAD_REQUEST)
        
        contract.landlord_confirm = True
        contract.updated_at = timezone.now()
        contract.save()
        notification = Notification.objects.create(receiver=contract.tenant, 
                message=f"Chủ trọ {contract.landlord.username} đã xác nhận thông tin hợp đồng của phòng {contract.room.room_name} - nhà {contract.room.house.name}.",
                type="contract")
        send_notification_ws(notification)

        return Response({'message': 'Contract has been completed'})
    
    @action(detail=True, methods=['post'])
    def approve_final_tenant(self, request, pk=None):
        contract = self.get_object()
        if request.user != contract.tenant:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        if not contract.landlord_completed or not contract.tenant_completed:
            return Response({'error': 'landlord or tenant has not completed the contract'}, status=status.HTTP_400_BAD_REQUEST)
        if contract.status == 'completed' or contract.status == 'end':
            return Response({'error': 'the contract has been completed or ended.'}, status=status.HTTP_400_BAD_REQUEST)
        
        contract.tenant_confirm = True
        contract.updated_at = timezone.now()
        contract.save()
        notification = Notification.objects.create(receiver=contract.landlord, 
                message=f"Khách {contract.tenant.username} đã xác nhận thông tin hợp đồng của phòng {contract.room.room_name} - nhà {contract.room.house.name}.",
                type="contract")
        send_notification_ws(notification)

        return Response({'message': 'Contract has been completed'})
    

    @action(detail=True, methods=['post'])
    def extend(self, request, pk=None):
        contract = self.get_object()
        if request.user != contract.landlord:
            return Response({'error': 'Not landlord'}, status=status.HTTP_403_FORBIDDEN)
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
            contract.full_clean()  
            contract.save(update_fields=['end_date'])
            notification = Notification.objects.create(receiver=contract.tenant, 
                message=f"Chủ trọ {contract.landlord.username} đã gia hạn hợp đồng của phòng {contract.room.room_name} - nhà {contract.room.house.name} tới {new_end_date}.",
                type="contract")
            send_notification_ws(notification)

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
        if request.user == contract.landlord:
            notification = Notification.objects.create(receiver=contract.tenant, 
                message=f"Chủ trọ {contract.landlord.username} đã hủy bỏ hợp đồng của phòng {contract.room.room_name} - nhà {contract.room.house.name}.",
                type="contract")
            send_notification_ws(notification)

        if request.user == contract.tenant:
            notification = Notification.objects.create(receiver=contract.landlord, 
                message=f"Khách {contract.tenant.username} đã hủy bỏ hợp đồng của phòng {contract.room.room_name} - nhà {contract.room.house.name}.",
                type="contract")
            send_notification_ws(notification)

        return Response({'message': 'Contract has been canceled.'})
    
    
    @action(detail=True, methods=['get'], url_path='export_pdf')
    def export_pdf(self, request, pk=None):
        contract = self.get_object()

        if contract.status != 'completed':
            return Response({"detail": "Hợp đồng chưa hoàn tất, không thể xuất PDF."}, status=status.HTTP_400_BAD_REQUEST)

        if request.user != contract.tenant and request.user != contract.landlord:
            return Response({"detail": "Bạn không có quyền truy cập hợp đồng này."}, status=status.HTTP_403_FORBIDDEN)

        pdf_buffer = self._generate_contract_pdf(contract)
        return FileResponse(pdf_buffer, as_attachment=True, filename=f"contract_{contract.pk}.pdf")

    def _generate_contract_pdf(self, contract):
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        x, y = 50, height - 50
        data = contract.data
        pdfmetrics.registerFont(TTFont('Times', 'times.ttf'))
        def draw_line(text, delta=20):
            nonlocal y
            if y < 80:
                p.showPage()
                y = height - 50
                p.setFont("Times", 14)
            p.drawString(x, y, str(text))
            y -= delta

        p.setFont("Times", 14)
        draw_line("HỢP ĐỒNG THUÊ PHÒNG")

        p.setFont("Times", 11)
        draw_line(f"Mã hợp đồng: {contract.pk}")
        draw_line(f"Ngày ký hợp đồng: {contract.completed_at.strftime('%d/%m/%Y') if contract.completed_at else ''}")
        draw_line("")

        draw_line("BÊN CHO THUÊ:")
        draw_line(f"Họ tên: {data.get('landlord_fullname', '')}")
        draw_line(f"SĐT: {data.get('landlord_phone_number', '')}")
        draw_line(f"Email: {data.get('landlord_email', '')}")
        draw_line(f"CMND/CCCD: {data.get('landlord_national_id', '')} ({data.get('landlord_national_id_date', '')})")
        draw_line(f"Nơi cấp: {data.get('landlord_national_id_address', '')}")
        draw_line(f"Địa chỉ: {data.get('landlord_address_detail', '')}, {data.get('landlord_ward', '')}")
        draw_line("")

        draw_line("BÊN THUÊ:")
        draw_line(f"Họ tên: {data.get('tenant_fullname', '')}")
        draw_line(f"SĐT: {data.get('tenant_phone_number', '')}")
        draw_line(f"Email: {data.get('tenant_email', '')}")
        draw_line(f"CMND/CCCD: {data.get('tenant_national_id', '')} ({data.get('tenant_national_id_date', '')})")
        draw_line(f"Nơi cấp: {data.get('tenant_national_id_address', '')}")
        draw_line(f"Địa chỉ: {data.get('tenant_address_detail', '')}, {data.get('tenant_ward', '')}")
        draw_line("")

        draw_line("THÔNG TIN PHÒNG:")
        draw_line(f"Địa chỉ: {data.get('room_address_detail', '')}, {data.get('room_ward', '')}")
        draw_line(f"Loại phòng: {data.get('room_type', '')}")
        draw_line(f"Diện tích: {data.get('room_area', '')} m²")
        draw_line(f"Giá thuê: {data.get('room_price', '')} VNĐ/tháng")
        draw_line(f"Tiền cọc: {data.get('room_deposit', '')} VNĐ")
        draw_line("")

        draw_line("ĐIỀU KHOẢN:")
        draw_line(f"Từ ngày: {data.get('start_date', '')} đến {data.get('end_date', '')}")
        draw_line(f"Ngày thanh toán mỗi tháng: {data.get('payment_day', '')}")
        draw_line("")

        draw_line("Điều khoản từ bên cho thuê:")
        for line in data.get('terms_landlord', '').split('\n'):
            draw_line(line)

        draw_line("")
        draw_line("Điều khoản từ bên thuê:")
        for line in data.get('terms_tenant', '').split('\n'):
            draw_line(line)

        draw_line("")
        draw_line("Hai bên cam kết thực hiện đúng các điều khoản đã ghi trong hợp đồng.")
        draw_line("")
        draw_line("Chữ ký bên cho thuê: _______________________")
        draw_line("Chữ ký bên thuê: ___________________________")

        p.showPage()
        p.save()
        buffer.seek(0)
        return buffer