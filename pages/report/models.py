from django.db import models
from django.core.validators import RegexValidator
from datetime import date

REPORT_TYPE_CHOICES = [
    ('Báo cáo Lương', 'Báo cáo Lương'),
    ('Báo cáo Chấm công', 'Báo cáo Chấm công'),
]

class BaoCao(models.Model):

    POSITION_CHOICES = [
        ('Thu ngân', 'Thu ngân'),
        ('Quản lý', 'Quản lý'),
        ('Pha chế', 'Pha chế'),
        ('Phục vụ', 'Phục vụ'),
        ('Giữ xe', 'Giữ xe'),
    ]

    STATUS_CHOICES = [
        ('Đang làm', 'Đang làm'),
        ('Đã Nghỉ', 'Đã Nghỉ'),
    ]

    MaBaoCao = models.CharField(
        primary_key=True, 
        max_length=20, 
        validators=[RegexValidator(regex=r'^BC\d+$', message="Mã báo cáo phải bắt đầu bằng 'BC' followed by digits (ví dụ: BC001).")],
        verbose_name="Mã báo cáo"
    )
    TenBaoCao = models.CharField(max_length=255, choices=REPORT_TYPE_CHOICES, verbose_name="Tên báo cáo")
    ThangNam = models.DateField(default=date.today, verbose_name="Tháng năm")
    ChucVu = models.CharField(max_length=50, choices=POSITION_CHOICES, verbose_name="Chức vụ")
    TrangThai = models.CharField(max_length=50, choices=STATUS_CHOICES, verbose_name="Trạng thái")
    # Liên kết với NhanVien
    MaNhanVien = models.ForeignKey('employee.NhanVien', on_delete=models.CASCADE, verbose_name="Nhân viên")

    def __str__(self):
        return f"{self.MaBaoCao} - {self.TenBaoCao}"

    class Meta:
        verbose_name = "Báo cáo"
        verbose_name_plural = "Danh sách báo cáo"

class BaoCao_CT(models.Model):
    MaBaoCaoCT = models.CharField(
        primary_key=True, 
        max_length=20, 
        validators=[RegexValidator(regex=r'^BCCT\d+$', message="Mã báo cáo chi tiết phải bắt đầu bằng 'BCCT' followed by digits (ví dụ: BCCT001).")],
        verbose_name="Mã báo cáo chi tiết"
    )
    TenBaoCao = models.CharField(max_length=255, choices=REPORT_TYPE_CHOICES, verbose_name="Tên báo cáo")
    Thang = models.DateField(default=date.today, verbose_name="Tháng")
    NgayTao = models.DateField(default=date.today, verbose_name="Ngày tạo")
    TongGioLam = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Tổng giờ làm")
    NgayNghiPhep = models.IntegerField(verbose_name="Ngày nghỉ phép")
    NgayKhongPhep = models.IntegerField(verbose_name="Ngày không phép")
    
    # Các liên kết ngoài
    MaLuong = models.ForeignKey('salary.BangLuong', on_delete=models.CASCADE, verbose_name="Mã lương")
    MaChamCong = models.ForeignKey('attendance.ChamCong', on_delete=models.CASCADE, verbose_name="Mã chấm công")
    MaBaoCao = models.ForeignKey(BaoCao, on_delete=models.CASCADE, verbose_name="Mã báo cáo")
    MaNhanVien = models.ForeignKey('employee.NhanVien', on_delete=models.CASCADE, verbose_name="Nhân viên")

    def save(self, *args, **kwargs):
        # Automated retrieval of work hours from Attendance module
        if self.MaChamCong and self.MaChamCong.SoGioLam:
            self.TongGioLam = self.MaChamCong.SoGioLam
        super(BaoCao_CT, self).save(*args, **kwargs)

    def __str__(self):
        return f"Chi tiết báo cáo: {self.MaBaoCaoCT}"

    class Meta:
        verbose_name = "Chi tiết báo cáo"
        verbose_name_plural = "Danh sách chi tiết báo cáo"
