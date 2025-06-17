from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.generics import ListAPIView
from .pagination import PostPagination
from .models import House, Room, RoomMedia, Post
from .serializers import HouseSerializer, RoomSerializer, RoomMediaSerializer, PostSerializer
from mfhouse.permissions import IsLandlord, IsRoomOwner, CannotDeleteHouseIfhasRooms
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from django_filters import rest_framework as filters
# Create your views here.
class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    serializer_class = HouseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsLandlord, CannotDeleteHouseIfhasRooms]

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
    
class RoomMediaViewSet(viewsets.ModelViewSet):
    queryset = RoomMedia.objects.all()
    serializer_class = RoomMediaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsLandlord]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['room']

class PostFilter(filters.FilterSet):
    city = filters.NumberFilter(field_name="room__house__city")
    district = filters.NumberFilter(field_name="room__house__district")
    ward = filters.NumberFilter(field_name="room__house__ward")
    room_type = filters.CharFilter(field_name="room__room_type")
    price = filters.NumberFilter(field_name="room__price", lookup_expr='lte')
    area = filters.NumberFilter(field_name="room__area", lookup_expr='gte')

    class Meta:
        model = Post
        fields = ['city', 'district', 'ward', 'room_type', 'price', 'area']
        
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = PostSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsLandlord]
    pagination_class = PostPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = PostFilter
    search_fields = ['title']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsLandlord()]
        return [permissions.AllowAny()]
    
    