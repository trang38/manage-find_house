from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from noti.serializers import NotificationSerializer

def send_notification_ws(notification):
    channel_layer = get_channel_layer()
    group_name = f"notification_{notification.receiver.id}"
    serializer = NotificationSerializer(notification)
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "send_notification",
            "notification": serializer.data,
        }
    )