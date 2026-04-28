from pages.employee.models import NhanVien
from pages.schedule.models import LichLamViec
from pages.attendance.models import ChamCong
from pages.contract.models import HopDongLaoDong, HopDongLaoDong_CT
from datetime import date, time
import random

# 5 employees for this test
emp_ids = ['NV00000018', 'NV00000019', 'NV00000020', 'NV00000021', 'NV00000022']

for eid in emp_ids:
    try:
        nv = NhanVien.objects.get(MaNhanVien=eid)
        
        # 1. Create/Update Contract to Part-time
        contract = HopDongLaoDong.objects.filter(MaNhanVien=nv).first()
        if not contract:
            ma_hd = f"HD{random.randint(2000000, 2999999)}"
            contract = HopDongLaoDong.objects.create(
                MaHopDong=ma_hd,
                NgayBatDau=date(2026, 1, 1),
                NgayKetThuc=date(2027, 12, 31),
                MucLuong=50000,
                ChucVu=nv.ChucVu,
                LoaiHopDong='Part-time',
                TrangThai='Còn hạn',
                MaNhanVien=nv
            )
        else:
            contract.LoaiHopDong = 'Part-time'
            contract.save()
            
        detail, _ = HopDongLaoDong_CT.objects.get_or_create(MaHopDong=contract, defaults={'LuongCoBan': 0, 'LuongTheoGio': 50000, 'SoGioLam': 0})
        detail.LuongCoBan = 0
        detail.LuongTheoGio = 50000
        detail.save()

        # 2. Create Attendance for 180 hours (30 days x 6 hours)
        for day in range(1, 31):
            work_date = date(2026, 4, day)
            
            # Create Schedule
            ma_lich = LichLamViec.generate_next_id()
            lich = LichLamViec.objects.create(
                MaLich=ma_lich,
                NgayLam=work_date,
                CaLam='Ca sáng',
                GioBatDau=time(6, 0),
                GioKetThuc=time(12, 0),
                MaNhanVien=nv,
                TrangThai='Đã gửi'
            )
            
            # Create Attendance
            ma_cc = f"CC{random.randint(2000000, 2999999)}"
            while ChamCong.objects.filter(MaChamCong=ma_cc).exists():
                ma_cc = f"CC{random.randint(2000000, 2999999)}"
                
            cc = ChamCong.objects.create(
                MaChamCong=ma_cc,
                GioVao=time(6, 0),
                GioRa=time(12, 0),
                TrangThai='Đúng giờ',
                MaNhanVien=nv,
                MaLich=lich
            )
        print(f"Created 180 hours data for {nv.MaNhanVien}")
        
    except NhanVien.DoesNotExist:
        print(f"Employee {eid} not found")
