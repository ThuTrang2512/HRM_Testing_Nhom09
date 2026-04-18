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
            from datetime import datetime, date, time, timedelta
            from decimal import Decimal
            d_today = date.today()
            dt_vao = datetime.combine(d_today, self.GioVao)
            dt_ra = datetime.combine(d_today, self.GioRa)
            
            ca_lam = None
            if self.MaLich:
                ca_lam = self.MaLich.CaLam
                
            shift_start = None
            shift_end = None
            
            if ca_lam:
                ca_lam_lower = ca_lam.lower()
                if 'sáng' in ca_lam_lower or 'sang' in ca_lam_lower:
                    shift_start = time(6, 0)
                    shift_end = time(12, 0)
                elif 'chiều' in ca_lam_lower or 'chieu' in ca_lam_lower:
                    shift_start = time(12, 0)
                    shift_end = time(17, 0)
                elif 'tối' in ca_lam_lower or 'toi' in ca_lam_lower or 't\u1ed1i' in ca_lam_lower:
                    shift_start = time(17, 0)
                    shift_end = time(22, 0)
            
            # Nếu không nhận diện được qua tên, thử lấy trực tiếp từ Lịch
            if not shift_start and self.MaLich:
                if self.MaLich.GioBatDau and self.MaLich.GioKetThuc:
                    shift_start = self.MaLich.GioBatDau
                    shift_end = self.MaLich.GioKetThuc

            if shift_start and shift_end:
                dt_shift_start = datetime.combine(d_today, shift_start)
                
                if dt_ra < dt_vao:
                    dt_ra += timedelta(days=1)
                
                # Check-in sớm hơn ca -> tính từ đầu ca. Trễ hơn -> tính từ lúc check-in
                actual_start = max(dt_vao, dt_shift_start)
                actual_end = dt_ra
                
                diff = actual_end - actual_start
                minutes = max(0, diff.total_seconds() / 60)
                
                self.SoGioLam = Decimal(minutes / 60.0).quantize(Decimal('0.00'))
            else:
                if dt_ra < dt_vao:
                    dt_ra += timedelta(days=1)
                diff = dt_ra - dt_vao
                self.SoGioLam = Decimal(diff.total_seconds() / 3600).quantize(Decimal('0.00'))
        
        super(ChamCong, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.MaChamCong} - {self.MaNhanVien.HoTen} ({self.MaLich.NgayLam})"

    class Meta:
        verbose_name = "Chấm công"
        verbose_name_plural = "Danh sách chấm công"
