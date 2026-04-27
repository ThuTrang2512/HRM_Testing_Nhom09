from pages.employee.models import NhanVien
from pages.contract.models import HopDongLaoDong, HopDongLaoDong_CT
from datetime import date
import random

# IDs of the 10 employees we prepared data for
emp_ids = [
    'NV00000004', 'NV00000002', 'NV00000023', 'NV00000015', 'NV00000006',
    'NV00000009', 'NV00000016', 'NV00000017', 'NV00000007', 'NV00000008'
]

for i, eid in enumerate(emp_ids):
    try:
        nv = NhanVien.objects.get(MaNhanVien=eid)
        
        # Check for existing contract
        contract = HopDongLaoDong.objects.filter(MaNhanVien=nv).first()
        if not contract:
            # Create a new contract
            ma_hd = f"HD{random.randint(1000000, 9999999)}"
            # Avoid duplicate ID
            while HopDongLaoDong.objects.filter(MaHopDong=ma_hd).exists():
                ma_hd = f"HD{random.randint(1000000, 9999999)}"
                
            contract = HopDongLaoDong.objects.create(
                MaHopDong=ma_hd,
                NgayBatDau=date(2026, 1, 1),
                NgayKetThuc=date(2027, 12, 31),
                MucLuong=5000000 if i % 2 == 0 else 50000,
                ChucVu=nv.ChucVu,
                LoaiHopDong='Full-time' if i % 2 == 0 else 'Part-time',
                TrangThai='Còn hạn',
                MaNhanVien=nv
            )
            print(f"Created contract {ma_hd} for {nv.MaNhanVien}")
        else:
            # Update existing contract type
            contract.LoaiHopDong = 'Full-time' if i % 2 == 0 else 'Part-time'
            contract.save()
            print(f"Updated contract {contract.MaHopDong} for {nv.MaNhanVien}")
            
        # Create or update Detail
        detail, created = HopDongLaoDong_CT.objects.get_or_create(
            MaHopDong=contract,
            defaults={
                'LuongCoBan': 0,
                'LuongTheoGio': 0,
                'SoGioLam': 0
            }
        )
        
        if i % 2 == 0:
            # Full-time
            detail.LuongCoBan = 5000000
            detail.LuongTheoGio = 0
        else:
            # Part-time
            detail.LuongCoBan = 0
            detail.LuongTheoGio = 50000
            
        detail.save()
        print(f"Adjusted salary for {nv.MaNhanVien}: LuongCoBan={detail.LuongCoBan}, LuongTheoGio={detail.LuongTheoGio}")
        
    except NhanVien.DoesNotExist:
        print(f"Employee {eid} not found")
