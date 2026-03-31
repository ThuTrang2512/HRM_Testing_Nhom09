document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('employeeAddForm');
    const errorModal = document.getElementById('errorModal');
    const errorModalContent = document.getElementById('errorModalContent');
    const errorText = document.getElementById('errorText');
    const btnThoat = document.getElementById('btnThoat');
    const btnQuayLai = document.getElementById('btnQuayLai');

    // Helper to show custom error popup
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

    // Button actions in Error Modal
    if (btnQuayLai) btnQuayLai.addEventListener('click', hideError);
    if (btnThoat) btnThoat.addEventListener('click', () => {
        window.location.href = 'employee_list.html';
    });

    // Retrieve employees from localStorage or initialize empty array
    let employees = JSON.parse(localStorage.getItem('employees')) || [];

    // Helper to format date from "yyyy-mm-dd" to "dd/mm/yyyy"
    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // Helper to generate new Employee ID
    const generateId = () => {
        if (!employees || employees.length === 0) return 'NV00001';
        // Get last ID and increment
        const lastEmp = employees[employees.length - 1];
        const num = parseInt(lastEmp.id.replace('NV', '')) + 1;
        return `NV${num.toString().padStart(5, '0')}`;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Read form values
        const name = document.getElementById('empName').value.trim();
        const role = document.getElementById('empRole').value;
        const gender = document.getElementById('empGender').value;
        const dobRaw = document.getElementById('empDob').value;
        const cccd = document.getElementById('empCccd').value.trim();
        const phone = document.getElementById('empPhone').value.trim();
        const address = document.getElementById('empAddress').value.trim();
        const tempAddress = document.getElementById('empTempAddress').value.trim();

        const submitBtn = document.getElementById('saveBtn');

        // Exception Flow 5a: Missing required fields
        if (!name || !role || !gender || !dobRaw || !cccd || !phone || !address || !tempAddress) {
            showError('Xin vui lòng nhập đầy đủ thông tin !');
            return;
        }

        // Exception Flow 5c: Invalid format
        const phoneRegex = /^0[0-9]{9}$/;
        const cccdRegex = /^[0-9]{12}$/;
        
        if (!phoneRegex.test(phone) || !cccdRegex.test(cccd)) {
            showError('<span class="text-gray-400">Thông tin không hợp lệ ?</span><br><span class="text-gray-600 mt-1 inline-block">Xin vui lòng nhập lại thông tin chính xác !</span>');
            return;
        }

        // Exception Flow 5b: Duplicate CCCD or phone
        if (employees.some(emp => emp.phone === phone || emp.cccd === cccd)) {
            showError('<span class="text-gray-400">CCCD hoặc số điện thoại đã tồn tại ?</span><br><span class="text-gray-600 mt-1 inline-block">Xin vui lòng nhập lại thông tin chính xác !</span>');
            return;
        }

        try {
            // Main Flow: Success
            const newEmp = {
                id: generateId(),
                name,
                gender,
                dob: formatDate(dobRaw),
                cccd,
                phone,
                role,
                address,
                tempAddress
            };

            employees.push(newEmp);
            
            // Save to localStorage
            localStorage.setItem('employees', JSON.stringify(employees));

            // Show success toast on next page load
            sessionStorage.setItem('showSuccessToast', 'true');
            
            // Redirect
            window.location.href = 'employee_list.html';
        } catch (error) {
            // Exception Flow 6a: Saving error
            showError('Không thể thêm nhân viên !');
        }
    });
});
