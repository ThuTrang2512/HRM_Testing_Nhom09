document.addEventListener('DOMContentLoaded', () => {
    const contractIdInput = document.getElementById('contractId');
    const employeeIdInput = document.getElementById('employeeId');
    const employeeNameInput = document.getElementById('employeeName');
    const employeeRoleInput = document.getElementById('employeeRole');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const salaryInput = document.getElementById('salary');
    const contractTypeInput = document.getElementById('contractType');
    const baseSalaryInput = document.getElementById('baseSalary');
    const hourSalaryInput = document.getElementById('hourSalary');
    const minHourInput = document.getElementById('minHour');
    const bonusInput = document.getElementById('bonus');
    const noteInput = document.getElementById('note');
    const form = document.getElementById('contractEditForm');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeErrorBtn = document.getElementById('closeErrorBtn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalContent = document.getElementById('confirmModalContent');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    const contractId = sessionStorage.getItem('editingContractId');
    if (!contractId) {
        window.location.href = 'contract_list.html';
        return;
    }

    let contracts = [];
    let employeeList = [];

    Promise.all([
        fetch('/contract/api/data/').then(res => res.json()),
        fetch('/employee/api/data/').then(res => res.json())
    ]).then(([contractData, employeeData]) => {
        contracts = contractData.contracts || [];
        employeeList = employeeData.employees || [];

        const contract = contracts.find(c => c.id === contractId);
        if (!contract) {
            window.location.href = 'contract_list.html';
            return;
        }

        const employeeDatalist = document.getElementById('employeeList');
        if (employeeDatalist) {
            employeeDatalist.innerHTML = employeeList.map(emp => `<option value="${emp.name}" data-id="${emp.id}"></option>`).join('');
        }

        // Đổ dữ liệu
        contractIdInput.value = contract.id || '';
        employeeIdInput.value = contract.employeeId || '';
        employeeNameInput.value = contract.employeeName || '';
        employeeRoleInput.value = contract.employeeRole || '';
        
        const formatForDateInput = (val) => {
            if (!val) return '';
            if (val.includes('/')) return val.split('/').reverse().join('-');
            return val;
        };
        startDateInput.value = formatForDateInput(contract.startDate);
        endDateInput.value = formatForDateInput(contract.endDate);
        
        salaryInput.value = contract.salary ? Number(contract.salary).toLocaleString('vi-VN') : '';
        contractTypeInput.value = contract.contractType || '';
        baseSalaryInput.value = contract.baseSalary ? Number(contract.baseSalary).toLocaleString('vi-VN') : '';
        hourSalaryInput.value = contract.hourSalary ? Number(contract.hourSalary).toLocaleString('vi-VN') : '0';
        minHourInput.value = contract.minHour || '174';
        bonusInput.value = contract.bonus ? Number(contract.bonus).toLocaleString('vi-VN') : '';
        noteInput.value = contract.note || '';

        // Tự động tính toán lại ngay sau khi đổ dữ liệu để đảm bảo các ô trống được lấp đầy
        if (contract.contractType === 'Full-time') {
            updateHourSalary();
        } else if (contract.contractType === 'Part-time') {
            updatePartTimeSalary();
        }
    }).catch(err => {
        console.error("Lỗi:", err);
    });

    employeeNameInput.addEventListener('input', (event) => {
        clearInlineError('employeeName');
        const value = event.target.value.trim();
        const emp = employeeList.find(e => e.name === value);
        
        employeeIdInput.value = emp ? emp.id : '';
        if (employeeRoleInput) {
            employeeRoleInput.value = emp ? emp.role : '';
        }

        // Kiểm tra trùng hợp đồng ngay lập tức (trừ hợp đồng đang sửa)
        if (emp) {
            const currentContractId = contractIdInput.value;
            const existingContract = contracts.find(c => c.employeeId === emp.id && c.id !== currentContractId);
            if (existingContract) {
                setInlineError('employeeName', `Nhân viên đã có hợp đồng, vui lòng chọn nhân viên khác`);
            }
        }

        // Real-time filtering for datalist UI (optional but nice)
        const employeeDatalist = document.getElementById('employeeList');
        if (employeeDatalist) {
            if (value) {
                const filtered = employeeList.filter(e => e.name.toLowerCase().includes(value.toLowerCase()));
                employeeDatalist.innerHTML = filtered.map(e => `<option value="${e.name}" data-id="${e.id}"></option>`).join('');
            } else {
                employeeDatalist.innerHTML = employeeList.map(e => `<option value="${e.name}" data-id="${e.id}"></option>`).join('');
            }
        }
    });

    // Các input liên quan
    const baseSalaryInp = baseSalaryInput;
    const hourSalaryInp = hourSalaryInput;
    const minHourInp = minHourInput;
    const bonusInp = bonusInput;
    const salaryInp = salaryInput;

    // Hàm tính lại lương theo giờ (cho Full-time)
    function updateHourSalary() {
        let baseSalaryValue = parseFloat(baseSalaryInp.value.replace(/[^\d]/g, '')) || 0;
        let minHourValue = parseFloat(minHourInp.value.replace(/[^\d]/g, '')) || 174;
        let bonusValue = parseFloat(bonusInp.value.replace(/[^\d]/g, '')) || 0;
        let totalSalary = baseSalaryValue + bonusValue;
        salaryInp.value = (totalSalary !== null && totalSalary !== undefined) ? totalSalary.toLocaleString('vi-VN') : '';
        if (minHourValue > 0) {
            hourSalaryInp.value = Math.round(baseSalaryValue / minHourValue).toLocaleString('vi-VN');
        } else {
            hourSalaryInp.value = '';
        }
    }

    // Hàm tính lại lương cho Part-time (minHour × hourSalary + bonus)
    function updatePartTimeSalary() {
        let minHourValue = parseFloat(minHourInp.value.replace(/[^\d]/g, '')) || 0;
        let hourSalaryValue = parseFloat(hourSalaryInp.value.replace(/[^\d]/g, '')) || 0;
        let bonusValue = parseFloat(bonusInp.value.replace(/[^\d]/g, '')) || 0;
        let totalSalary = (minHourValue * hourSalaryValue) + bonusValue;
        salaryInp.value = (totalSalary !== null && totalSalary !== undefined) ? totalSalary.toLocaleString('vi-VN') : '';
    }

    // Khi chọn loại hợp đồng
    contractTypeInput.addEventListener('change', function() {
        if (contractTypeInput.value === 'Full-time') {
            baseSalaryInp.disabled = false;
            updateHourSalary();
        } else if (contractTypeInput.value === 'Part-time') {
            baseSalaryInp.value = '';
            baseSalaryInp.disabled = true;
            updatePartTimeSalary();
        }
    });

    // Khi thay đổi các trường liên quan
    [baseSalaryInp, minHourInp, bonusInp].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                if (contractTypeInput.value === 'Full-time') {
                    updateHourSalary();
                } else if (contractTypeInput.value === 'Part-time' && input !== baseSalaryInp) {
                    updatePartTimeSalary();
                }
            });
        }
    });

    if (hourSalaryInp) {
        hourSalaryInp.addEventListener('input', function() {
            if (contractTypeInput.value === 'Part-time') {
                updatePartTimeSalary();
            } else if (contractTypeInput.value === 'Full-time') {
                // Nếu là Full-time, tính ngược lại lương cơ bản từ lương theo giờ
                let hourSal = parseFloat(hourSalaryInp.value.replace(/[^\d]/g, '')) || 0;
                let minH = parseFloat(minHourInp.value.replace(/[^\d]/g, '')) || 174;
                let bonus = parseFloat(bonusInp.value.replace(/[^\d]/g, '')) || 0;
                
                let baseSal = Math.round(hourSal * minH);
                baseSalaryInp.value = baseSal.toLocaleString('vi-VN');
                
                let totalSalary = baseSal + bonus;
                salaryInp.value = (totalSalary !== null && totalSalary !== undefined) ? totalSalary.toLocaleString('vi-VN') : '';
            }
        });
    }

    salaryInp.addEventListener('input', function() {
        let val = parseFloat(salaryInp.value.replace(/[^\d]/g, '')) || 0;
        let bonusValue = parseFloat(bonusInp.value.replace(/[^\d]/g, '')) || 0;
        let minH = parseFloat(minHourInp.value.replace(/[^\d]/g, '')) || 174;

        if (contractTypeInput.value === 'Full-time') {
            baseSalaryInp.value = (val - bonusValue).toLocaleString('vi-VN');
            updateHourSalary();
        } else if (contractTypeInput.value === 'Part-time') {
            if (minH > 0) {
                let hourSal = Math.round((val - bonusValue) / minH);
                hourSalaryInp.value = hourSal.toLocaleString('vi-VN');
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

    // Add real-time validation to clear errors as user types
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

        // Kiểm tra nhân viên đã có hợp đồng khác chưa
        if (employeeIdInput.value) {
            const currentContractId = contractIdInput.value;
            const existingContract = contracts.find(c => c.employeeId === employeeIdInput.value && c.id !== currentContractId);
            if (existingContract) {
                setInlineError('employeeName', `Nhân viên đã có hợp đồng, vui lòng chọn nhân viên khác`);
                hasError = true;
            }
        }

        // Bắt buộc nhập Lương theo giờ nếu là Part-time
        if (contractTypeInput.value === 'Part-time') {
            const hVal = parseFloat(hourSalaryInput.value.replace(/[^\d]/g, '')) || 0;
            if (hVal <= 0) {
                setInlineError('hourSalary', 'Lương theo giờ phải lớn hơn 0');
                hasError = true;
            }
        }

        // Kiểm tra lương cơ bản cho Full-time
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
        
        const formatToVN = (isoString) => {
            if (!isoString) return '';
            if (isoString.includes('/')) return isoString;
            const [y, m, d] = isoString.split('-');
            if (y && m && d) return `${d}/${m}/${y}`;
            return isoString;
        };

        const payload = {
            action: 'UPDATE',
            id: contractIdInput.value,
            employeeId: employeeIdInput.value.trim(),
            employeeName: employeeNameInput.value.trim(),
            employeeRole: employeeRoleInput.value.trim() || 'Chưa xác định',
            contractType: contractTypeInput.value,
            startDate: formatToVN(startDateInput.value),
            endDate: formatToVN(endDateInput.value),
            salary: parseFloat(salaryInput.value.replace(/[^\d]/g, '')) || 0,
            baseSalary: parseFloat(baseSalaryInput.value.replace(/[^\d]/g, '')) || 0,
            hourSalary: parseFloat(hourSalaryInput.value.replace(/[^\d]/g, '')) || 0,
            minHour: parseInt(minHourInput.value.replace(/[^\d]/g, '')) || 0,
            bonus: parseFloat(bonusInput.value.replace(/[^\d]/g, '')) || 0,
            note: noteInput.value.trim(),
        };

        fetch('/contract/api/action/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('contractToast', 'Cập nhật hợp đồng thành công');
                window.location.href = 'contract_list.html';
            } else {
                showError('Lỗi cập nhật: ' + (data.error || 'Vui lòng thử lại.'));
            }
        })
        .catch(err => {
            console.error('Lỗi:', err);
            showError('Lỗi kết nối tới máy chủ.');
        });
    });

    cancelBtn.addEventListener('click', () => {
        if (!confirmModal || !confirmModalContent) {
            window.location.href = 'contract_list.html';
            return;
        }
        confirmModal.classList.remove('hidden');
        setTimeout(() => {
            confirmModal.classList.remove('opacity-0');
            confirmModalContent.classList.remove('opacity-0', 'scale-95');
        }, 10);
    });

    const hideConfirmModal = () => {
        if (!confirmModal || !confirmModalContent) return;
        confirmModal.classList.add('opacity-0');
        confirmModalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            confirmModal.classList.add('hidden');
        }, 300);
    };

    cancelConfirmBtn.addEventListener('click', hideConfirmModal);
    confirmCancelBtn.addEventListener('click', () => {
        window.location.href = 'contract_list.html';
    });

    closeErrorBtn.addEventListener('click', hideError);

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
