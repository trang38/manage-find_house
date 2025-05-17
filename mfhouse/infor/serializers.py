from rest_framework import serializers

from infor.models import Infor
from django.contrib.auth.models import User

class InforSerializer(serializers.ModelSerializer):

    class Meta:
        model = Infor
        fields = '__all__'
        depth = 1 # include city, dítrict, ward
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        is_self = self.context.get('is_self', False)
        if not is_self:
            if not instance.show_bio:
                rep.pop('bio', None)
            if not instance.show_phone_number:
                rep.pop('phone_number', None)
            if not instance.show_address: 
                rep.pop('city', None)
                rep.pop('district', None)
                rep.pop('ward', None)
                rep.pop('address_detail', None)
            rep.pop('national_id', None)
            rep.pop('id_front_image', None)
            rep.pop('id_back_image', None)
            rep.pop('show_bio', None)
            rep.pop('show_phone_number', None)
            rep.pop('show_address', None)

        return rep
      
    # def __init__(self, *args, **kwargs):
    #     super(InforSerializer, self).__init__(*args, **kwargs)
    #     request = self.context.get('request')
    #     if request and request.method=='POST':
    #         self.Meta.depth = 0
    #     else:
    #         self.Meta.depth = 3

class UserSerializer(serializers.ModelSerializer):
    infor = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'infor']

    def get_infor(self, obj):
        request = self.context.get('request')
        is_self = request.user == obj if request and request.user.is_authenticated else False
        return InforSerializer(obj.infor, context={'request': request, 'is_self': is_self}).data