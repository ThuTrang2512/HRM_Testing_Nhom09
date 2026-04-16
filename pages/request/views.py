from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import YeuCau
import json

def get_requests(request):
    if request.method == 'GET':
        yeucaus = YeuCau.objects.select_related('MaNhanVien').all()
        data = []
        for yc in yeucaus:
            ca_lam = (yc.CaLam or "").lower()
            start_time = "N/A"
            end_time = "N/A"

            if '6h-12h' in ca_lam or 'sáng' in ca_lam:
                start_time = '06:00'
                end_time = '12:00'
            elif '12h-17h' in ca_lam or 'chiều' in ca_lam:
                start_time = '12:00'
                end_time = '17:00'
            elif '17h-22h' in ca_lam or 'tối' in ca_lam:
                start_time = '17:00'
                end_time = '22:00'

            status_map = {
                'Chờ duyệt': 'pending',
                'Đã duyệt': 'approved',
                'Đã từ chối': 'rejected'
            }

            item = {
                'id': yc.MaYeuCau,
                'employeeId': yc.MaNhanVien.MaNhanVien if yc.MaNhanVien else "N/A",
                'employeeName': yc.MaNhanVien.HoTen if yc.MaNhanVien else "N/A",
                'type': yc.LoaiYC,
                'requestDate': yc.NgayDK.strftime('%d/%m/%Y') if yc.NgayDK else '',
                'status': status_map.get(yc.TrangThai, 'pending'),
                'startDate': yc.NgayBD.strftime('%d/%m/%Y') if yc.NgayBD else '',
                'endDate': yc.NgayKT.strftime('%d/%m/%Y') if yc.NgayKT else '',
                'reason': yc.LyDo or '',
                'workDate': yc.NgayBD.strftime('%d/%m/%Y') if yc.NgayBD else '',
                'startTime': start_time,
                'endTime': end_time,
                'shiftName': yc.CaLam
            }
            data.append(item)
        return JsonResponse(data, safe=False)
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def update_request_status(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            request_id = body.get('requestId')
            status = body.get('status') # 'approved' or 'rejected'
            reject_reason = body.get('rejectReason', '')

            yc = YeuCau.objects.get(MaYeuCau=request_id)
            if status == 'approved':
                yc.TrangThai = 'Đã duyệt'
            elif status == 'rejected':
                yc.TrangThai = 'Đã từ chối'
                if reject_reason:
                    current_reason = yc.LyDo or ''
                    yc.LyDo = f"{current_reason}\n[Từ chối vì: {reject_reason}]".strip()
            yc.save()
            return JsonResponse({'message': 'Success'})
        except YeuCau.DoesNotExist:
            return JsonResponse({'error': 'Request not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)
