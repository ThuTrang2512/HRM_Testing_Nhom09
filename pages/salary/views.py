from django.http import JsonResponse
from .models import BangLuong
from pages.attendance.models import ChamCong
from pages.contract.models import HopDongLaoDong_CT

def get_salary_data(request):
    bang_luongs = BangLuong.objects.all()
    
    payrolls = []
    
    status_map = {
        'Đang chờ duyệt': 'pending',
        'Đã duyệt': 'approved',
        'Đã từ chối': 'rejected',
    }
    
    for bl in bang_luongs:
        month_str = bl.ThoiGian.strftime("%m/%Y") if bl.ThoiGian else ""
        employee_id = bl.MaNhanVien.MaNhanVien if bl.MaNhanVien else ""
        
        payrolls.append({
            "id": bl.MaLuong,
            "employeeId": employee_id,
            "month": month_str,
            "totalSalary": float(bl.TongThucLanh) if bl.TongThucLanh is not None else 0.0,
            "bonus": float(bl.TongThuong) if bl.TongThuong is not None else 0.0,
            "penalty": float(bl.TongPhat) if bl.TongPhat is not None else 0.0,
            "status": status_map.get(bl.TrangThai, 'pending')
        })
        
    attendance_data_dict = {}
    
    # Process attendance
    cham_congs = ChamCong.objects.select_related('MaLich', 'MaNhanVien').all()
    for cc in cham_congs:
        if not cc.MaNhanVien or not cc.MaLich or not cc.MaLich.NgayLam:
            continue
            
        emp_id = cc.MaNhanVien.MaNhanVien
        month_str = cc.MaLich.NgayLam.strftime("%m/%Y")
        key = f"{emp_id}_{month_str}"
        
        if key not in attendance_data_dict:
            attendance_data_dict[key] = {
                "employeeId": emp_id,
                "month": month_str,
                "workedHours": 0.0,
                "baseSalary": 0.0,
                "hourlyRate": 0.0
            }
            
        if cc.SoGioLam and cc.TrangThai in ['Đúng giờ', 'Trễ']:
            attendance_data_dict[key]["workedHours"] += float(cc.SoGioLam)

    # Attach base salaries from contracts
    hd_cts = HopDongLaoDong_CT.objects.select_related('MaHopDong__MaNhanVien').all()
    salary_dict = {}
    for hd in hd_cts:
        if hd.MaHopDong and hd.MaHopDong.MaNhanVien:
            emp_id = hd.MaHopDong.MaNhanVien.MaNhanVien
            # Only taking the first contract found or ignoring overlapping for now
            salary_dict[emp_id] = {
                "baseSalary": float(hd.LuongCoBan) if hd.LuongCoBan else 0.0,
                "hourlyRate": float(hd.LuongTheoGio) if hd.LuongTheoGio else 0.0
            }
            
    for key, data in attendance_data_dict.items():
        emp_id = data["employeeId"]
        if emp_id in salary_dict:
            data["baseSalary"] = salary_dict[emp_id]["baseSalary"]
            data["hourlyRate"] = salary_dict[emp_id]["hourlyRate"]
            
    attendance_data = list(attendance_data_dict.values())
        
    return JsonResponse({
        "payrolls": payrolls,
        "attendanceData": attendance_data
    })

import json
from datetime import datetime
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def sync_salary_action(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            action = data.get('action')
            
            if action == 'CREATE':
                from pages.employee.models import NhanVien
                nhan_vien = NhanVien.objects.get(MaNhanVien=data['employeeId'])
                month_str = data['month']
                thoi_gian = datetime.strptime(month_str, "%m/%Y").date()
                
                # Check for existing
                if not BangLuong.objects.filter(MaNhanVien=nhan_vien, ThoiGian=thoi_gian).exists():
                    bl = BangLuong(
                        MaLuong=data['id'],
                        ThoiGian=thoi_gian,
                        LuongCoBan=Decimal(data.get('baseSalary', 0)),
                        LuongTheoGio=Decimal(data.get('hourlyRate', 0)),
                        SoGioLam=int(float(data.get('workedHours', 0))),
                        TongThuong=Decimal(data.get('bonus', 0)),
                        TongPhat=Decimal(data.get('penalty', 0)),
                        TongThucLanh=Decimal(data.get('totalSalary', 0)),
                        TrangThai='Đang chờ duyệt',
                        MaNhanVien=nhan_vien
                    )
                    bl.save()
            elif action == 'UPDATE':
                bl = BangLuong.objects.get(MaLuong=data['id'])
                bl.TongThuong = Decimal(data.get('bonus', bl.TongThuong))
                bl.TongPhat = Decimal(data.get('penalty', bl.TongPhat))
                if 'totalSalary' in data:
                    bl.TongThucLanh = Decimal(data.get('totalSalary'))
                bl.save()
            elif action == 'UPDATE_STATUS':
                bl = BangLuong.objects.get(MaLuong=data['id'])
                status_map = {'approved': 'Đã duyệt', 'rejected': 'Đã từ chối', 'pending': 'Đang chờ duyệt'}
                bl.TrangThai = status_map.get(data['status'], bl.TrangThai)
                bl.save()
            elif action == 'DELETE':
                BangLuong.objects.filter(MaLuong=data['id']).delete()
                
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)
