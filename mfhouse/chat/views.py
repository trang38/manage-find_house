from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from django.db.models import OuterRef, Subquery, Q
from django.http import JsonResponse
from django.contrib.auth.models import User
from mfhouse.chat.models import Chat
from mfhouse.chat.serializers import MessageSerializer
from rest_framework.permissions import IsAuthenticated

from infor.models import Infor
from infor.serializers import InforSerializer
class MyInbox(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']

        messages = Chat.objects.filter(
            id__in =  Subquery(
                User.objects.filter(
                    Q(sender__reciever=user_id) |
                    Q(reciever__sender=user_id)
                ).distinct().annotate(
                    last_msg=Subquery(
                        Chat.objects.filter(
                            Q(sender=OuterRef('id'),reciever=user_id) |
                            Q(reciever=OuterRef('id'),sender=user_id)
                        ).order_by('-id')[:1].values_list('id',flat=True) 
                    )
                ).values_list('last_msg', flat=True).order_by("-id")
            )
        ).order_by("-id")
            
        return messages
    
class GetMessages(generics.ListAPIView):
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        sender_id = self.kwargs['sender_id']
        reciever_id = self.kwargs['reciever_id']
        messages =  Chat.objects.filter(sender__in=[sender_id, reciever_id], reciever__in=[sender_id, reciever_id])
        return messages

class SendMessages(generics.CreateAPIView):
    serializer_class = MessageSerializer



class ProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = InforSerializer
    queryset = Infor.objects.all()
    permission_classes = [IsAuthenticated] 