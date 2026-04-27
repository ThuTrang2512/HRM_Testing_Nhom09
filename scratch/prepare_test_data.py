from pages.employee.models import NhanVien
from pages.schedule.models import LichLamViec
from pages.attendance.models import ChamCong
from datetime import date, time
import random

# Get 10 employees
employees = list(NhanVien.objects.all()[:10])

for i, nv in enumerate(employees):
    # Create LichLamViec
    ma_lich = LichLamViec.generate_next_id()
    lich = LichLamViec.objects.create(
        MaLich=ma_lich,
        NgayLam=date(2026, 4, 1),
        CaLam='Ca sáng',
        GioBatDau=time(6, 0),
        GioKetThuc=time(12, 0),
        MaNhanVien=nv,
        TrangThai='Đã gửi'
    )
    
    # Create ChamCong
    # Generate random CC ID
    ma_cc = f"CC{random.randint(1000000, 9999999)}"
    # Avoid duplicate ID (crude but usually works for CC)
    while ChamCong.objects.filter(MaChamCong=ma_cc).exists():
        ma_cc = f"CC{random.randint(1000000, 9999999)}"
        
    cc = ChamCong.objects.create(
        MaChamCong=ma_cc,
        GioVao=time(6, 0),
        GioRa=time(12, 0),
        TrangThai='Đúng giờ',
        MaNhanVien=nv,
        MaLich=lich
    )
    print(f"Created data for {nv.MaNhanVien} (ID: {ma_cc})")
