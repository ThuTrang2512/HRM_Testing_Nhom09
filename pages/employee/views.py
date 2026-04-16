from django.http import JsonResponse
from .models import NhanVien

def get_employee_data(request):
    employees = NhanVien.objects.all()
    emp_list = []
    for emp in employees:
        emp_list.append({
            "id": emp.MaNhanVien,
            "name": emp.HoTen,
            "role": emp.ChucVu,
        })
    return JsonResponse({"employees": emp_list})
