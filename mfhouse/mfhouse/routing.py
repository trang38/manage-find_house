from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from websocket_notifications.routing import websocket_urlpatterns
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mfhouse.settings')
from django.core.asgi import get_asgi_application
application = ProtocolTypeRouter(
    {"http": get_asgi_application(),
     "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
     }
)