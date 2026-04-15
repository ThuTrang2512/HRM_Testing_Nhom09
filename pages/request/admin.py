from django.contrib import admin
from .models import YeuCau

@admin.register(YeuCau)
class YeuCauAdmin(admin.ModelAdmin):
    list_display = ('MaYeuCau', 'MaNhanVien', 'LoaiYC', 'NgayDK', 'TrangThai')
    search_fields = ('MaYeuCau', 'MaNhanVien__HoTen')
    list_filter = ('LoaiYC', 'TrangThai', 'NgayDK')
