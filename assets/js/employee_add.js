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

    // Retrieve employees from localStorage or initialize empty array
    let employees = JSON.parse(localStorage.getItem('employees')) || [];

    // Avatar Logic
    const avatarContainer = document.getElementById('avatarContainer');
    const imageInput = document.getElementById('imageInput');
    const avatarImage = document.getElementById('avatarImage');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    let currentAvatarData = null;

    if (avatarContainer && imageInput) {
        avatarContainer.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentAvatarData = event.target.result; // Base64 string
                    avatarImage.src = currentAvatarData;
                    avatarImage.classList.remove('hidden');
                    avatarPlaceholder.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Button actions in Error Modal
    if (btnQuayLai) btnQuayLai.addEventListener('click', hideError);
    if (btnThoat) btnThoat.addEventListener('click', () => {
        window.location.href = 'employee_list.html';
    });

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
        const workAddress = document.getElementById('empWorkAddress').value.trim();

        const submitBtn = document.getElementById('saveBtn');

        // Exception Flow 5a: Missing required fields
        if (!name || !role || !gender || !dobRaw || !cccd || !phone || !address || !workAddress) {
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
                workAddress,
                avatar: currentAvatarData // Save uploaded avatar
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
