from rest_framework import serializers
from .models import House, Room, RoomMedia, Post
from django.contrib.auth.models import User


class HouseSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = House
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class RoomMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomMedia
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    media = RoomMediaSerializer(many=True, read_only=True)
    house = serializers.PrimaryKeyRelatedField(queryset=House.objects.all())

    class Meta:
        model = Room
        fields = '__all__'
        read_only_fields = ['is_posted', 'updated_at']

class PostSerializer(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all())

    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'is_active']