from django.contrib import admin
from .models import BaoCao, BaoCao_CT

@admin.register(BaoCao)
class BaoCaoAdmin(admin.ModelAdmin):
    list_display = ('MaBaoCao', 'TenBaoCao', 'ThangNam', 'TrangThai')
    search_fields = ('MaBaoCao', 'TenBaoCao')
    list_filter = ('TenBaoCao', 'ThangNam', 'TrangThai')

@admin.register(BaoCao_CT)
class BaoCao_CTAdmin(admin.ModelAdmin):
    list_display = ('MaBaoCaoCT', 'MaBaoCao', 'TenBaoCao', 'Thang', 'NgayTao', 'TongGioLam')
    list_filter = ('TenBaoCao', 'Thang', 'NgayTao')
    readonly_fields = ('TongGioLam',)
