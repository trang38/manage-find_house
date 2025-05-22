from rest_framework import serializers

from mfhouse.chat.models import Chat
from infor.serializers import InforSerializer

class MessageSerializer(serializers.ModelSerializer):
    receiver_profile = InforSerializer(read_only=True)
    sender_profile = InforSerializer(read_only=True)

    class Meta:
        model = Chat
        fields = ['id','sender', 'receiver', 'receiver_profile', 'sender_profile' ,'message', 'is_read', 'date']
    
    def __init__(self, *args, **kwargs):
        super(MessageSerializer, self).__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.method=='POST':
            self.Meta.depth = 0
        else:
            self.Meta.depth = 2