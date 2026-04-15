from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from datetime import date

class HopDongLaoDong(models.Model):
    TYPE_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
    ]

    STATUS_CHOICES = [
        ('Còn hạn', 'Còn hạn'),
        ('Hết hạn', 'Hết hạn'),
        ('Sắp đến hạn', 'Sắp đến hạn'),
    ]

    POSITION_CHOICES = [
        ('Thu ngân', 'Thu ngân'),
        ('Quản lý', 'Quản lý'),
        ('Pha chế', 'Pha chế'),
        ('Phục vụ', 'Phục vụ'),
        ('Giữ xe', 'Giữ xe'),
    ]

    MaHopDong = models.CharField(
        primary_key=True, 
        max_length=20, 
        validators=[RegexValidator(regex=r'^HD\d+$', message="Mã hợp đồng phải bắt đầu bằng 'HD' followed by digits (ví dụ: HD001).")],
        verbose_name="Mã hợp đồng"
    )
    NgayBatDau = models.DateField(verbose_name="Ngày bắt đầu")
    NgayKetThuc = models.DateField(verbose_name="Ngày kết thúc")
    MucLuong = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Mức lương")
    ChucVu = models.CharField(max_length=50, choices=POSITION_CHOICES, verbose_name="Chức vụ")
    LoaiHopDong = models.CharField(max_length=100, choices=TYPE_CHOICES, verbose_name="Loại hợp đồng")
    TrangThai = models.CharField(max_length=50, choices=STATUS_CHOICES, verbose_name="Trạng thái")
    # Liên kết với NhanVien
    MaNhanVien = models.ForeignKey('employee.NhanVien', on_delete=models.CASCADE, verbose_name="Nhân viên")

    def clean(self):
        if self.NgayBatDau and self.NgayKetThuc:
            if self.NgayKetThuc <= self.NgayBatDau:
                raise ValidationError("Ngày kết thúc phải sau ngày bắt đầu.")

    def save(self, *args, **kwargs):
        # Auto-update status based on dates
        today = date.today()
        if self.NgayBatDau and self.NgayKetThuc:
            if today < self.NgayBatDau:
                self.TrangThai = 'Sắp đến hạn'
            elif self.NgayBatDau <= today <= self.NgayKetThuc:
                self.TrangThai = 'Còn hạn'
            else:
                self.TrangThai = 'Hết hạn'
        super(HopDongLaoDong, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.MaHopDong} - {self.MaNhanVien.HoTen}"

    class Meta:
        verbose_name = "Hợp đồng lao động"
        verbose_name_plural = "Danh sách hợp đồng lao động"

class HopDongLaoDong_CT(models.Model):
    MaHopDong = models.OneToOneField(HopDongLaoDong, primary_key=True, on_delete=models.CASCADE, verbose_name="Mã hợp đồng")
    LuongCoBan = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Lương cơ bản")
    LuongTheoGio = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Lương theo giờ")
    CheDoThuong = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Chế độ thưởng", null=True, blank=True)
    SoGioLam = models.IntegerField(verbose_name="Số giờ làm")
    GhiChu = models.TextField(verbose_name="Ghi chú", null=True, blank=True)

    def save(self, *args, **kwargs):
        # Salary logic based on contract type
        if self.MaHopDong.LoaiHopDong == 'Full-time':
            self.LuongTheoGio = 0
        elif self.MaHopDong.LoaiHopDong == 'Part-time':
            self.LuongCoBan = 0
        super(HopDongLaoDong_CT, self).save(*args, **kwargs)

    def __str__(self):
        return f"Chi tiết hợp đồng: {self.MaHopDong.MaHopDong}"

    class Meta:
        verbose_name = "Chi tiết hợp đồng lao động"
        verbose_name_plural = "Danh sách chi tiết hợp đồng"
