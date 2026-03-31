document.addEventListener('DOMContentLoaded', () => {
    // Check editing permission
    const editId = sessionStorage.getItem('editingEmployeeId');
    if (!editId) {
        window.location.href = 'employee_list.html';
        return;
    }

    // Modal elements
    const errorModal = document.getElementById('errorModal');
    const errorModalContent = document.getElementById('errorModalContent');
    const errorText = document.getElementById('errorText');
    const btnQuayLai = document.getElementById('btnQuayLai');

    const confirmModal = document.getElementById('confirmModal');
    const confirmModalContent = document.getElementById('confirmModalContent');
    const btnConfirmNo = document.getElementById('btnConfirmNo');
    const btnConfirmYes = document.getElementById('btnConfirmYes');

    // UI Feedback Helpers
    const showError = (messageHTML) => {
        errorText.innerHTML = messageHTML;
        errorModal.classList.remove('hidden');
        setTimeout(() => {
            errorModal.classList.remove('opacity-0');
            errorModalContent.classList.remove('scale-95', 'opacity-0');
        }, 10);
    };
    
    const hideError = () => {
        errorModal.classList.add('opacity-0');
        errorModalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            errorModal.classList.add('hidden');
        }, 300);
    };

    const btnThoatError = document.getElementById('btnThoatError');
    if (btnThoatError) {
        btnThoatError.addEventListener('click', () => {
            window.location.href = 'employee_list.html';
        });
    }

    const showConfirm = () => {
        confirmModal.classList.remove('hidden');
        setTimeout(() => {
            confirmModal.classList.remove('opacity-0');
            confirmModalContent.classList.remove('scale-95', 'opacity-0');
        }, 10);
    };

    const hideConfirm = () => {
        confirmModal.classList.add('opacity-0');
        confirmModalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            confirmModal.classList.add('hidden');
        }, 300);
    };

    // Bind event listeners for modals
    if (btnQuayLai) btnQuayLai.addEventListener('click', hideError);
    if (btnConfirmNo) btnConfirmNo.addEventListener('click', hideConfirm); // Flow 6a3
    if (btnConfirmYes) {
        btnConfirmYes.addEventListener('click', () => { // Flow 6a2
            window.location.href = 'employee_list.html';
        });
    }

    // Load Data
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    const empIndex = employees.findIndex(e => e.id === editId);
    
    if (empIndex === -1) {
        window.location.href = 'employee_list.html';
        return;
    }
    
    const empData = employees[empIndex];

    // Populate Data into Disabled fields
    document.getElementById('empId').value = empData.id;
    document.getElementById('empName').value = empData.name;
    document.getElementById('empGender').value = empData.gender;
    document.getElementById('empDob').value = empData.dob;
    document.getElementById('empCccd').value = empData.cccd;
    document.getElementById('empPhone').value = empData.phone;

    // Populate Data into Active fields
    const empRole = document.getElementById('empRole');
    const empAddress = document.getElementById('empAddress');
    const empTempAddress = document.getElementById('empTempAddress');

    empRole.value = empData.role;
    empAddress.value = empData.address || '';
    empTempAddress.value = empData.tempAddress || '';

    // Handle form submit (Save)
    const form = document.getElementById('employeeEditForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const role = empRole.value.trim();
        const address = empAddress.value.trim();
        const tempAddress = empTempAddress.value.trim();

        // 7b: Invalid empty data checking
        if (!role || !address || !tempAddress) {
            showError('<p class="text-gray-400 text-[16px] mb-1">Thông tin nhập vào không hợp lệ ?</p><p class="text-gray-700 text-[18px] font-medium">Xin vui lòng nhập lại thông tin chính xác !</p>');
            return;
        }

        // 7a: Data not changed checking
        if (role === empData.role && address === (empData.address || '') && tempAddress === (empData.tempAddress || '')) {
            sessionStorage.setItem('showInfoToast', 'true');
            window.location.href = 'employee_list.html';
            return;
        }

        try {
            // Main Flow: Update DB (localStorage)
            employees[empIndex].role = role;
            employees[empIndex].address = address;
            employees[empIndex].tempAddress = tempAddress;
            
            localStorage.setItem('employees', JSON.stringify(employees));
            
            // Setup Success info and redirect
            sessionStorage.setItem('showSuccessToast', 'true');
            sessionStorage.setItem('toastMessage', 'Cập nhật thông tin nhân viên thành công.');
            window.location.href = 'employee_list.html';

        } catch (err) {
            // 9a: Exception saving
            showError('Không thể cập nhật thông tin nhân viên. Vui lòng thử lại sau.');
        }
    });

    // Handle Cancel (Hủy thao tác) - Flow 6a
    document.getElementById('btnCancelOp').addEventListener('click', () => {
        showConfirm(); // Prompt dialog 6a1
    });

});
