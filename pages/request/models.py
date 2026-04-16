from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from datetime import date

class YeuCau(models.Model):
    TYPE_CHOICES = [
        ('Đăng ký ca', 'Đăng ký ca'),
        ('Nghỉ phép', 'Nghỉ phép'),
    ]

    STATUS_CHOICES = [
        ('Chờ duyệt', 'Chờ duyệt'),
        ('Đã duyệt', 'Đã duyệt'),
        ('Đã từ chối', 'Đã từ chối'),
    ]

    SHIFT_CHOICES = [
        ('Ca sáng (6h-12h)', 'Ca sáng (6h-12h)'),
        ('Ca chiều (12h-17h)', 'Ca chiều (12h-17h)'),
        ('Ca tối (17h-22h)', 'Ca tối (17h-22h)'),
    ]

    MaYeuCau = models.CharField(
        primary_key=True, 
        max_length=20, 
        validators=[RegexValidator(regex=r'^MYC\d+$', message="Mã yêu cầu phải bắt đầu bằng 'MYC' followed by digits (ví dụ: MYC001).")],
        verbose_name="Mã yêu cầu"
    )
    LoaiYC = models.CharField(max_length=100, choices=TYPE_CHOICES, verbose_name="Loại yêu cầu")
    NgayBD = models.DateField(verbose_name="Ngày bắt đầu")
    NgayKT = models.DateField(verbose_name="Ngày kết thúc")
    CaLam = models.CharField(max_length=50, choices=SHIFT_CHOICES, verbose_name="Ca làm việc")
    LyDo = models.TextField(verbose_name="Lý do", null=True, blank=True)
    NgayDK = models.DateField(verbose_name="Ngày đăng ký")
    TrangThai = models.CharField(max_length=50, choices=STATUS_CHOICES, verbose_name="Trạng thái")
    # Liên kết với NhanVien
    MaNhanVien = models.ForeignKey('employee.NhanVien', on_delete=models.CASCADE, verbose_name="Nhân viên")

    def clean(self):
        if self.NgayBD and self.NgayKT:
            if self.NgayKT < self.NgayBD:
                raise ValidationError("Ngày kết thúc phải sau hoặc trùng với ngày bắt đầu.")

    def save(self, *args, **kwargs):
        # Auto-set Registration Date if not provided
        if not self.NgayDK:
            self.NgayDK = date.today()
        super(YeuCau, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.MaYeuCau} - {self.LoaiYC} ({self.MaNhanVien.HoTen})"

    class Meta:
        verbose_name = "Yêu cầu"
        verbose_name_plural = "Danh sách yêu cầu"
