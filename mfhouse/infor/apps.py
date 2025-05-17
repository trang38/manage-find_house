from django.apps import AppConfig


class InforConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'infor'

    def ready(self):
        import infor.signals
        
