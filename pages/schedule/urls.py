from django.urls import path
from . import views

urlpatterns = [
    path('', views.schedule_page, name='schedule_list'),
    path('api/data/', views.api_get_schedules, name='api_get_schedules'),
    path('api/employees/', views.api_get_employees, name='api_get_employees'),
    path('api/save/', views.api_save_schedule, name='api_save_schedule'),
    path('api/delete/<str:pk>/', views.api_delete_schedule, name='api_delete_schedule'),
    path('api/send/', views.api_send_notification, name='api_send_notification'),
]
