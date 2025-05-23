
import uuid
import os
from django.utils.deconstruct import deconstructible
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied


@deconstructible
class PathAndRename:
    def __init__(self, sub_path):
        self.sub_path = sub_path

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = f"{uuid.uuid4().hex}.{ext}"
        return os.path.join(self.sub_path, filename)
    
class IsRoomOwner(BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True

        # Instance must have an attribute named `owner`.
        return obj.house.owner == request.user
    

class IsLandlord(BasePermission):
    """
    Chỉ cho phép user có role 'landlord' được create, update, delete house hoặc room.
    """

    def has_permission(self, request, view):
        # if request.method == 'POST':
            return (
                request.user.is_authenticated and 
                hasattr(request.user.infor, 'role') and 
                request.user.infor.role == 'landlord'
            )
        # return True
    
# class IsHouseOwner(BasePermission):
#     """
#     Chỉ cho phép landlord là chủ sở hữu của house được tạo room trong house đó.
#     """

#     def has_permission(self, request, view):
#         # Chỉ áp dụng khi tạo mới (POST)
#         if request.method == 'POST':
#             user = request.user
#             if not user.is_authenticated or user.infor.role != 'landlord':
#                 return False

#             # Lấy house_id từ request data
#             house_id = request.data.get('house')
#             if not house_id:
#                 return False

#             try:
#                 house = House.objects.get(id=house_id)
#             except House.DoesNotExist:
#                 return False

#             return house.owner == user

#         # Cho phép các hành động khác (list, retrieve...) nếu cần
#         return True

class IsTenantInContract(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # obj là instance của Rating hoặc RoomFeedback
        if hasattr(obj, 'contract'):
            return request.user == obj.contract.tenant
        return False


class IsLandlordOrTenantInContract(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'contract'):
            return request.user == obj.contract.landlord or request.user == obj.contract.tenant
        return False
    
class CannotDeleteCompletedContract(BasePermission):
    """
    Prevent landlords or tenants from deleting a contract with status 'completed'
    """

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE' and obj.status == 'completed':
            raise PermissionDenied("You cannot delete a completed contract.")
        return True

class CannotDeleteBooking(BasePermission):
    """
    Prevent landlords or tenants from deleting a Booking.
    """

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE':
            raise PermissionDenied("You cannot delete the booking request.")
        return True
    
class CannotDeletePay(BasePermission):
    """
    Prevent landlords or tenants from deleting a Booking.
    """

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE' and obj.confirm_paid == True:
            raise PermissionDenied("You cannot delete the booking request.")
        return True