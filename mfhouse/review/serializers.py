from rest_framework import serializers
from .models import Rating, RoomFeedback
from constract.models import Contract

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate(self, data):
        contract = data.get('contract')
        request = self.context['request']

        if contract.tenant != request.user:
            raise serializers.ValidationError("You can only rate your own contract.")

        if contract.status != 'completed':
            raise serializers.ValidationError("You can only rate a completed contract.")

        if Rating.objects.filter(contract=contract).exists():
            raise serializers.ValidationError("You have already rated this contract.")

        return data


class RoomFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomFeedback
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate(self, data):
        contract = data.get('contract')
        request = self.context['request']

        if contract.landlord != request.user and contract.tenant != request.user:
            raise serializers.ValidationError("Only the landlord or the tenant of the contract can give room feedback.")

        rating_ref = data.get('response_to_rating')
        feedback_ref = data.get('response_to_feedback')

        if rating_ref and feedback_ref:
            raise serializers.ValidationError("Feedback cannot respond to both a rating and another feedback.")
        if not rating_ref and not feedback_ref:
            raise serializers.ValidationError("Feedback must respond to either a rating or another feedback.")

        return data