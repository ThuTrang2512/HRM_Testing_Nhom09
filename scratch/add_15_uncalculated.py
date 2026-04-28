from pages.employee.models import NhanVien
from pages.schedule.models import LichLamViec
from pages.attendance.models import ChamCong
from pages.contract.models import HopDongLaoDong, HopDongLaoDong_CT
from datetime import date, time
import random

# Names for 15 new employees
names = [
    "Nguyen Thi F", "Tran Van G", "Le Thi H", "Pham Van I", "Hoang Thi K",
    "Vu Van L", "Dang Thi M", "Bui Van N", "Do Thi O", "Ho Van P",
    "Ngo Thi Q", "Duong Van R", "Ly Thi S", "Phan Van T", "Trinh Thi U"
]
positions = ['Thu ngân', 'Pha chế', 'Phục vụ', 'Giữ xe', 'Quản lý'] * 3

for i in range(15):
    # 1. Create Employee
    next_id = NhanVien.generate_next_id()
    phone = f"08{random.randint(10000000, 99999999)}"
    cccd = f"0{random.randint(20000000000, 99999999999)}"
    
    nv = NhanVien.objects.create(
        MaNhanVien=next_id,
        HoTen=names[i],
        GioiTinh=random.choice(['Nam', 'Nữ']),
        Ngaysinh=date(1995, 1, 1),
        TaiKhoanNH=f'1000000000{i}',
        SoDienThoai=phone,
        CCCD=cccd,
        DiaChiLV='HCM',
        DiaChi='HCM',
        ChucVu=positions[i]
    )
    
    # 2. Create Contract (Part-time for testing hours)
    ma_hd = f"HD{random.randint(3000000, 3999999)}"
    contract = HopDongLaoDong.objects.create(
        MaHopDong=ma_hd,
        NgayBatDau=date(2026, 1, 1),
        NgayKetThuc=date(2027, 12, 31),
        MucLuong=55000,
        ChucVu=nv.ChucVu,
        LoaiHopDong='Part-time',
        TrangThai='Còn hạn',
        MaNhanVien=nv
    )
    HopDongLaoDong_CT.objects.create(
        MaHopDong=contract,
        LuongCoBan=0,
        LuongTheoGio=55000,
        SoGioLam=0
    )
    
    # 3. Create Attendance (1 day, 8 hours)
    work_date = date(2026, 4, 1)
    ma_lich = LichLamViec.generate_next_id()
    lich = LichLamViec.objects.create(
        MaLich=ma_lich,
        NgayLam=work_date,
        CaLam='Ca sáng',
        GioBatDau=time(8, 0),
        GioKetThuc=time(16, 0),
        MaNhanVien=nv,
        TrangThai='Đã gửi'
    )
    
    ma_cc = f"CC{random.randint(3000000, 3999999)}"
    ChamCong.objects.create(
        MaChamCong=ma_cc,
        GioVao=time(8, 0),
        GioRa=time(16, 0),
        TrangThai='Đúng giờ',
        MaNhanVien=nv,
        MaLich=lich
    )
    print(f"Created: {nv.MaNhanVien} - {nv.HoTen}")
