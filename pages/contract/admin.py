from django.contrib import admin
from .models import HopDongLaoDong, HopDongLaoDong_CT

@admin.register(HopDongLaoDong)
class HopDongLaoDongAdmin(admin.ModelAdmin):
    list_display = ('MaHopDong', 'MaNhanVien', 'NgayBatDau', 'NgayKetThuc', 'TrangThai')
    search_fields = ('MaHopDong', 'MaNhanVien__HoTen')
    list_filter = ('TrangThai',)

@admin.register(HopDongLaoDong_CT)
class HopDongLaoDong_CTAdmin(admin.ModelAdmin):
    list_display = ('MaHopDong', 'LuongCoBan', 'LuongTheoGio', 'SoGioLam')
