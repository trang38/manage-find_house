"""
URL configuration for mfhouse project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from infor.views import CurrentUserAPIView, PublicUserAPIView, SearchUserAPIView
from house.views import HouseViewSet, PostViewSet, RoomMediaViewSet, RoomViewSet
from book.views import BookingViewSet
from bill.views import PaymentViewSet, RefundViewSet
from constract.views import ContractViewSet
# from noti.views import NotificationViewSet
from review.views import RatingViewSet, RoomFeedbackViewSet
from websocket_notifications.api.rest_framework import NotificationGroupViewSet


router = DefaultRouter()
router.register(r'houses', HouseViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'room-media', RoomMediaViewSet)
router.register(r'posts', PostViewSet)
router.register(r'bookings', BookingViewSet) # POST /api/bookings/{id}/cancel/  , POST /api/bookings/{id}/accept/ , POST /api/bookings/{id}/decline/
router.register(r'contracts', ContractViewSet)
router.register(r'ratings', RatingViewSet)
router.register(r'room-feedbacks', RoomFeedbackViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'refunds', RefundViewSet)
# router.register(r'notifications', NotificationViewSet, basename='notification')
router.register('websocket-notifications/groups', viewset=NotificationGroupViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('accounts/', include('allauth.urls')), # add urls of all-auth
    path("_allauth/", include("allauth.headless.urls")), # include api endpoints of allauth
    path('api/address/', include('vi_address.urls')), # add urls of vi-address
    path("", include("crud.urls")),
    path('api/users/me/', CurrentUserAPIView.as_view(), name='user-current'),
    path('api/users/<str:username>', PublicUserAPIView.as_view(), name='user-public'),
    path('api/users/search/', SearchUserAPIView.as_view(), name='user-search'),
    #  path('api/houses/<int:house_id>/rooms/', RoomsByHouseView.as_view(), name='rooms-by-house'),
    # path('websocket-notifications/', include('websocket_notifications.urls', namespace='websocket_notifications')) # add api of websocket-notifications to check
]
urlpatterns +=static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
