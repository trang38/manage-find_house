# manage-find_house
## Integrate Vietnamese administrative units with django-vi-address
    pip install django-vi-address
    add 'vi-address' to INSTALLED_APPS in settings.py
    add 'path('api/address/', include('vi_address.urls')),' to urls.py
    python manage.py migrate
    python manage.py insert_data

## commit $ push
in cmd: 
    git commit -a (commit all tracked files => git add new created files)
    git push -u origin main

## fix:
các button như booking trả lại thông  báo thành công rất chậm do khi việc tạo notification tồn nhiều thời gian để tạo object và send_mail



## redis
redis-server //
redis-cli ping //
redis-server --service-stop 