from django.urls import path
from . import views

urlpatterns = [
    path('api/data/', views.get_employee_data, name='employee-data'),
]
