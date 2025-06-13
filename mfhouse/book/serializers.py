from rest_framework import serializers

from house.models import Post
from house.serializers import PostSerializer
from infor.serializers import UserSerializer
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    tenant = serializers.StringRelatedField(read_only=True)  # Hiển thị username thay vì ID
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['booking_at', 'updated_at', 'tenant']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['post'] = PostSerializer(instance.post).data
        rep['tenant'] = UserSerializer(instance.tenant).data
        return rep