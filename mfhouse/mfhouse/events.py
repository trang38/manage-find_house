from websocket_notifications.snitch.backends import WebSocketNotificationBackend
from snitch.backends import EmailNotificationBackend
# from snitch.handlers import EventHandler
import snitch
from django.contrib.auth.models import User
from house.models import Room
# create events relating to Booking
# when tenant book a room
@snitch.register('booking_created_landlord') 
class BookingCreatedLandlordHandler(snitch.EventHandler):
    # template = '{actor} đã đặt phòng {target.room_name} tại nhà {target.house.name}'
    # notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    # ephemeral = False
    title = '{actor} đã đặt phòng {target.room_name}'
    text = '{actor} đã đặt phòng {target.room_name} tại nhà {target.house.name}'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False
    notification_creation_async = False 
    template_email_async = False  
    template_email_kwargs = {
        'template_name': 'snitch/email/booking_created_landlord.txt',  
    }
    def audience(self):
        return User.objects.filter(pk=self.event.target.house.owner.pk)

    def should_notify(self, receiver):
        # Cho phép tạo notification
        return True

    def should_send(self, receiver):
        print("Dispatch event booking_created_landlord done")
        return True
    def get_title(self):
        return self.title.format(
            actor=self.event.actor.username,
            target=self.event.target
        )

    def get_text(self):
        return self.text.format(
            actor=self.event.actor.username,
            target=self.event.target
        )
    def get_email_context(self):
        return {
            'actor': self.event.actor,
            'target': self.event.target,
            'receiver': self.event.target.house.owner,
        }

@snitch.register('booking_created_tenant')
class BookingCreatedTenantHandler(snitch.EventHandler):
    template = 'Bạn đã đặt phòng {target.room_name} tại nhà {target.house.name}'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False
    def audience(self):
        # Trả về người nhận là chủ nhà
        return User.objects.filter(pk=self.event.actor.pk)

    def should_notify(self, receiver):
        # Cho phép tạo notification
        return True

    def should_send(self, receiver):
        # Cho phép gửi notification (email/websocket)
        return True
    
# when tenant cancel booking
@snitch.register('booking_canceled_landlord')
class BookingCanceledLandlordHandler(snitch.EventHandler):
    template = '{actor} đã hủy yêu cầu đặt phòng {target.room_name} tại nhà {target.house.name}'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False

@snitch.register('booking_canceled_tenant')
class BookingCanceledTenantHandler(snitch.EventHandler):
    template = 'Bạn đã hủy yêu cầu đặt phòng {target.room_name} tại nhà {target.house.name}'
    notification_backends = [WebSocketNotificationBackend]
    ephemeral = False

# when landlord accept booking
@snitch.register('booking_accepted_landlord') 
class BookingAcceptedLandlordHandler(snitch.EventHandler):
    template = 'Bạn đã chập nhận yêu cầu đặt phòng {target.room_name} của {actor} tại nhà {target.house.name}. Hãy tạo một hợp đồng thuê nhà mới.'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False

@snitch.register('booking_accepted_tenant') 
class BookingAcceptedTenantHandler(snitch.EventHandler):
    template = 'Yêu cầu đặt phòng {target.room_name} tại nhà {target.house.name} của bạn đã được chấp nhận, vui lòng chờ chủ nhà tạo hợp đồng thuê nhà, và sau đó hoàn thành hợp đồng thuê'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False

# when landlord decline booking
@snitch.register('booking_declined_landlord') 
class BookingDeclinedLandlordHandler(snitch.EventHandler):
    template = 'Bạn đã từ chối yêu cầu đặt phòng {target.room_name} của {actor} tại nhà {target.house.name}.'
    notification_backends = [WebSocketNotificationBackend]
    ephemeral = False

@snitch.register('booking_declined_tenant') 
class BookingDeclinedTenantHandler(snitch.EventHandler):
    template = 'Yêu cầu đặt phòng {target.room_name} tại nhà {target.house.name} đã bị từ chối.'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False