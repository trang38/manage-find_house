from django.urls import path

from mfhouse.chat.views import GetMessages, MyInbox, SendMessages

urlpatterns = [
    path("api/my-messages/<user_id>/", MyInbox.as_view()),
    path("api/get-messages/<sender_id>/<receiver_id>/", GetMessages.as_view()),
    path("api/send-messages/", SendMessages.as_view()),
]