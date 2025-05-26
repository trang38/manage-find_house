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
lỗi trong trang signup: mật khẩu quá ngắn, cần đặt sao cho mật khâur tối thiểu 8 ký tự


## redis
redis-server //
redis-cli ping