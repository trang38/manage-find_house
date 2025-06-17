# manage-find_house
## Integrate Vietnamese administrative units with django-vi-address
    add 'vi-address' to INSTALLED_APPS in settings.py
    add 'path('api/address/', include('vi_address.urls')),' to urls.py
    python manage.py migrate
    python manage.py insert_data

## backend: 
open xampp //
cd mfhouse //
venv\Scripts\activate //
pip install -r requirements.txt //
python manage.py makemigrations //
python manage.py migrate //
daphne -p 8000 mfhouse.asgi:application //

## frontend
cd frontend //
npm install //
npm start

## redis
redis-server //
redis-cli ping //
(stop redis: redis-server --service-stop )

## API document
http://localhost:8000/api/schema/swagger-ui/ //
http://localhost:8000/api/schema/redoc/