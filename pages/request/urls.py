from django.urls import path
from . import views

urlpatterns = [
    path('api/list/', views.get_requests, name='get_requests'),
    path('api/update-status/', views.update_request_status, name='update_request_status'),
]
