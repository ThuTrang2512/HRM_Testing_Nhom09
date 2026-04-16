from django.urls import path
from . import views

urlpatterns = [
    path('api/data/', views.get_salary_data, name='salary-data'),
    path('api/action/', views.sync_salary_action, name='salary-action'),
]
