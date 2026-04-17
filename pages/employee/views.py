from django.shortcuts import render
from django.http import JsonResponse
from .models import NhanVien

def employee_list_view(request):
    return render(request, 'employee/employee_list.html')

def get_employee_data(request):
    employees = NhanVien.objects.all()
    emp_list = []
    for emp in employees:
        emp_list.append({
            "id": emp.MaNhanVien,
            "name": emp.HoTen,
            "role": emp.ChucVu,
            "phone": emp.SoDienThoai,
            "dob": emp.Ngaysinh.strftime("%d/%m/%Y") if emp.Ngaysinh else '',
            "cccd": emp.CCCD,
            "gender": emp.GioiTinh,
            "address": emp.DiaChi,
            "status": "Đang làm việc"
        })
    return JsonResponse({"employees": emp_list})
