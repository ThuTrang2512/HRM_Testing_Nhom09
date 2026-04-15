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
    let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    const contract = contracts.find(c => c.id === contractId);

    if (!contract) {
        window.location.href = 'contract_list.html';
        return;
    }

    // Lấy danh sách nhân viên từ localStorage và render vào datalist
    const employeeList = JSON.parse(localStorage.getItem('employees')) || [];
    const employeeDatalist = document.getElementById('employeeList');
    if (employeeDatalist) {
        employeeDatalist.innerHTML = employeeList.map(emp => `<option value="${emp.name}" data-id="${emp.id}"></option>`).join('');
    }

    employeeNameInput.addEventListener('input', (event) => {
        const value = event.target.value.trim().toLowerCase();
        const emp = employeeList.find(e => e.name === event.target.value.trim());
        employeeIdInput.value = emp ? emp.id : '';
        if (employeeRoleInput) {
            employeeRoleInput.value = emp ? emp.role : '';
        }
        // Filter datalist realtime
        if (employeeDatalist && value) {
            const filteredEmployees = employeeList.filter(emp =>
                emp.name.toLowerCase().includes(value)
            );
            employeeDatalist.innerHTML = filteredEmployees.map(emp =>
                `<option value="${emp.name}" data-id="${emp.id}"></option>`
            ).join('');
        } else if (employeeDatalist) {
            employeeDatalist.innerHTML = employeeList.map(emp =>
                `<option value="${emp.name}" data-id="${emp.id}"></option>`
            ).join('');
        }
    });

    // Populate fields with contract data
    contractIdInput.value = contract.id;
    employeeIdInput.value = contract.employeeId;
    employeeNameInput.value = contract.employeeName;
    employeeRoleInput.value = contract.employeeRole;
    startDateInput.value = contract.startDate;
    endDateInput.value = contract.endDate;
    salaryInput.value = contract.salary || '';
    contractTypeInput.value = contract.contractType;
    baseSalaryInput.value = contract.baseSalary || '';
    hourSalaryInput.value = contract.hourSalary || '0';
    minHourInput.value = contract.minHour || '174';
    bonusInput.value = contract.bonus || '';
    noteInput.value = contract.note || '';

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

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!employeeNameInput.value.trim() || !contractTypeInput.value || !startDateInput.value || !endDateInput.value || !baseSalaryInput.value.trim() || !minHourInput.value.trim() || !employeeRoleInput.value.trim()) {
            showError('Vui lòng nhập đầy đủ các trường bắt buộc.');
            return;
        }
        const index = contracts.findIndex(c => c.id === contractId);
        if (index >= 0) {
            contracts[index] = {
                ...contracts[index],
                employeeId: employeeIdInput.value.trim(),
                employeeName: employeeNameInput.value.trim(),
                employeeRole: employeeRoleInput.value.trim() || 'Chưa xác định',
                contractType: contractTypeInput.value,
                startDate: startDateInput.value,
                endDate: endDateInput.value,
                salary: salaryInput.value.trim(),
                baseSalary: baseSalaryInput.value.trim(),
                hourSalary: hourSalaryInput.value.trim(),
                minHour: minHourInput.value.trim(),
                bonus: bonusInput.value.trim(),
                note: noteInput.value.trim(),
                status: contracts[index].status,
            };
            localStorage.setItem('contracts', JSON.stringify(contracts));
            sessionStorage.setItem('contractToast', 'Cập nhật hợp đồng thành công');
            window.location.href = 'contract_list.html';
        } else {
            hideError();
            window.location.href = 'contract_list.html';
        }
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
});
