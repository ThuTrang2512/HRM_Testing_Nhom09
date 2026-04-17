from django.shortcuts import render
from .models import BaoCao_CT

def attendance_report_view(request):
    # Filter for attendance reports
    reports = BaoCao_CT.objects.filter(TenBaoCao='Báo cáo Chấm công')
    return render(request, 'report/report_attendance.html', {'reports': reports})

def salary_report_view(request):
    # Filter for salary reports
    reports = BaoCao_CT.objects.filter(TenBaoCao='Báo cáo Lương')
    return render(request, 'report/report_salary.html', {'reports': reports})
