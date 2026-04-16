from django.db import models
from django.core.validators import RegexValidator
from decimal import Decimal

class ChamCong(models.Model):
    STATUS_CHOICES = [
        ('Đúng giờ', 'Đúng giờ'),
        ('Trễ', 'Trễ'),
        ('Vắng', 'Vắng'),
    ]

    MaChamCong = models.CharField(
        primary_key=True, 
        max_length=20, 
        validators=[RegexValidator(regex=r'^CC\d+$', message="Mã chấm công phải bắt đầu bằng 'CC' followed by digits (ví dụ: CC001).")],
        verbose_name="Mã chấm công"
    )
    GioVao = models.TimeField(verbose_name="Giờ vào")
    GioRa = models.TimeField(verbose_name="Giờ ra")
    SoGioLam = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Số giờ làm")
    TrangThai = models.CharField(max_length=50, choices=STATUS_CHOICES, verbose_name="Trạng thái")
    GhiChu = models.TextField(verbose_name="Ghi chú", null=True, blank=True)
    
    # Liên kết với NhanVien và LichLamViec
    MaNhanVien = models.ForeignKey('employee.NhanVien', on_delete=models.CASCADE, verbose_name="Nhân viên")
    MaLich = models.ForeignKey('schedule.LichLamViec', on_delete=models.CASCADE, verbose_name="Lịch làm việc")

    def save(self, *args, **kwargs):
        # Automated SoGioLam Calculation
        if self.GioVao and self.GioRa:
            # Convert time to datetime to subtract
            from datetime import datetime, date
            d_today = date.today()
            dt_vao = datetime.combine(d_today, self.GioVao)
            dt_ra = datetime.combine(d_today, self.GioRa)
            
            # If Ra < Vao, assume cross midnight (though not likely for these shifts)
            if dt_ra < dt_vao:
                from datetime import timedelta
                dt_ra += timedelta(days=1)
                
            diff = dt_ra - dt_vao
            self.SoGioLam = Decimal(diff.total_seconds() / 3600).quantize(Decimal('0.00'))
        
        super(ChamCong, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.MaChamCong} - {self.MaNhanVien.HoTen} ({self.MaLich.NgayLam})"

    class Meta:
        verbose_name = "Chấm công"
        verbose_name_plural = "Danh sách chấm công"
