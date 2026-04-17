from django.urls import path
from . import views

urlpatterns = [
    path('', views.employee_list, name='employee_list'),
    path('add/', views.employee_add, name='employee_add'),
    path('api/data/', views.get_employee_data, name='employee-data'),
    path('<str:pk>/', views.employee_detail, name='employee_detail'),
    path('<str:pk>/edit/', views.employee_edit, name='employee_edit'),
    path('<str:pk>/delete/', views.employee_delete, name='employee_delete'),
]
