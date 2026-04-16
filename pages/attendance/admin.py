from django.contrib import admin
from .models import ChamCong

@admin.register(ChamCong)
class ChamCongAdmin(admin.ModelAdmin):
    list_display = ('MaChamCong', 'MaNhanVien', 'MaLich', 'SoGioLam', 'TrangThai')
    search_fields = ('MaChamCong', 'MaNhanVien__HoTen')
    list_filter = ('TrangThai',)
    readonly_fields = ('SoGioLam',)
