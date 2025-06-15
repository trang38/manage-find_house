from rest_framework import serializers

from constract.serializers import ContractSerializer
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['total_amount', 'created_at', 'updated_at']

    # def validate(self, data):
    #     return data

    def create(self, validated_data):
        payment = Payment(**validated_data)
        payment.calculate_total_amount()
        payment.save()
        return payment

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.calculate_total_amount() 
        instance.save()
        return instance

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['contract'] = ContractSerializer(instance.contract).data
        return rep
    