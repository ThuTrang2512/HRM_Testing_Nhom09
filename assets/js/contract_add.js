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

    let contracts = JSON.parse(localStorage.getItem('contracts')) || [];

    const createContractId = () => {
        const lastId = contracts
            .map(contract => contract.id.replace(/\D/g, ''))
            .map(Number)
            .filter(Boolean)
            .sort((a, b) => b - a)[0] || 0;
        return `HD${String(lastId + 1).padStart(5, '0')}`;
    };

    contractIdInput.value = createContractId();

    employeeNameInput.addEventListener('change', (event) => {
        const option = event.target.selectedOptions[0];
        employeeIdInput.value = option?.dataset?.id || '';
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

    form.addEventListener('submit', (event) => {
        event.preventDefault();
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
            note: '',
        };

        if (!newContract.employeeId || !newContract.employeeName || !newContract.startDate || !newContract.endDate || !newContract.salary) {
            showError('Vui lòng điền đầy đủ Tên nhân viên, Ngày bắt đầu, Ngày kết thúc và Mức lương.');
            return;
        }

        const existingContract = contracts.find(c => c.employeeId === newContract.employeeId && c.status !== 'deleted');
        if (existingContract) {
            showError('Nhân viên đã có hợp đồng. Vui lòng chọn nhân viên khác.');
            return;
        }

        contracts.push(newContract);
        localStorage.setItem('contracts', JSON.stringify(contracts));
        sessionStorage.setItem('contractToast', 'Thêm hợp đồng thành công');
        window.location.href = 'contract_list.html';
    });

    cancelBtn.addEventListener('click', () => {
        window.location.href = 'contract_list.html';
    });

    closeErrorBtn.addEventListener('click', hideError);
});
