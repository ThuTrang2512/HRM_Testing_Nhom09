from django.urls import path
from . import views

app_name = 'report'

urlpatterns = [
    path('attendance/', views.report_attendance, name='report_attendance'),
    path('salary/', views.report_salary, name='report_salary'),
]
