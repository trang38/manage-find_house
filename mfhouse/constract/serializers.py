from rest_framework import serializers

from house.models import Room
from .models import Contract


class ContractSerializer(serializers.ModelSerializer):
    # landlord = serializers.StringRelatedField(read_only=True)
    # tenant = serializers.StringRelatedField(read_only=True)
    # room = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all())

    class Meta:
        model = Contract
        fields = '__all__'
        read_only_fields = [
            'created_at', 'updated_at', 'completed_at', 'status',
            'landlord', 'tenant', 'data', 'booking'
        ]
        
    def create(self, validated_data):
        request = self.context['request']
        booking = validated_data.get('booking')

        if not booking:
            raise serializers.ValidationError("Booking is required to create a contract.")

        # Auto-assign landlord and tenant
        landlord = booking.post.room.house.owner
        tenant = booking.tenant

        validated_data['landlord'] = landlord
        validated_data['tenant'] = tenant

        return super().create(validated_data)