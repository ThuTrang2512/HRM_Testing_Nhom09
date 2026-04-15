from django.contrib import admin
from .models import LichLamViec

@admin.register(LichLamViec)
class LichLamViecAdmin(admin.ModelAdmin):
    list_display = ('MaLich', 'MaNhanVien', 'NgayLam', 'CaLam', 'TrangThai')
    search_fields = ('MaLich', 'MaNhanVien__HoTen')
    list_filter = ('TrangThai', 'NgayLam', 'CaLam')
