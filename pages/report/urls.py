from django.urls import path
from . import views

urlpatterns = [
    path('attendance/', views.attendance_report_view, name='report_attendance'),
    path('salary/', views.salary_report_view, name='report_salary'),
]
