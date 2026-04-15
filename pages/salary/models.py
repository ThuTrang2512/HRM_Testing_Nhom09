from django.db import models
from django.core.validators import RegexValidator
from datetime import date
from decimal import Decimal

class BangLuong(models.Model):
    STATUS_CHOICES = [
        ('Đang chờ duyệt', 'Đang chờ duyệt'),
        ('Đã duyệt', 'Đã duyệt'),
        ('Đã từ chối', 'Đã từ chối'),
    ]

    MaLuong = models.CharField(
        primary_key=True, 
        max_length=20, 
        validators=[RegexValidator(regex=r'^BL\d+$', message="Mã lương phải bắt đầu bằng 'BL' followed by digits (ví dụ: BL001).")],
        verbose_name="Mã lương"
    )
    ThoiGian = models.DateField(default=date.today, verbose_name="Tháng/Năm")
    LuongCoBan = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Lương cơ bản")
    LuongTheoGio = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Lương theo giờ")
    SoGioLam = models.IntegerField(verbose_name="Số giờ làm")
    TongThuong = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Tổng thưởng")
    TongPhat = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Tổng phạt")
    TongThucLanh = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Tổng thực lãnh")
    TrangThai = models.CharField(max_length=50, choices=STATUS_CHOICES, verbose_name="Trạng thái")
    # Liên kết với NhanVien
    MaNhanVien = models.ForeignKey('employee.NhanVien', on_delete=models.CASCADE, verbose_name="Nhân viên")

    def save(self, *args, **kwargs):
        # Automated Salary Calculation
        if self.LuongCoBan > 0:
            self.TongThucLanh = self.LuongCoBan + self.TongThuong - self.TongPhat
        else:
            # For Part-time or Hourly workers
            self.TongThucLanh = (self.LuongTheoGio * Decimal(self.SoGioLam)) + self.TongThuong - self.TongPhat
        
        super(BangLuong, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.MaLuong} - {self.MaNhanVien.HoTen} ({self.ThoiGian})"

    class Meta:
        verbose_name = "Bảng lương"
        verbose_name_plural = "Danh sách bảng lương"
