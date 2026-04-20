document.addEventListener('DOMContentLoaded', () => {
    const contractIdInput = document.getElementById('contractId');
    const employeeIdInput = document.getElementById('employeeId');
    const employeeNameInput = document.getElementById('employeeName');
    const employeeRoleInput = document.getElementById('employeeRole');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const salaryInput = document.getElementById('salary');
    const contractTypeInput = document.getElementById('contractType');
    const form = document.getElementById('contractAddForm');
    const cancelBtn = document.getElementById('cancelAddBtn');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeErrorBtn = document.getElementById('closeErrorBtn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalContent = document.getElementById('confirmModalContent');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    let contracts = [];
    let employeeList = [];

    // Lấy danh sách hợp đồng và nhân viên từ API
    Promise.all([
        fetch('/contract/api/data/').then(res => res.json()),
        fetch('/employee/api/data/').then(res => res.json())
    ]).then(([contractData, employeeData]) => {
        contracts = contractData.contracts || [];
        employeeList = employeeData.employees || [];

        // Tạo Contract ID
        const lastId = contracts
            .map(contract => contract.id.replace(/\D/g, ''))
            .map(Number)
            .filter(Boolean)
            .sort((a, b) => b - a)[0] || 0;
        contractIdInput.value = `HD${String(lastId + 1).padStart(8, '0')}`;

        // Đổ dữ liệu Datalist
        const employeeDatalist = document.getElementById('employeeList');
        if (employeeDatalist) {
            employeeDatalist.innerHTML = employeeList.map(emp => `<option value="${emp.name}" data-id="${emp.id}"></option>`).join('');
        }
    }).catch(err => console.error("Lỗi khi tải dữ liệu API:", err));

    employeeNameInput.addEventListener('input', (event) => {
        clearInlineError('employeeName');
        const value = event.target.value.trim();
        const emp = employeeList.find(e => e.name === value);
        
        employeeIdInput.value = emp ? emp.id : '';
        if (employeeRoleInput && emp) {
            employeeRoleInput.value = emp.role;
        }

        // Kiểm tra trùng hợp đồng ngay lập tức
        if (emp) {
            const existingContract = contracts.find(c => c.employeeId === emp.id);
            if (existingContract) {
                setInlineError('employeeName', `Nhân viên đã có hợp đồng, vui lòng chọn nhân viên khác`);
            }
        }
    });

    const showError = (text) => {
        if (!errorModal || !errorMessage) return;
        errorMessage.textContent = text;
        errorModal.classList.remove('hidden');
        setTimeout(() => {
            errorModal.classList.remove('opacity-0');
            document.getElementById('errorModalContent').classList.remove('opacity-0', 'scale-95');
        }, 10);
    };

    const hideError = () => {
        if (!errorModal) return;
        errorModal.classList.add('opacity-0');
        document.getElementById('errorModalContent').classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            errorModal.classList.add('hidden');
        }, 300);
    };

    const showConfirm = () => {
        if (!confirmModal) return;
        confirmModal.classList.remove('hidden');
        setTimeout(() => {
            confirmModal.classList.remove('opacity-0');
            confirmModalContent.classList.remove('opacity-0', 'scale-95');
        }, 10);
    };

    const hideConfirm = () => {
        if (!confirmModal) return;
        confirmModal.classList.add('opacity-0');
        document.getElementById('confirmModalContent').classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            confirmModal.classList.add('hidden');
        }, 300);
    };

    const setInlineError = (inputId, message) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`error-${inputId}`);
        if (input) {
            input.classList.add('border-red-500');
            input.classList.remove('border-gray-200');
        }
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden');
        }
    };

    const clearInlineError = (inputId) => {
        const input = document.getElementById(inputId);
        const errorSpan = document.getElementById(`error-${inputId}`);
        if (input) {
            input.classList.remove('border-red-500');
            input.classList.add('border-gray-200');
        }
        if (errorSpan) {
            errorSpan.classList.add('hidden');
            errorSpan.textContent = '';
        }
    };

    const clearAllErrors = () => {
        ['contractType', 'startDate', 'endDate', 'hourSalary', 'minHour'].forEach(clearInlineError);
    };

    // Xóa lỗi khi người dùng bắt đầu nhập lại
    ['contractType', 'startDate', 'endDate', 'hourSalary', 'minHour'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => clearInlineError(id));
            if (el.tagName === 'SELECT') {
                el.addEventListener('change', () => clearInlineError(id));
            }
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        clearAllErrors();

        let hasError = false;
        const requiredFields = [
            { id: 'employeeName', label: 'Tên nhân viên' },
            { id: 'contractType', label: 'Loại hợp đồng' },
            { id: 'startDate', label: 'Ngày bắt đầu' },
            { id: 'endDate', label: 'Ngày kết thúc' },
            { id: 'minHour', label: 'Số giờ làm tối thiểu' }
        ];

        requiredFields.forEach(field => {
            const el = document.getElementById(field.id);
            if (!el || !el.value.trim()) {
                setInlineError(field.id, `${field.label} không được để trống. Vui lòng nhập thông tin`);
                hasError = true;
            }
        });

        // Kiểm tra nhân viên đã có hợp đồng chưa
        if (employeeIdInput.value) {
            const existingContract = contracts.find(c => c.employeeId === employeeIdInput.value);
            if (existingContract) {
                setInlineError('employeeName', `Nhân viên đã có hợp đồng, vui lòng chọn nhân viên khác`);
                hasError = true;
            }
        }

        // Bắt buộc nhập Lương theo giờ nếu là Part-time
        if (contractTypeInput.value === 'Part-time') {
            const hourSal = document.getElementById('hourSalary');
            const hVal = parseFloat(hourSal.value.replace(/[^\d]/g, '')) || 0;
            if (hVal <= 0) {
                setInlineError('hourSalary', 'Lương theo giờ phải lớn hơn 0');
                hasError = true;
            }
        }

        // Kiểm tra lương cơ bản cho Full-time (nếu cần thiết, dựa trên logic business)
        if (contractTypeInput.value === 'Full-time') {
            const bSal = parseFloat(baseSalaryInput.value.replace(/[^\d]/g, '')) || 0;
            if (bSal <= 0) {
                setInlineError('baseSalary', 'Lương cơ bản phải lớn hơn 0');
                hasError = true;
            }
        }

        const minHVal = parseFloat(minHourInput.value.replace(/[^\d]/g, '')) || 0;
        if (minHVal <= 0) {
            setInlineError('minHour', 'Số giờ làm tối thiểu phải lớn hơn 0');
            hasError = true;
        }

        // Kiểm tra ngày bắt đầu không được lớn hơn ngày kết thúc
        if (startDateInput.value && endDateInput.value) {
            if (new Date(startDateInput.value) > new Date(endDateInput.value)) {
                setInlineError('startDate', 'Ngày bắt đầu không được lớn hơn ngày kết thúc.');
                hasError = true;
            }
        }

        if (hasError) return;

        const newContract = {
            id: contractIdInput.value,
            employeeId: employeeIdInput.value.trim(),
            employeeName: employeeNameInput.value.trim(),
            employeeRole: employeeRoleInput.value.trim() || 'Chưa xác định',
            contractType: contractTypeInput.value,
            status: 'Hiệu lực',
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            salary: salaryInput.value.trim(),
            note: document.getElementById('note').value.trim(),
        };

        // Kiểm tra ngày bắt đầu không được lớn hơn ngày kết thúc
        if (new Date(startDateInput.value) > new Date(endDateInput.value)) {
            setInlineError('startDate', 'Ngày bắt đầu không được lớn hơn ngày kết thúc.');
            hasError = true;
        }

        if (hasError) return;

        const formatToVN = (isoString) => {
            if (!isoString) return '';
            if (isoString.includes('/')) return isoString;
            const [y, m, d] = isoString.split('-');
            if (y && m && d) return `${d}/${m}/${y}`;
            return isoString;
        };

        const existingContract = contracts.find(c => c.employeeId === newContract.employeeId && c.status !== 'deleted');
        if (existingContract) {
            showError('Nhân viên đã có hợp đồng. Vui lòng chọn nhân viên khác.');
            return;
        }

        newContract.startDate = formatToVN(startDateInput.value);
        newContract.endDate = formatToVN(endDateInput.value);

        // Submit via API
        const payload = {
            action: 'CREATE',
            ...newContract,
            baseSalary: parseFloat(baseSalaryInput.value.replace(/[^\d]/g, '')) || 0,
            hourSalary: parseFloat(hourSalaryInput.value.replace(/[^\d]/g, '')) || 0,
            bonus: parseFloat(bonusInput.value.replace(/[^\d]/g, '')) || 0,
            minHour: parseInt(minHourInput.value.replace(/[^\d]/g, '')) || 0,
        };

        fetch('/contract/api/action/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('contractToast', 'Tạo hợp đồng lao động thành công');
                window.location.href = 'contract_list.html';
            } else {
                showError('Lỗi từ server: ' + (data.error || 'Vui lòng thử lại.'));
            }
        })
        .catch(err => {
            console.error('Error:', err);
            showError('Lỗi kết nối tới máy chủ.');
        });
    });

    cancelBtn.addEventListener('click', showConfirm);

    closeErrorBtn.addEventListener('click', hideError);
    cancelConfirmBtn.addEventListener('click', hideConfirm);
    confirmCancelBtn.addEventListener('click', () => {
        hideConfirm();
        window.location.href = 'contract_list.html';
    });

    // Các input liên quan
    const baseSalaryInput = document.getElementById('baseSalary');
    const hourSalaryInput = document.getElementById('hourSalary');
    const minHourInput = document.getElementById('minHour');
    const bonusInput = document.getElementById('bonus');

    // Hàm tính lại lương theo giờ (cho Full-time)
    function updateHourSalary() {
        let baseSalary = parseFloat(baseSalaryInput.value.replace(/[^\d]/g, '')) || 0;
        let minHour = parseFloat(minHourInput.value.replace(/[^\d]/g, '')) || 174;
        let bonus = parseFloat(bonusInput.value.replace(/[^\d]/g, '')) || 0;
        let totalSalary = baseSalary + bonus;
        salaryInput.value = (totalSalary !== null && totalSalary !== undefined) ? totalSalary.toLocaleString('vi-VN') : '';
        // Lương theo giờ chỉ lấy lương cơ bản chia số giờ tối thiểu
        if (minHour > 0) {
            hourSalaryInput.value = Math.round(baseSalary / minHour).toLocaleString('vi-VN');
        } else {
            hourSalaryInput.value = '';
        }
    }

    // Hàm tính lại lương cho Part-time (minHour × hourSalary + bonus)
    function updatePartTimeSalary() {
        let minHour = parseFloat(minHourInput.value.replace(/[^\d]/g, '')) || 0;
        let hourSalary = parseFloat(hourSalaryInput.value.replace(/[^\d]/g, '')) || 0;
        let bonus = parseFloat(bonusInput.value.replace(/[^\d]/g, '')) || 0;
        let totalSalary = (minHour * hourSalary) + bonus;
        salaryInput.value = (totalSalary !== null && totalSalary !== undefined) ? totalSalary.toLocaleString('vi-VN') : '';
    }

    // Khi chọn loại hợp đồng
    contractTypeInput.addEventListener('change', function() {
        if (contractTypeInput.value === 'Full-time') {
            salaryInput.value = '3,480,000';
            baseSalaryInput.value = '3,480,000';
            baseSalaryInput.disabled = false;
            minHourInput.value = '174';
            hourSalaryInput.value = '';
            updateHourSalary();
        } else if (contractTypeInput.value === 'Part-time') {
            baseSalaryInput.value = '';
            baseSalaryInput.disabled = true;
            minHourInput.value = '80';
            hourSalaryInput.value = '';
            salaryInput.value = '';
            bonusInput.value = '';
        }
    });

    // Khi thay đổi các trường liên quan thì tính lại lương/h (Full-time)
    [baseSalaryInput, minHourInput, bonusInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                if (contractTypeInput.value === 'Full-time') {
                    updateHourSalary();
                }
            });
        }
    });

    // Khi thay đổi lương theo giờ hoặc số giờ tối thiểu (Part-time & Full-time)
    if (hourSalaryInput) {
        hourSalaryInput.addEventListener('input', function() {
            if (contractTypeInput.value === 'Part-time') {
                updatePartTimeSalary();
            } else if (contractTypeInput.value === 'Full-time') {
                // Nếu là Full-time, tính ngược lại lương cơ bản từ lương theo giờ
                let hourSal = parseFloat(hourSalaryInput.value.replace(/[^\d]/g, '')) || 0;
                let minH = parseFloat(minHourInput.value.replace(/[^\d]/g, '')) || 174;
                let bonus = parseFloat(bonusInput.value.replace(/[^\d]/g, '')) || 0;
                
                let baseSal = Math.round(hourSal * minH);
                baseSalaryInput.value = baseSal.toLocaleString('vi-VN');
                
                let totalSalary = baseSal + bonus;
                salaryInput.value = (totalSalary !== null && totalSalary !== undefined) ? totalSalary.toLocaleString('vi-VN') : '';
            }
        });
    }

    if (minHourInput) {
        minHourInput.addEventListener('input', function() {
            if (contractTypeInput.value === 'Part-time') {
                updatePartTimeSalary();
            } else if (contractTypeInput.value === 'Full-time') {
                updateHourSalary();
            }
        });
    }

    // Khi thay đổi mức lương thì cập nhật lại lương cơ bản hoặc lương theo giờ
    salaryInput.addEventListener('input', function() {
        let val = parseFloat(salaryInput.value.replace(/[^\d]/g, '')) || 0;
        let bonus = parseFloat(bonusInput.value.replace(/[^\d]/g, '')) || 0;
        let minH = parseFloat(minHourInput.value.replace(/[^\d]/g, '')) || 174;

        if (contractTypeInput.value === 'Full-time') {
            baseSalaryInput.value = (val - bonus).toLocaleString('vi-VN');
            updateHourSalary();
        } else if (contractTypeInput.value === 'Part-time') {
            if (minH > 0) {
                let hourSal = Math.round((val - bonus) / minH);
                hourSalaryInput.value = hourSal.toLocaleString('vi-VN');
            }
        }
    });

    // Khi thay đổi lương cơ bản thì cập nhật lại lương
    baseSalaryInput.addEventListener('input', function() {
        if (contractTypeInput.value === 'Full-time') {
            updateHourSalary();
        }
    });

    // Khi thay đổi thưởng thì cập nhật lại lương
    bonusInput.addEventListener('input', function() {
        if (contractTypeInput.value === 'Full-time') {
            updateHourSalary();
        } else if (contractTypeInput.value === 'Part-time') {
            updatePartTimeSalary();
        }
    });

    // Hàm định dạng số khi nhập
    function formatNumericInput(input) {
        input.addEventListener('input', function(e) {
            let val = this.value.replace(/[^\d]/g, ''); // Chỉ giữ lại số
            if (val !== '') {
                this.value = parseInt(val).toLocaleString('vi-VN');
            } else {
                this.value = '';
            }
        });
    }

    // Áp dụng định dạng cho tất cả các trường nhập số
    [salaryInput, baseSalaryInput, hourSalaryInput, minHourInput, bonusInput].forEach(inp => {
        if (inp) {
            formatNumericInput(inp);
        }
    });
});
