from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import LichLamViec
from pages.employee.models import NhanVien
import json
from datetime import datetime, timedelta
from django.utils import timezone

def schedule_page(request):
    employees = NhanVien.objects.filter(TrangThai='Đang làm việc')
    return render(request, 'schedule/schedule_list.html', {'employees': employees})

def api_get_employees(request):
    employees = NhanVien.objects.filter(TrangThai='Đang làm việc')
    data = []
    for emp in employees:
        data.append({
            'id': emp.MaNhanVien,
            'name': emp.HoTen,
            'role': emp.ChucVu,
            'phone': emp.SoDienThoai,
            'color': f"hsl({(hash(emp.MaNhanVien) % 360)}, 70%, 50%)" 
        })
    return JsonResponse({'employees': data})

def api_get_schedules(request):
    start_date_str = request.GET.get('start')
    end_date_str = request.GET.get('end')
    
    query = LichLamViec.objects.all()
    if start_date_str and end_date_str:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        query = query.filter(NgayLam__range=[start_date, end_date])
        
    schedules = []
    for s in query:
        schedules.append({
            'id': s.MaLich,
            'empId': s.MaNhanVien.MaNhanVien,
            'name': s.MaNhanVien.HoTen,
            'role': s.MaNhanVien.ChucVu,
            'date': s.NgayLam.strftime('%Y-%m-%d'),
            'start': s.GioBatDau.strftime('%H:%M') if s.GioBatDau else '',
            'end': s.GioKetThuc.strftime('%H:%M') if s.GioKetThuc else '',
            'note': s.GhiChu or '',
            'status': s.TrangThai
        })
    return JsonResponse({'schedules': schedules})

@csrf_exempt
def api_save_schedule(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            schedule_id_to_edit = data.get('id')
            emp_ids = data.get('empId')
            date_str = data.get('date')
            start_str = data.get('start')
            end_str = data.get('end')
            note = data.get('note')
            
            if not isinstance(emp_ids, list):
                emp_ids = [emp_ids] if emp_ids else []
            
            if not emp_ids and not schedule_id_to_edit:
                return JsonResponse({'success': False, 'message': 'Vui lòng chọn nhân viên'})

            # Convert date and time strings
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            start_time_obj = datetime.strptime(start_str, '%H:%M').time()
            end_time_obj = datetime.strptime(end_str, '%H:%M').time()

            # --- PAST TIME CHECK ---
            shift_start_dt = datetime.combine(date_obj, start_time_obj)
            # Compare with current local time
            if shift_start_dt < datetime.now():
                return JsonResponse({'success': False, 'message': 'Không thể tạo hoặc chỉnh sửa lịch làm việc cho thời gian ở quá khứ.'})

            # Fetch base ID for batch generation
            last_schedule = LichLamViec.objects.all().order_by('MaLich').last()
            start_num = 1
            if last_schedule:
                try:
                    start_num = int(last_schedule.MaLich[4:]) + 1
                except ValueError:
                    start_num = 1

            created_count = 0
            skipped_count = 0

            if schedule_id_to_edit:
                LichLamViec.objects.filter(
                    NgayLam=date_obj,
                    GioBatDau=start_time_obj,
                    GioKetThuc=end_time_obj
                ).delete()
                
                for eid in emp_ids:
                    employee = get_object_or_404(NhanVien, MaNhanVien=eid)
                    new_id = f"MLLV{start_num + created_count:06d}"
                    schedule = LichLamViec(
                        MaLich=new_id,
                        MaNhanVien=employee,
                        NgayLam=date_obj,
                        GioBatDau=start_time_obj,
                        GioKetThuc=end_time_obj,
                        GhiChu=note
                    )
                    schedule.save()
                    created_count += 1
                
                return JsonResponse({'success': True, 'message': 'Cập nhật thành công'})
            
            else:
                for eid in emp_ids:
                    employee = get_object_or_404(NhanVien, MaNhanVien=eid)
                    existing_schedule = LichLamViec.objects.filter(
                        MaNhanVien=employee,
                        NgayLam=date_obj,
                        GioBatDau=start_time_obj,
                        GioKetThuc=end_time_obj
                    ).first()

                    if existing_schedule:
                        skipped_count += 1
                        continue
                    
                    new_id = f"MLLV{start_num + created_count:06d}"
                    schedule = LichLamViec(
                        MaLich=new_id,
                        MaNhanVien=employee,
                        NgayLam=date_obj,
                        GioBatDau=start_time_obj,
                        GioKetThuc=end_time_obj,
                        GhiChu=note
                    )
                    schedule.save()
                    created_count += 1
                
                return JsonResponse({'success': True, 'message': 'Lưu thành công'})

        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
            
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def api_delete_schedule(request, pk):
    if request.method == 'POST':
        try:
            schedule = get_object_or_404(LichLamViec, MaLich=pk)
            schedule.delete()
            return JsonResponse({'success': True, 'message': 'Xóa lịch làm việc thành công'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def api_send_notification(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            schedule_ids = data.get('ids', [])
            if not schedule_ids:
                return JsonResponse({'success': False, 'message': 'Không có lịch làm việc nào được chọn'})
            LichLamViec.objects.filter(MaLich__in=schedule_ids).update(TrangThai='Đã gửi')
            return JsonResponse({'success': True, 'message': 'Đã gửi thông báo thành công'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid request method'})
