from django.db import models
from django.core.validators import RegexValidator

class LichLamViec(models.Model):
    SHIFT_CHOICES = [
        ('Ca sáng (6h-12h)', 'Ca sáng (6h-12h)'),
        ('Ca chiều (12h-17h)', 'Ca chiều (12h-17h)'),
        ('Ca tối (17h-22h)', 'Ca tối (17h-22h)'),
    ]

    STATUS_CHOICES = [
        ('Chưa gửi', 'Chưa gửi'),
        ('Đã gửi', 'Đã gửi'),
    ]

    MaLich = models.CharField(
        primary_key=True, 
        max_length=20, 
        validators=[RegexValidator(regex=r'^MLLV\d+$', message="Mã lịch phải bắt đầu bằng 'MLLV' followed by digits (ví dụ: MLLV001).")],
        verbose_name="Mã lịch"
    )
    NgayLam = models.DateField(verbose_name="Ngày làm")
    CaLam = models.CharField(max_length=50, choices=SHIFT_CHOICES, verbose_name="Ca làm")
    GhiChu = models.TextField(verbose_name="Ghi chú", null=True, blank=True)
    TrangThai = models.CharField(max_length=50, choices=STATUS_CHOICES, verbose_name="Trạng thái")
    # Liên kết với NhanVien
    MaNhanVien = models.ForeignKey('employee.NhanVien', on_delete=models.CASCADE, verbose_name="Nhân viên")

    def __str__(self):
        return f"{self.MaLich} - {self.MaNhanVien.HoTen} ({self.NgayLam})"

    class Meta:
        verbose_name = "Lịch làm việc"
        verbose_name_plural = "Danh sách lịch làm việc"
