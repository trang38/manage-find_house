from rest_framework import serializers

from infor.models import Infor
from django.contrib.auth.models import User
from vi_address.models import City, District, Ward
from constract.models import Contract
from django.db.models import Q

class InforSerializer(serializers.ModelSerializer):
    city = serializers.PrimaryKeyRelatedField(queryset=City.objects.all(), required=False, allow_null=True)
    district = serializers.PrimaryKeyRelatedField(queryset=District.objects.all(), required=False, allow_null=True)
    ward = serializers.PrimaryKeyRelatedField(queryset=Ward.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Infor
        fields = '__all__'
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        is_self = self.context.get('is_self', False)
        is_contract_related = self.context.get('is_contract_related', False)
        if instance.ward:
            rep['ward'] = {
                'id': instance.ward.id,
                'path_with_type': instance.ward.path_with_type
            }
        else:
            rep['ward'] = None

        if not is_self and not is_contract_related:
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
        is_contract_related = False

        if request and request.user.is_authenticated and request.user != obj:
            # Check nếu request.user và obj có chung hợp đồng
            is_contract_related = Contract.objects.filter(
                Q(tenant=request.user, landlord=obj) | 
                Q(landlord=request.user, tenant=obj)
            ).exists()

        return InforSerializer(
            obj.infor, 
            context={
                'request': request, 
                'is_self': is_self,
                'is_contract_related': is_contract_related
            }
        ).data