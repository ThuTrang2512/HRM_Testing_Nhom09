from django.db import models
from django.core.validators import RegexValidator

class LichLamViec(models.Model):
    SHIFT_CHOICES = [
        ('Ca sáng', 'Ca sáng'),
        ('Ca chiều', 'Ca chiều'),
        ('Ca tối', 'Ca tối'),
    ]

    STATUS_CHOICES = [
        ('Chưa gửi', 'Chưa gửi'),
        ('Đã gửi', 'Đã gửi'),
    ]

    MaLich = models.CharField(
        primary_key=True, 
        max_length=20, 
        validators=[RegexValidator(regex=r'^MLLV\d+$', message="Mã lịch phải bắt đầu bằng 'MLLV' followed by digits (ví dụ: MLLV000001).")],
        verbose_name="Mã lịch",
        blank=True
    )
    NgayLam = models.DateField(verbose_name="Ngày làm")
    CaLam = models.CharField(max_length=50, choices=SHIFT_CHOICES, verbose_name="Ca làm", null=True, blank=True)
    GioBatDau = models.TimeField(verbose_name="Giờ bắt đầu", null=True, blank=True)
    GioKetThuc = models.TimeField(verbose_name="Giờ kết thúc", null=True, blank=True)
    GhiChu = models.TextField(verbose_name="Ghi chú", null=True, blank=True)
    TrangThai = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Chưa gửi', verbose_name="Trạng thái")

    @staticmethod
    def generate_next_id():
        last_schedule = LichLamViec.objects.all().order_by('MaLich').last()
        if not last_schedule:
            return "MLLV000001"
        
        last_id = last_schedule.MaLich
        try:
            num = int(last_id[4:])
            return f"MLLV{num + 1:06d}"
        except:
            return "MLLV" + str(id(last_schedule))[:6]

    def save(self, *args, **kwargs):
        if not self.MaLich:
            self.MaLich = self.generate_next_id()
        super().save(*args, **kwargs)
    # Liên kết với NhanVien
    MaNhanVien = models.ForeignKey('employee.NhanVien', on_delete=models.CASCADE, verbose_name="Nhân viên")

    def __str__(self):
        return f"{self.MaLich} - {self.MaNhanVien.HoTen} ({self.NgayLam})"

    class Meta:
        verbose_name = "Lịch làm việc"
        verbose_name_plural = "Danh sách lịch làm việc"
        