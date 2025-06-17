from django.shortcuts import render

# Create your views here.
from datetime import datetime, date
from apscheduler.schedulers.background import BackgroundScheduler
from constract.models import Contract
from django.core.mail import send_mail
from noti.models import Notification
from noti.utils import send_notification_ws
import os

def start():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_contract_date, 'cron', hour='16', minute=0)
    scheduler.add_job(check_payment_day, 'cron', hour='16', minute=0)
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
            room_name = contract.room.room_name
            house_name = contract.room.house.name
            print(days)
            if days == 0:
                contract.status = 'end'
            
            notification = Notification.objects.create(receiver=contract.tenant, 
                            message=f"Còn {days} ngày nữa hợp đồng của phòng {contract.room.room_name}- nhà {contract.room.house.name} sẽ hết hạn.",
                            type="contract")
            send_notification_ws(notification)
            
            notification = Notification.objects.create(receiver=contract.landlord, 
                            message=f"Còn {days} ngày nữa hợp đồng của phòng {contract.room.room_name}- nhà {contract.room.house.name} sẽ hết hạn.",
                            type="contract")
            send_notification_ws(notification)
            send_mail(
                subject=f"Hợp đồng của phòng {room_name} tại nhà {house_name} sắp hết hạn",
                message=f"Hợp đồng của bạn tại phòng {room_name} tại nhà {house_name} sẽ hết hạn sau {days} ngày.",
                from_email=os.getenv('EMAIL_HOST_USER'),
                recipient_list=[landlord_email, tenant_email],
                fail_silently=False,
            )

def check_payment_day():
    today = date.today()
    contracts = Contract.objects.filter(status='completed')

    for contract in contracts:
        if contract.payment_day == today.day:
            landlord_email = contract.landlord.email
            room_name = contract.room.room_name
            house_name = contract.room.house.name

            notification = Notification.objects.create(
                receiver=contract.landlord,
                message=f"Hôm nay là ngày thanh toán tiền phòng {room_name} - nhà {house_name}.",
                type="payment"
            )
            send_notification_ws(notification)

            send_mail(
                subject=f"Đến hạn thanh toán phòng {room_name} - nhà {house_name}",
                message=f"Hôm nay ({today.strftime('%d/%m')}) là ngày thanh toán hợp đồng của phòng {room_name} tại nhà {house_name}. Vui lòng kiểm tra thanh toán từ người thuê.",
                from_email=os.getenv('EMAIL_HOST_USER'),
                recipient_list=[landlord_email],
                fail_silently=False,
            )
