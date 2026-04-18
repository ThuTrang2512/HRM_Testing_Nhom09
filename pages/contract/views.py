import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from decimal import Decimal
from .models import HopDongLaoDong, HopDongLaoDong_CT
from pages.employee.models import NhanVien

def get_contract_data(request):
    # Chỉ lấy hợp đồng của những nhân viên đang ở trạng thái 'Đang làm việc'
    contracts = HopDongLaoDong.objects.select_related('MaNhanVien', 'hopdonglaodong_ct')\
        .filter(MaNhanVien__TrangThai='Đang làm việc')\
        .order_by('MaHopDong')
    contract_list = []
    
    for c in contracts:
        # Resolve salary
        try:
            details = c.hopdonglaodong_ct
            luong_cb = float(details.LuongCoBan) if details.LuongCoBan else 0
            luong_h = float(details.LuongTheoGio) if details.LuongTheoGio else 0
            thuong = float(details.CheDoThuong) if details.CheDoThuong else 0
            so_gio = details.SoGioLam if details.SoGioLam else 0
            ghi_chu = details.GhiChu if details.GhiChu else ''
            
            # Just send back total formatted salary for list representation
            salary = luong_cb + thuong if c.LoaiHopDong == 'Full-time' else float(c.MucLuong)
        except Exception:
            salary = float(c.MucLuong)
            luong_cb = 0
            luong_h = 0
            thuong = 0
            so_gio = 0
            ghi_chu = ''

        contract_list.append({
            "id": c.MaHopDong,
            "employeeId": c.MaNhanVien.MaNhanVien if c.MaNhanVien else '',
            "employeeName": c.MaNhanVien.HoTen if c.MaNhanVien else '',
            "employeeRole": c.MaNhanVien.ChucVu if c.MaNhanVien else '',
            "contractType": c.LoaiHopDong,
            "startDate": c.NgayBatDau.strftime("%d/%m/%Y") if c.NgayBatDau else '',
            "endDate": c.NgayKetThuc.strftime("%d/%m/%Y") if c.NgayKetThuc else '',
            "salary": salary,
            "baseSalary": luong_cb,
            "hourSalary": luong_h,
            "bonus": thuong,
            "minHour": so_gio,
            "note": ghi_chu,
            "status": c.TrangThai,
        })
        
    return JsonResponse({"contracts": contract_list})

@csrf_exempt
def sync_contract_action(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            action = data.get('action')
            
            if action == 'CREATE':
                nhan_vien = NhanVien.objects.get(MaNhanVien=data.get('employeeId'))
                start_date = datetime.strptime(data.get('startDate'), "%d/%m/%Y").date()
                end_date = datetime.strptime(data.get('endDate'), "%d/%m/%Y").date()
                
                hd = HopDongLaoDong(
                    MaHopDong=data.get('id'),
                    NgayBatDau=start_date,
                    NgayKetThuc=end_date,
                    MucLuong=Decimal(str(data.get('salary', '0')).replace('.', '').replace(',', '')),
                    ChucVu=nhan_vien.ChucVu,
                    LoaiHopDong=data.get('contractType', ''),
                    TrangThai='Còn hạn',
                    MaNhanVien=nhan_vien
                )
                hd.save()
                
                HopDongLaoDong_CT.objects.create(
                    MaHopDong=hd,
                    LuongCoBan=Decimal(str(data.get('baseSalary', '0')).replace('.', '').replace(',', '')),
                    LuongTheoGio=Decimal(str(data.get('hourSalary', '0')).replace('.', '').replace(',', '')),
                    CheDoThuong=Decimal(str(data.get('bonus', '0')).replace('.', '').replace(',', '')),
                    SoGioLam=int(str(data.get('minHour', '0')).replace('.', '').replace(',', '')),
                    GhiChu=data.get('note', '')
                )
            
            elif action == 'UPDATE':
                contract_id = data.get('id')
                hd = HopDongLaoDong.objects.get(MaHopDong=contract_id)
                nhan_vien = NhanVien.objects.get(MaNhanVien=data.get('employeeId'))
                
                start_date = datetime.strptime(data.get('startDate'), "%d/%m/%Y").date()
                end_date = datetime.strptime(data.get('endDate'), "%d/%m/%Y").date()
                
                hd.NgayBatDau = start_date
                hd.NgayKetThuc = end_date
                hd.MucLuong = Decimal(str(data.get('salary', '0')).replace('.', '').replace(',', ''))
                hd.ChucVu = nhan_vien.ChucVu
                hd.LoaiHopDong = data.get('contractType', '')
                hd.MaNhanVien = nhan_vien
                hd.save()
                
                details, created = HopDongLaoDong_CT.objects.get_or_create(MaHopDong=hd)
                details.LuongCoBan = Decimal(str(data.get('baseSalary', '0')).replace('.', '').replace(',', ''))
                details.LuongTheoGio = Decimal(str(data.get('hourSalary', '0')).replace('.', '').replace(',', ''))
                details.CheDoThuong = Decimal(str(data.get('bonus', '0')).replace('.', '').replace(',', ''))
                details.SoGioLam = int(str(data.get('minHour', '0')).replace('.', '').replace(',', ''))
                details.GhiChu = data.get('note', '')
                details.save()

            elif action == 'DELETE':
                contract_id = data.get('id')
                HopDongLaoDong.objects.filter(MaHopDong=contract_id).delete()
                
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)
