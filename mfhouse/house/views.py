from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import House, Room, RoomMedia, Post
from .serializers import HouseSerializer, RoomSerializer, RoomMediaSerializer, PostSerializer
from mfhouse.permissions import IsLandlord, IsRoomOwner
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend

# Create your views here.
class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    serializer_class = HouseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsLandlord]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        
    def get_queryset(self):
        user = self.request.user
        return House.objects.filter(owner=user)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsRoomOwner, IsLandlord]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['house', 'room_type', 'status']
    # /api/rooms/?house=1 → lấy danh sách phòng thuộc nhà có id = 1
    # /api/rooms/?status=available → lọc theo trạng thái


# class RoomsByHouseView(generics.ListAPIView):
#     serializer_class = RoomSerializer
#     permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsRoomOwner, IsLandlord]
#     def get_queryset(self):
#         house_id = self.kwargs.get('house_id')
#         return Room.objects.filter(house_id=house_id)


class RoomMediaViewSet(viewsets.ModelViewSet):
    queryset = RoomMedia.objects.all()
    serializer_class = RoomMediaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsLandlord]


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsLandlord]