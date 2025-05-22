from rest_framework import serializers

from house.models import Post
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    tenant = serializers.StringRelatedField(read_only=True)  # Hiển thị username thay vì ID
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['booking_at', 'updated_at', 'tenant']