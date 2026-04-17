from django.shortcuts import render
from django.db.models import Sum, Count
from pages.employee.models import NhanVien
from pages.salary.models import BangLuong
from pages.request.models import YeuCau
from pages.attendance.models import ChamCong
from datetime import date, timedelta
import calendar

def dashboard(request):
    # Stats
    total_emp = NhanVien.objects.count()
    pending_req = YeuCau.objects.filter(TrangThai='Chờ duyệt').count()
    pending_leave = YeuCau.objects.filter(TrangThai='Chờ duyệt', LoaiYC='Nghỉ phép').count()
    pending_shift = YeuCau.objects.filter(TrangThai='Chờ duyệt', LoaiYC='Đăng ký ca').count()
    
    today = date.today()
    today_attendance = ChamCong.objects.filter(MaLich__NgayLam=today).count()
    attendance_rate = (today_attendance / total_emp * 100) if total_emp > 0 else 0
    
    total_salary = BangLuong.objects.filter(ThoiGian__month=today.month, ThoiGian__year=today.year).aggregate(Sum('TongThucLanh'))['TongThucLanh__sum'] or 0
    
    # 1. Chart Hours (Last 7 months)
    chart_hours_labels = []
    chart_hours_values = []
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i*30)
        m, y = target_date.month, target_date.year
        month_name = calendar.month_name[m][:3]
        chart_hours_labels.extend(['', month_name])
        
        hours = BangLuong.objects.filter(ThoiGian__month=m, ThoiGian__year=y).aggregate(Sum('SoGioLam'))['SoGioLam__sum'] or 0
        # For a smoother chart as in original design, we add dummy intermediate points
        chart_hours_values.extend([float(hours) * 0.8, float(hours)])

    # 2. Chart Roles (Donut)
    roles_data = NhanVien.objects.values('ChucVu').annotate(count=Count('MaNhanVien'))
    roles_labels = [item['ChucVu'] for item in roles_data]
    roles_counts = [item['count'] for item in roles_data]

    # 3. Total Salary by Year (Horizontal Bar)
    salary_by_year = []
    current_year = today.year
    for i in range(2, -1, -1):
        year = current_year - i
        total = BangLuong.objects.filter(ThoiGian__year=year).aggregate(Sum('TongThucLanh'))['TongThucLanh__sum'] or 0
        salary_by_year.append({'year': year, 'total': float(total)/1000000})

    # 4. Grouped Roles Bar (Vertical Bar) - Last 3 months (Feb, Mar, Apr 2026)
    month_labels = ["Tháng 2", "Tháng 3", "Tháng 4"]
    roles_datasets = []
    colors = {'Giữ xe': '#d34a6e', 'Pha chế': '#f5a198', 'Phục vụ': '#61c9e4'}
    for role in ['Giữ xe', 'Pha chế', 'Phục vụ']:
        data_points = []
        for m in [2, 3, 4]:
            hours = BangLuong.objects.filter(ThoiGian__month=m, ThoiGian__year=current_year, MaNhanVien__ChucVu=role).aggregate(Sum('SoGioLam'))['SoGioLam__sum'] or 0
            # Adding some variance if zero for demonstration if needed, but here we use real
            data_points.append(float(hours))
        roles_datasets.append({
            'label': role,
            'data': data_points,
            'color': colors.get(role, '#9ca3af')
        })

    context = {
        'total_emp': total_emp,
        'pending_req': pending_req,
        'pending_leave': pending_leave,
        'pending_shift': pending_shift,
        'attendance_rate': int(attendance_rate),
        'today_attendance': today_attendance,
        'total_salary_m': f"{total_salary/1000000:.1f}",
        'chart_hours_labels': chart_hours_labels,
        'chart_hours_values': chart_hours_values,
        'roles_labels': roles_labels,
        'roles_counts': roles_counts,
        'total_hours_this_month': int(chart_hours_values[-1]) if chart_hours_values else 0,
        'salary_by_year': salary_by_year,
        'month_labels': month_labels,
        'roles_datasets': roles_datasets,
        'today': today,
        'active_nav': 'dashboard',
    }
    return render(request, 'dashboard.html', context)

def login(request):
    return render(request, 'login.html')

def salary_list(request):
    return render(request, 'salary.html', {'active_nav': 'salary'})

def request_list(request):
    return render(request, 'request.html', {'active_nav': 'request'})
