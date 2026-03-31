document.addEventListener('DOMContentLoaded', () => {
    const contractIdInput = document.getElementById('contractId');
    const employeeIdInput = document.getElementById('employeeId');
    const employeeNameInput = document.getElementById('employeeName');
    const employeeRoleInput = document.getElementById('employeeRole');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const salaryInput = document.getElementById('salary');
    const contractTypeInput = document.getElementById('contractType');
    const form = document.getElementById('contractEditForm');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeErrorBtn = document.getElementById('closeErrorBtn');
    const cancelConfirmModal = document.getElementById('cancelConfirmModal');
    const cancelConfirmContent = document.getElementById('cancelConfirmContent');
    const cancelNoBtn = document.getElementById('cancelNoBtn');
    const cancelYesBtn = document.getElementById('cancelYesBtn');

    const contractId = sessionStorage.getItem('editingContractId');
    let contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    const contract = contracts.find(c => c.id === contractId);

    if (!contract) {
        window.location.href = 'contract_list.html';
        return;
    }

    contractIdInput.value = contract.id;
    employeeIdInput.value = contract.employeeId;
    employeeNameInput.value = contract.employeeName;
    employeeRoleInput.value = contract.employeeRole;
    startDateInput.value = contract.startDate;
    endDateInput.value = contract.endDate;
    salaryInput.value = contract.salary || '';
    contractTypeInput.value = contract.contractType;

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
        if (!employeeIdInput.value.trim() || !employeeNameInput.value.trim() || !startDateInput.value || !endDateInput.value || !salaryInput.value.trim()) {
            showError('Vui lòng điền đầy đủ Mã nhân viên, Tên nhân viên, Ngày bắt đầu, Ngày kết thúc và Mức lương.');
            return;
        }

        const index = contracts.findIndex(c => c.id === contractId);
        if (index >= 0) {
            contracts[index] = {
                ...contracts[index],
                employeeId: employeeIdInput.value.trim(),
                employeeName: employeeNameInput.value.trim(),
                employeeRole: employeeRoleInput.value.trim() || 'Chưa xác định',
                startDate: startDateInput.value,
                endDate: endDateInput.value,
                salary: salaryInput.value.trim(),
                contractType: contractTypeInput.value,
                status: contracts[index].status,
                note: contracts[index].note,
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
        if (!cancelConfirmModal || !cancelConfirmContent) {
            window.location.href = 'contract_list.html';
            return;
        }
        cancelConfirmModal.classList.remove('hidden');
        setTimeout(() => {
            cancelConfirmModal.classList.remove('opacity-0');
            cancelConfirmContent.classList.remove('opacity-0', 'scale-95');
        }, 10);
    });

    const hideCancelConfirm = () => {
        if (!cancelConfirmModal || !cancelConfirmContent) return;
        cancelConfirmModal.classList.add('opacity-0');
        cancelConfirmContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            cancelConfirmModal.classList.add('hidden');
        }, 300);
    };

    cancelNoBtn.addEventListener('click', hideCancelConfirm);
    cancelYesBtn.addEventListener('click', () => {
        window.location.href = 'contract_list.html';
    });

    closeErrorBtn.addEventListener('click', hideError);
});
