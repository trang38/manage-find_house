from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from infor.models import Infor


@receiver(user_signed_up)
def create_user_infor(request, user, **kwargs):
    Infor.objects.get_or_create(user=user)