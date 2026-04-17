from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.db.models import Q
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
import json
from .models import NhanVien

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return JsonResponse({'success': True, 'message': 'Đăng nhập thành công'})
            else:
                return JsonResponse({'success': False, 'message': 'Tên đăng nhập hoặc mật khẩu không đúng'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Lỗi hệ thống: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Phương thức không được hỗ trợ'})

def employee_list(request):
    query = request.GET.get('q', '')
    if query:
        employees = NhanVien.objects.filter(
            Q(HoTen__icontains=query) | Q(MaNhanVien__icontains=query),
            TrangThai='Đang làm việc'
        ).order_by('MaNhanVien')
    else:
        employees = NhanVien.objects.filter(TrangThai='Đang làm việc').order_by('MaNhanVien')
    
    return render(request, 'employee/employee_list.html', {'employees': employees, 'query': query})

def employee_detail(request, pk):
    employee = get_object_or_404(NhanVien, pk=pk)
    return render(request, 'employee/employee_detail.html', {'employee': employee})

def map_errors_to_template(error_dict):
    """Maps Model field names to Template field names (name attribute)."""
    mapping = {
        'MaNhanVien': 'ma_nv',
        'HoTen': 'ho_ten',
        'GioiTinh': 'gioi_tinh',
        'Ngaysinh': 'ngay_sinh',
        'CCCD': 'cccd',
        'SoDienThoai': 'sdt',
        'TaiKhoanNH': 'tai_khoan_nh',
        'DiaChi': 'dia_chi',
        'DiaChiLV': 'dia_chi_lv',
        'ChucVu': 'chuc_vu',
    }
    # Return first error message for each mapped field
    return {mapping.get(k, k): v[0] for k, v in error_dict.items()}

def employee_add(request):
    if request.method == 'POST':
        ma_nv = request.POST.get('ma_nv') or NhanVien.generate_next_id()
        ho_ten = request.POST.get('ho_ten')
        chuc_vu = request.POST.get('chuc_vu')
        gioi_tinh = request.POST.get('gioi_tinh')
        ngay_sinh = request.POST.get('ngay_sinh')
        cccd = request.POST.get('cccd')
        sdt = request.POST.get('sdt')
        tai_khoan_nh = request.POST.get('tai_khoan_nh')
        dia_chi = request.POST.get('dia_chi')
        dia_chi_lv = request.POST.get('dia_chi_lv')
        hinh_anh = request.FILES.get('hinh_anh_file')

        nhan_vien = NhanVien(
            MaNhanVien=ma_nv,
            HoTen=ho_ten,
            ChucVu=chuc_vu,
            GioiTinh=gioi_tinh,
            Ngaysinh=ngay_sinh if ngay_sinh else None,
            CCCD=cccd,
            SoDienThoai=sdt,
            TaiKhoanNH=tai_khoan_nh,
            DiaChi=dia_chi,
            DiaChiLV=dia_chi_lv,
            HinhAnh=hinh_anh
        )

        try:
            nhan_vien.full_clean()
            nhan_vien.save()
            messages.success(request, "Thêm mới nhân viên thành công")
            return redirect('employee_list')
        except ValidationError as e:
            errors = map_errors_to_template(e.message_dict)
            return render(request, 'employee/employee_add.html', {
                'errors': errors,
                'form_data': request.POST,
                'next_id': ma_nv
            })
        except Exception as e:
            messages.error(request, f"Lỗi không xác định: {e}")
            return render(request, 'employee/employee_add.html', {
                'form_data': request.POST,
                'next_id': ma_nv
            })
    
    next_id = NhanVien.generate_next_id()
    return render(request, 'employee/employee_add.html', {'next_id': next_id})

def employee_edit(request, pk):
    employee = get_object_or_404(NhanVien, pk=pk)
    if request.method == 'POST':
        new_ho_ten = request.POST.get('ho_ten')
        new_chuc_vu = request.POST.get('chuc_vu')
        new_gioi_tinh = request.POST.get('gioi_tinh')
        new_ngay_sinh = request.POST.get('ngay_sinh')
        new_cccd = request.POST.get('cccd')
        new_sdt = request.POST.get('sdt')
        new_tai_khoan_nh = request.POST.get('tai_khoan_nh')
        new_dia_chi = request.POST.get('dia_chi')
        new_dia_chi_lv = request.POST.get('dia_chi_lv')
        new_trang_thai = request.POST.get('trang_thai', employee.TrangThai)
        new_hinh_anh_file = request.FILES.get('hinh_anh_file')
        
        employee.HoTen = new_ho_ten
        employee.ChucVu = new_chuc_vu
        employee.GioiTinh = new_gioi_tinh
        employee.Ngaysinh = new_ngay_sinh if new_ngay_sinh else None
        employee.CCCD = new_cccd
        employee.SoDienThoai = new_sdt
        employee.TaiKhoanNH = new_tai_khoan_nh
        employee.DiaChi = new_dia_chi
        employee.DiaChiLV = new_dia_chi_lv
        employee.TrangThai = new_trang_thai
        
        if new_hinh_anh_file:
            employee.HinhAnh = new_hinh_anh_file
        
        try:
            employee.full_clean()
            employee.save()
            messages.success(request, "Cập nhật thông tin nhân viên thành công")
            return redirect('employee_list')
        except ValidationError as e:
            errors = map_errors_to_template(e.message_dict)
            return render(request, 'employee/employee_edit.html', {
                'employee': employee,
                'errors': errors
            })
        except Exception as e:
            messages.error(request, f"Lỗi không xác định: {e}")
            return render(request, 'employee/employee_edit.html', {'employee': employee})
            
    return render(request, 'employee/employee_edit.html', {'employee': employee})

def employee_delete(request, pk):
    employee = get_object_or_404(NhanVien, pk=pk)
    employee.TrangThai = 'Ngừng hoạt động'
    employee.save()
    messages.success(request, "Đã xóa nhân viên thành công.")
    return redirect('employee_list')

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
            "status": emp.TrangThai
        })
    return JsonResponse({"employees": emp_list})
