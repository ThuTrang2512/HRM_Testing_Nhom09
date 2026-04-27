from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from datetime import date
from dateutil.relativedelta import relativedelta

def validate_min_age(value):
    age = relativedelta(date.today(), value).years
    if age < 18:
        raise ValidationError("Ngày sinh không hợp lệ.")

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

    STATUS_CHOICES = [
        ('Đang làm việc', 'Đang làm việc'),
        ('Ngừng hoạt động', 'Ngừng hoạt động'),
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
        verbose_name="Họ tên",
        error_messages={'required': 'Họ tên không được để trống. Vui lòng nhập thông tin'}
    )
    GioiTinh = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name="Giới tính", error_messages={'required': 'Giới tính không được để trống. Vui lòng nhập thông tin'})
    Ngaysinh = models.DateField(validators=[validate_min_age], verbose_name="Ngày sinh", error_messages={'required': 'Ngày sinh không được để trống. Vui lòng nhập thông tin'})
    TaiKhoanNH = models.CharField(max_length=100, verbose_name="Tài khoản ngân hàng", error_messages={'required': 'Tài khoản ngân hàng không được để trống. Vui lòng nhập thông tin'})
    SoDienThoai = models.CharField(
        max_length=10, 
        unique=True,
        validators=[RegexValidator(regex=r'^0\d{9}$', message="Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0.")],
        verbose_name="Số điện thoại",
        error_messages={
            'unique': "Số điện thoại này đã tồn tại trong hệ thống.",
            'required': 'Số điện thoại không được để trống. Vui lòng nhập thông tin'
        }
    )
    CCCD = models.CharField(
        max_length=12, 
        unique=True, 
        validators=[RegexValidator(regex=r'^\d{12}$', message="CCCD phải có đúng 12 chữ số.")],
        verbose_name="CCCD/CMND",
        error_messages={
            'unique': "Số CCCD này đã tồn tại trong hệ thống.",
            'required': 'CCCD không được để trống. Vui lòng nhập thông tin'
        }
    )
    DiaChiLV = models.CharField(max_length=255, verbose_name="Địa chỉ làm việc", error_messages={'required': 'Địa chỉ làm việc không được để trống. Vui lòng nhập thông tin'})
    DiaChi = models.CharField(max_length=255, verbose_name="Địa chỉ", error_messages={'required': 'Địa chỉ không được để trống. Vui lòng nhập thông tin'})
    ChucVu = models.CharField(max_length=50, choices=POSITION_CHOICES, verbose_name="Chức vụ", error_messages={'required': 'Chức vụ không được để trống. Vui lòng nhập thông tin'})
    TrangThai = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Đang làm việc', verbose_name="Trạng thái")
    HinhAnh = models.ImageField(upload_to='employees/', null=True, blank=True, verbose_name="Hình ảnh")
    
    @staticmethod
    def generate_next_id():
        last_employee = NhanVien.objects.all().order_by('MaNhanVien').last()
        if not last_employee:
            return "NV00000001"
        
        last_id = last_employee.MaNhanVien
        try:
            # Extract number from NVxxxxxxxx
            number_part = int(last_id[2:])
            next_number = number_part + 1
            return f"NV{next_number:08d}"
        except (ValueError, IndexError):
            # Fallback if ID format is unexpected
            return "NV00000001"

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
