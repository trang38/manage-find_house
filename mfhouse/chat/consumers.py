import json
from channels.generic.websocket import AsyncWebsocketConsumer
# from django.contrib.auth.models import User
# from chat.models import Chat
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    @database_sync_to_async
    def get_user(self, user_id):
        from django.contrib.auth.models import User
        return User.objects.get(id=user_id)

    @database_sync_to_async
    def create_chat(self, sender, receiver, message):
        from .models import Chat
        try:
            return Chat.objects.create(sender=sender, receiver=receiver, message=message)
        except Exception as e:
            print("❌ Error creating Chat record:", e)
            return None

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        sender_id = data['sender']
        receiver_id = data['receiver']

        # Lưu vào DB
        sender = await self.get_user(sender_id)
        receiver = await self.get_user(receiver_id)
        chat = await self.create_chat(sender, receiver, message)

        # Broadcast cho group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_id,
                'receiver': receiver_id,
                'date': chat.date.strftime('%Y-%m-%d %H:%M:%S'),
                'id': chat.id,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'receiver': event['receiver'],
            'date': event['date'],
            'id': event['id'],
        }))