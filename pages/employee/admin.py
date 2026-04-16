from django.contrib import admin
from .models import NhanVien

@admin.register(NhanVien)
class NhanVienAdmin(admin.ModelAdmin):
    list_display = ('MaNhanVien', 'HoTen', 'ChucVu', 'SoDienThoai')
    search_fields = ('MaNhanVien', 'HoTen', 'SoDienThoai')
    list_filter = ('ChucVu', 'GioiTinh')
