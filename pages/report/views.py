from django.shortcuts import render
from .models import BaoCao_CT

import datetime

def report_attendance(request):
    reports = BaoCao_CT.objects.filter(TenBaoCao='Báo cáo Chấm công').select_related('MaNhanVien', 'MaBaoCao')
    
    # Filter logic
    name = request.GET.get('name')
    if name:
        reports = reports.filter(MaNhanVien__HoTen__icontains=name)
        
    pos = request.GET.get('position')
    if pos and pos != 'Tất cả':
        reports = reports.filter(MaNhanVien__ChucVu=pos)
        
    stat = request.GET.get('status')
    if stat and stat != 'Tất cả':
        # Status exists on the parent BaoCao model
        # Database choices are 'Đang làm' / 'Đã Nghỉ'
        db_stat = 'Đang làm' if 'Đang làm' in stat else 'Đã Nghỉ'
        reports = reports.filter(MaBaoCao__TrangThai=db_stat)
    
    cycle = request.GET.get('cycle')
    if cycle and 'Tháng' in cycle:
        try:
            # Parse 'Tháng 1/2025'
            parts = cycle.replace('Tháng ', '').split('/')
            month, year = int(parts[0]), int(parts[1])
            reports = reports.filter(Thang__month=month, Thang__year=year)
        except:
            pass
            
    return render(request, 'report_attendance.html', {
        'reports': reports,
        'active_nav': 'report',
        'active_subnav': 'report_attendance'
    })

def report_salary(request):
    reports = BaoCao_CT.objects.filter(TenBaoCao='Báo cáo Lương').select_related('MaNhanVien', 'MaLuong', 'MaBaoCao')
    
    # Filter logic
    name = request.GET.get('name')
    if name:
        reports = reports.filter(MaNhanVien__HoTen__icontains=name)
        
    pos = request.GET.get('position')
    if pos and pos != 'Tất cả':
        reports = reports.filter(MaNhanVien__ChucVu=pos)
        
    stat = request.GET.get('status')
    if stat and stat != 'Tất cả':
        db_stat = 'Đang làm' if 'Đang làm' in stat else 'Đã Nghỉ'
        reports = reports.filter(MaBaoCao__TrangThai=db_stat)

    cycle = request.GET.get('cycle')
    if cycle and 'Tháng' in cycle:
        try:
            parts = cycle.replace('Tháng ', '').split('/')
            month, year = int(parts[0]), int(parts[1])
            reports = reports.filter(Thang__month=month, Thang__year=year)
        except:
            pass
            
    return render(request, 'report_salary.html', {
        'reports': reports,
        'active_nav': 'report',
        'active_subnav': 'report_salary'
    })
