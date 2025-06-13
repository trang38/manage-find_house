from rest_framework import serializers

from infor.serializers import UserSerializer
from .models import House, Room, RoomMedia, Post
from django.contrib.auth.models import User


class HouseSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = House
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'owner']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['owner'] = UserSerializer(instance.owner).data
        if instance.ward:
            rep['ward'] = {
                'id': instance.ward.id,
                'path_with_type': instance.ward.path_with_type
            }
        else:
            rep['ward'] = None

        return rep

class RoomMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomMedia
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    media = RoomMediaSerializer(many=True, read_only=True)
    house = serializers.PrimaryKeyRelatedField(queryset=House.objects.all())
    post_id = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [field.name for field in Room._meta.fields] + ['media', 'post_id']
        read_only_fields = ['updated_at']

    def get_post_id(self, obj):
        from .models import Post
        post = Post.objects.filter(room=obj).first()
        return post.id if post else None
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['house'] = HouseSerializer(instance.house).data
        return rep
    

class PostSerializer(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all())

    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'is_active']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['room'] = RoomSerializer(instance.room).data
        return rep