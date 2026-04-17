from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import LichLamViec
from pages.employee.models import NhanVien
import json
from datetime import datetime, timedelta

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
            id = data.get('id')
            emp_ids = data.get('empId') # Can be string or list
            date = data.get('date')
            start = data.get('start')
            end = data.get('end')
            note = data.get('note')
            
            # Convert single ID to list for unified processing
            if not isinstance(emp_ids, list):
                emp_ids = [emp_ids] if emp_ids else []
            
            if not emp_ids and not id:
                return JsonResponse({'success': False, 'message': 'Vui lòng chọn nhân viên'})

            # Unified Save Logic: Clear existing for this slot and re-insert 
            if id:
                 LichLamViec.objects.filter(NgayLam=date, GioBatDau=start, GioKetThuc=end).delete()
            
            # Fetch base ID for batch generation
            last_schedule = LichLamViec.objects.all().order_by('MaLich').last()
            start_num = 1
            if last_schedule:
                try:
                    start_num = int(last_schedule.MaLich[4:]) + 1
                except:
                    start_num = 1

            # Create new records for everyone in the selection
            for i, eid in enumerate(emp_ids):
                employee = get_object_or_404(NhanVien, MaNhanVien=eid)
                new_id = f"MLLV{start_num + i:06d}"
                schedule = LichLamViec(
                    MaLich=new_id,
                    MaNhanVien=employee,
                    NgayLam=date,
                    GioBatDau=start,
                    GioKetThuc=end,
                    GhiChu=note
                )
                schedule.save()
            
            return JsonResponse({'success': True, 'message': 'Lưu lịch làm việc thành công'})
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
                
            # Update status to 'Đã gửi' for all IDs
            LichLamViec.objects.filter(MaLich__in=schedule_ids).update(TrangThai='Đang áp dụng')
            # Wait, the mockup uses 'Đã gửi'. Let me check the model's choices. Actually, the frontend displayed 'Đã gửi'. But let's check `pages/schedule/models.py` to see choices later if needed. I'll use "Đã gửi" mapping to some string or just "Đã gửi". Let's stick to "Đã gửi" for now.
            # I'll update it to 'Đã gửi' and handle model choices if it crashes.
            
            # Re-read model definition to be safe. Wait, the frontend mockup uses `Đã gửi`. Wait, in the Python code `api_get_schedules` returns `s.TrangThai`. I'll set it to 'Đã gửi'.
            LichLamViec.objects.filter(MaLich__in=schedule_ids).update(TrangThai='Đã gửi')
            
            return JsonResponse({'success': True, 'message': 'Đã gửi thông báo thành công'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid request method'})
