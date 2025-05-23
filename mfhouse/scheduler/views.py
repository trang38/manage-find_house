from django.shortcuts import render

# Create your views here.
from datetime import datetime, date
from apscheduler.schedulers.background import BackgroundScheduler
from constract.models import Contract
from django.core.mail import send_mail
import os

def start():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_contract_date, 'cron', hour='9', minute=0)
    scheduler.start()

def check_contract_date():
    today = date.today()
    contracts = Contract.objects.filter(
        status='completed',
        # end_date__isnull=False,
        # end_date__gte = today
    )
    for contract in contracts:
        if contract.is_expiring_soon:
            months, days = contract.remaining_time
            tenant_email = contract.tenant.email
            landlord_email = contract.landlord.email
            # tenant_email = contract.data.get('tenant_email')
            # landlord_email = contract.data.get('landlord_email')
            room_name = contract.room.room_name
            house_name = contract.room.house.name

            send_mail(
                subject=f"Hợp đồng của phòng {room_name} tại nhà {house_name} sắp hết hạn",
                message=f"Hợp đồng của bạn tại phòng {room_name} tại nhà {house_name} sẽ hết hạn sau {days} ngày.",
                from_email=os.getenv('EMAIL_HOST_USER'),
                recipient_list=[landlord_email, tenant_email],
                fail_silently=False,
            )
