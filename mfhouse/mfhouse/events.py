from websocket_notifications.snitch.backends import WebSocketNotificationBackend
from snitch.backends import EmailNotificationBackend
from snitch.handlers import EventHandler
import snitch

# create events relating to Booking

# when tenant book a room
@snitch.register('booking_created_landlord') 
class BookingCreatedLandlordHandler(EventHandler):
    template = '{actor} đã đặt phòng {target.room_name} tại nhà {target.house.name}'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False

@snitch.register('booking_created_tenant')
class BookingCreatedTenantHandler(EventHandler):
    template = 'Bạn đã đặt phòng {target.room_name} tại nhà {target.house.name}'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False

# when tenant cancel booking
@snitch.register('booking_canceled_landlord')
class BookingCanceledLandlordHandler(EventHandler):
    template = '{actor} đã hủy yêu cầu đặt phòng {target.room_name} tại nhà {target.house.name}'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False

@snitch.register('booking_canceled_tenant')
class BookingCanceledTenantHandler(EventHandler):
    template = 'Bạn đã hủy yêu cầu đặt phòng {target.room_name} tại nhà {target.house.name}'
    notification_backends = [WebSocketNotificationBackend]
    ephemeral = False

# when landlord accept booking
@snitch.register('booking_accepted_landlord') 
class BookingAcceptedLandlordHandler(EventHandler):
    template = 'Bạn đã chập nhận yêu cầu đặt phòng {target.room_name} của {actor} tại nhà {target.house.name}. Hãy tạo một hợp đồng thuê nhà mới.'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False

@snitch.register('booking_accepted_tenant') 
class BookingAcceptedTenantHandler(EventHandler):
    template = 'Yêu cầu đặt phòng {target.room_name} tại nhà {target.house.name} của bạn đã được chấp nhận, vui lòng chờ chủ nhà tạo hợp đồng thuê nhà, và sau đó hoàn thành hợp đồng thuê'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False

# when landlord decline booking
@snitch.register('booking_declined_landlord') 
class BookingDeclinedLandlordHandler(EventHandler):
    template = 'Bạn đã từ chối yêu cầu đặt phòng {target.room_name} của {actor} tại nhà {target.house.name}.'
    notification_backends = [WebSocketNotificationBackend]
    ephemeral = False

@snitch.register('booking_declined_tenant') 
class BookingDeclinedTenantHandler(EventHandler):
    template = 'Yêu cầu đặt phòng {target.room_name} tại nhà {target.house.name} đã bị từ chối.'
    notification_backends = [WebSocketNotificationBackend, EmailNotificationBackend]
    ephemeral = False