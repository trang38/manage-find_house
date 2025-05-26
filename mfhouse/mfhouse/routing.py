from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from websocket_notifications.routing import websocket_urlpatterns
application = ProtocolTypeRouter(
    {"websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns))}
)