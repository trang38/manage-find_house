from rest_framework import serializers

from infor.serializers import UserSerializer
from .models import Rating, RoomFeedback
from constract.models import Contract

class RatingSerializer(serializers.ModelSerializer):
    feedback_obj = serializers.SerializerMethodField()
    tenant = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate(self, data):
        contract = data.get('contract') or getattr(self.instance, 'contract', None)
        request = self.context['request']

        if contract.tenant != request.user:
            raise serializers.ValidationError("You can only rate your own contract.")

        if contract.status != 'completed':
            raise serializers.ValidationError("You can only rate a completed contract.")

        qs = Rating.objects.filter(contract=contract)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("You have already rated this contract.")

        return data
    
    def get_feedback_obj(self, obj):
        feedback = RoomFeedback.objects.filter(response_to_rating=obj).first()
        if feedback:
            return RoomFeedbackSerializer(feedback, context=self.context).data
        return None

class RoomFeedbackSerializer(serializers.ModelSerializer):
    landlord = UserSerializer(read_only=True)

    class Meta:
        model = RoomFeedback
        fields = '__all__'
        read_only_fields = ['created_at']
    
    def validate(self, data):
        response_to_rating = data.get('response_to_rating') or getattr(self.instance, 'response_to_rating', None)
        contract = data.get('contract') or getattr(self.instance, 'contract', None)
        request = self.context['request']

        if contract.landlord != request.user:
            raise serializers.ValidationError("Only the landlord or the tenant of the contract can give room feedback.")

        qs = RoomFeedback.objects.filter(response_to_rating=response_to_rating)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("You have already feedbacked this rating.")
        return data