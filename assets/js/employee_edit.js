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

    // Load and display avatar if exists
    const avatarImage = document.getElementById('avatarImage');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    if (empData.avatar) {
        avatarImage.src = empData.avatar;
        avatarImage.classList.remove('hidden');
        avatarPlaceholder.classList.add('hidden');
    }

    // Handle image upload
    const avatarContainer = document.getElementById('avatarContainer');
    const imageInput = document.getElementById('imageInput');

    if (avatarContainer) {
        avatarContainer.addEventListener('click', () => {
            imageInput.click();
        });
    }

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageData = event.target.result; // Base64 string

                    // Save image to localStorage
                    empData.avatar = imageData;
                    employees[empIndex].avatar = imageData;
                    localStorage.setItem('employees', JSON.stringify(employees));

                    // Display image on UI
                    avatarImage.src = imageData;
                    avatarImage.classList.remove('hidden');
                    avatarPlaceholder.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Populate Data into Editable fields
    const empName = document.getElementById('empName');
    const empGender = document.getElementById('empGender');
    const empDob = document.getElementById('empDob');
    const empCccd = document.getElementById('empCccd');
    const empPhone = document.getElementById('empPhone');
    const empBankAccount = document.getElementById('empBankAccount');
    const empRole = document.getElementById('empRole');
    const empAddress = document.getElementById('empAddress');
    const empWorkAddress = document.getElementById('empWorkAddress');

    empName.value = empData.name || '';
    empGender.value = empData.gender || '';
    empDob.value = empData.dob || '';
    empCccd.value = empData.cccd || '';
    empPhone.value = empData.phone || '';
    if (empBankAccount) empBankAccount.value = empData.bankAccount || '';
    empRole.value = empData.role || '';
    empAddress.value = empData.address || '';
    empWorkAddress.value = empData.workAddress || '';

    // Enable editing for Address and TempAddress
    empAddress.removeAttribute('readonly');
    empAddress.classList.remove('bg-gray-50');
    empAddress.classList.add('bg-white');

    empWorkAddress.removeAttribute('readonly');
    empWorkAddress.classList.remove('bg-gray-50');
    empWorkAddress.classList.add('bg-white');

    // Handle form submit (Save)
    const form = document.getElementById('employeeEditForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = empName.value.trim();
        const gender = empGender.value.trim();
        const dob = empDob.value.trim();
        const cccd = empCccd.value.trim();
        const phone = empPhone.value.trim();
        const bankAccount = empBankAccount.value.trim();
        const role = empRole.value.trim();
        const address = empAddress.value.trim();
        const workAddress = empWorkAddress.value.trim();

        // Validate empty data
        if (!name || !gender || !dob || !cccd || !phone || !bankAccount || !role || !address || !workAddress) {
            showError('<p class="text-gray-400 text-[16px] mb-1">Thông tin nhập vào không hợp lệ ?</p><p class="text-gray-700 text-[18px] font-medium">Xin vui lòng nhập lại thông tin chính xác !</p>');
            return;
        }

        // Check if data changed
        if (name === empData.name &&
            gender === empData.gender &&
            dob === empData.dob &&
            cccd === empData.cccd &&
            phone === empData.phone &&
            bankAccount === (empData.bankAccount || '') &&
            role === empData.role &&
            address === (empData.address || '') &&
            workAddress === (empData.workAddress || '')) {
            sessionStorage.setItem('showInfoToast', 'true');
            window.location.href = 'employee_list.html';
            return;
        }

        try {
            // Update all fields in database (localStorage)
            employees[empIndex].name = name;
            employees[empIndex].gender = gender;
            employees[empIndex].dob = dob;
            employees[empIndex].cccd = cccd;
            employees[empIndex].phone = phone;
            employees[empIndex].bankAccount = bankAccount;
            employees[empIndex].role = role;
            employees[empIndex].address = address;
            employees[empIndex].workAddress = workAddress;
            
            localStorage.setItem('employees', JSON.stringify(employees));
            
            // Setup Success info and redirect
            sessionStorage.setItem('showSuccessToast', 'true');
            sessionStorage.setItem('toastMessage', 'Cập nhật thông tin nhân viên thành công.');
            window.location.href = 'employee_list.html';

        } catch (err) {
            // Exception saving
            showError('Không thể cập nhật thông tin nhân viên. Vui lòng thử lại sau.');
        }
    });

    // Handle Cancel (Hủy thao tác) - Flow 6a
    document.getElementById('btnCancelOp').addEventListener('click', () => {
        showConfirm(); // Prompt dialog 6a1
    });

});
