from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from datetime import date
from dateutil.relativedelta import relativedelta

def validate_min_age(value):
    age = relativedelta(date.today(), value).years
    if age < 18:
        raise ValidationError("Nhân viên phải từ 18 tuổi trở lên.")

class NhanVien(models.Model):
    GENDER_CHOICES = [
        ('Nam', 'Nam'),
        ('Nữ', 'Nữ'),
        ('Khác', 'Khác'),
    ]

    POSITION_CHOICES = [
        ('Thu ngân', 'Thu ngân'),
        ('Quản lý', 'Quản lý'),
        ('Pha chế', 'Pha chế'),
        ('Phục vụ', 'Phục vụ'),
        ('Giữ xe', 'Giữ xe'),
    ]

    MaNhanVien = models.CharField(
        primary_key=True, 
        max_length=20, 
        validators=[RegexValidator(regex=r'^NV\d+$', message="Mã nhân viên phải bắt đầu bằng 'NV' followed by digits (ví dụ: NV001).")],
        verbose_name="Mã nhân viên"
    )
    HoTen = models.CharField(
        max_length=100, 
        validators=[RegexValidator(regex=r'^[a-zA-ZÀ-ỹ\s]+$', message="Họ tên chỉ được chứa chữ cái và khoảng trắng.")],
        verbose_name="Họ tên"
    )
    GioiTinh = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name="Giới tính")
    Ngaysinh = models.DateField(validators=[validate_min_age], verbose_name="Ngày sinh")
    TaiKhoanNH = models.CharField(max_length=100, verbose_name="Tài khoản ngân hàng")
    SoDienThoai = models.CharField(
        max_length=10, 
        validators=[RegexValidator(regex=r'^0\d{9}$', message="Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.")],
        verbose_name="Số điện thoại"
    )
    CCCD = models.CharField(
        max_length=12, 
        unique=True, 
        validators=[RegexValidator(regex=r'^\d{12}$', message="CCCD phải có đúng 12 chữ số.")],
        verbose_name="CCCD/CMND"
    )
    DiaChiLV = models.CharField(max_length=255, verbose_name="Địa chỉ làm việc")
    DiaChi = models.CharField(max_length=255, verbose_name="Địa chỉ thường trú")
    ChucVu = models.CharField(max_length=50, choices=POSITION_CHOICES, verbose_name="Chức vụ")

    def save(self, *args, **kwargs):
        # Normalizing name to Title Case
        if self.HoTen:
            self.HoTen = self.HoTen.title()
        super(NhanVien, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.MaNhanVien} - {self.HoTen}"

    class Meta:
        verbose_name = "Nhân viên"
        verbose_name_plural = "Danh sách nhân viên"
