from django.contrib import admin
from .models import BangLuong

@admin.register(BangLuong)
class BangLuongAdmin(admin.ModelAdmin):
    list_display = ('MaLuong', 'MaNhanVien', 'ThoiGian', 'TongThucLanh', 'TrangThai')
    search_fields = ('MaLuong', 'MaNhanVien__HoTen')
    list_filter = ('TrangThai', 'ThoiGian')
    readonly_fields = ('TongThucLanh',)
