# manage-find_house
## Integrate Vietnamese administrative units with django-vi-address
    pip install django-vi-address
    add 'vi-address' to INSTALLED_APPS in settings.py
    add 'path('api/address/', include('vi_address.urls')),' to urls.py
    python manage.py migrate
    python manage.py insert_data

## commit $ push
in cmd: 
git commit -a
git push -u origin main