document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra session xem đang click vào nhân viên nào
    const viewId = sessionStorage.getItem('viewingEmployeeId');
    if (!viewId) {
        window.location.href = 'employee_list.html'; // Nếu không có thì văng về list
        return;
    }

    // 2. Kéo dữ liệu từ localStorage
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    const empData = employees.find(e => e.id === viewId);
    
    if (!empData) {
        window.location.href = 'employee_list.html'; // Không tìm thấy ID cũng văng về list
        return;
    }

    // 3. Đưa dữ liệu lên Giao diện
    document.getElementById('viewId').value = empData.id;
    document.getElementById('viewName').value = empData.name;
    document.getElementById('viewGender').value = empData.gender;
    document.getElementById('viewCccd').value = empData.cccd;
    document.getElementById('viewPhone').value = empData.phone;
    document.getElementById('viewDob').value = empData.dob;
    
    // Address có thể rỗng nếu tạo từ bản cũ
    document.getElementById('viewAddress').value = empData.address || '';
    document.getElementById('viewTempAddress').value = empData.tempAddress || '';
    
    document.getElementById('viewRole').value = empData.role;

    // 4. Lắng nghe sự kiện chuyển trang để Sửa
    const btnGoToEdit = document.getElementById('btnGoToEdit');
    if (btnGoToEdit) {
        btnGoToEdit.addEventListener('click', () => {
            // Chuyển cờ sang Sửa
            sessionStorage.setItem('editingEmployeeId', empData.id);
            window.location.href = 'employee_edit.html';
        });
    }
});
