from django.urls import path

from infor.views import CurrentUserAPIView, PublicUserAPIView, SearchUserAPIView

urlspatterns = [
    path('api/users/me/', CurrentUserAPIView.as_view(), name='user-current'),
    path('api/users/<str:username>', PublicUserAPIView.as_view(), name='user-public'),
    path('api/users/search/', SearchUserAPIView.as_view(), name='user-search'),
]