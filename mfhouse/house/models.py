from django.db import models
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError
from vi_address.models import City, District, Ward

from mfhouse.utils import PathAndRename

# Create your models here.
class House(models.Model):
    # HOUSE_TYPES = [
    #     ('single', 'Phòng đơn'),
    #     ('multi', 'Nhà nhiều tầng'),
    #     ('whole', 'Nhà nguyên căn'),
    # ]
    name = models.CharField(max_length=100)
    # house_type = models.CharField(max_length=20, choices=HOUSE_TYPES)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True, related_name='house')
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True, related_name='house')
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True, blank=True, related_name='house')
    address_detail = models.CharField(max_length=255, blank=True, null=True)
    num_floors = models.PositiveIntegerField()  # Chỉ áp dụng với nhà nhiều tầng
    rooms_per_floor = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # def clean(self):
    #     if self.house_type == 'multi':
    #         if not self.num_floors:
    #             raise ValidationError("Vui lòng điền số tầng.")
    #         if not self.rooms_per_floor:
    #             raise ValidationError("Vui lòng điền số phòng trên 1 tầng.")


class Room(models.Model):
    STATUS_CHOICES = [
        ('available', 'Trống'),
        ('occupied', 'Đang có người thuê'),
        ('checkout_soon', 'Sắp trả phòng'),
        ('maintenance', 'Bảo trì'),
    ]
    ROOM_TYPES = [
        ('1', 'Phòng trọ'),
        ('2', 'Homestay'),
        ('3', 'Nhà nguyên căn'),
        ('4', 'Studio'),
        ('5', 'Chung cư mini'),
    ]

    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='rooms')
    room_name = models.CharField(max_length=50)   # Ví dụ: 101, 201...
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default="1")

    price = models.DecimalField(max_digits=10, decimal_places=2)
    area = models.FloatField()
    is_available = models.BooleanField(default=True)

    deposit = models.IntegerField(null=True, blank=True)
    electric = models.IntegerField(null=True, blank=True)
    water = models.CharField(max_length=255)
    service_price = models.IntegerField(null=True, blank=True)

    area = models.DecimalField(max_digits=6, decimal_places=2)
    amenities = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    is_posted = models.BooleanField(default=False)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    updated_at = models.DateTimeField(auto_now=True)


class RoomMedia(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to=PathAndRename("room_files"))


class Post(models.Model):
    room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='post')
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

# # Serializer for House
# class HouseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = House
#         fields = '__all__'


# # Serializer for Room
# class RoomSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Room
#         fields = '__all__'


# # Viewset for House
# class HouseViewSet(viewsets.ModelViewSet):
#     queryset = House.objects.all()
#     serializer_class = HouseSerializer


# # Viewset for Room
# class RoomViewSet(viewsets.ModelViewSet):
#     queryset = Room.objects.all()
#     serializer_class = RoomSerializer

#     def get_queryset(self):
#         house_id = self.kwargs.get('house_id')
#         if house_id:
#             return Room.objects.filter(house_id=house_id)
#         return super().get_queryset()


# # Room creation logic
# def create_rooms_for_house(house, room_type, price, area):
#     if house.house_type == 'multi':
#         for floor in range(1, house.num_floors + 1):
#             for room_num in range(1, house.rooms_per_floor + 1):
#                 room_name = f"{floor}{room_num:02d}"
#                 Room.objects.create(
#                     house=house,
#                     room_name=room_name,
#                     room_type=room_type,
#                     price=price,
#                     area=area
#                 )

#     elif house.house_type == 'whole':
#         Room.objects.create(
#             house=house,
#             room_name="Whole House",
#             room_type='whole_house',
#             price=price,
#             area=area
#         )

#     elif house.house_type == 'single':
#         Room.objects.create(
#             house=house,
#             room_name="Single Room",
#             room_type=room_type,
#             price=price,
#             area=area
#         )


# # API to create rooms for a house
# @api_view(['POST'])
# def create_rooms(request, house_id):
#     house = House.objects.get(id=house_id)
#     room_type = request.data.get('room_type')
#     price = request.data.get('price')
#     area = request.data.get('area')

#     create_rooms_for_house(house, room_type, price, area)
#     return Response({"message": "Rooms created successfully!"})


# # Router
# router = routers.DefaultRouter()
# router.register(r'houses', HouseViewSet)
# router.register(r'rooms', RoomViewSet)


# # URLs
# urlpatterns = [
#     path('api/', include(router.urls)),
#     path('api/houses/<int:house_id>/create-rooms/', create_rooms, name='create-rooms'),
#     path('api/houses/<int:house_id>/rooms/', RoomViewSet.as_view({'get': 'list', 'post': 'create'}), name='house-rooms'),
#     path('api/houses/<int:house_id>/rooms/<int:pk>/', RoomViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='house-room-detail'),
# ]









# class Feature(models.Model):
#     name = models.CharField(max_length=100)

# class House(models.Model):
#     HOUSE_TYPES = [
#         ('single', 'Phòng đơn'),
#         ('multi', 'Nhà nhiều tầng'),
#         ('whole', 'Nhà nguyên căn'),
#     ]

#     name = models.CharField(max_length=100)
#     house_type = models.CharField(max_length=20, choices=HOUSE_TYPES)
#     owner = models.ForeignKey(User, on_delete=models.CASCADE)
#     location = models.CharField(max_length=200)
#     num_floors = models.PositiveIntegerField(null=True, blank=True)
#     rooms_per_floor = models.PositiveIntegerField(null=True, blank=True)
#     features = models.ManyToManyField(Feature, blank=True)  # Thêm trường này

#     def clean(self):
#         if self.house_type == 'multi':
#             if not self.num_floors or not self.rooms_per_floor:
#                 raise ValidationError("Số tầng và số phòng mỗi tầng là bắt buộc khi chọn Nhà nhiều tầng.")

# class FeatureSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Feature
#         fields = '__all__'


# class HouseSerializer(serializers.ModelSerializer):
#     features = FeatureSerializer(many=True, read_only=True)

#     class Meta:
#         model = House
#         fields = '__all__'

# {
#   "name": "House A",
#   "house_type": "whole",
#   "location": "Hà Nội",
#   "features": [1, 2, 3]  # ID của các feature
# }
