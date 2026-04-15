document.addEventListener('DOMContentLoaded', () => {
    const defaultContracts = [
        { id: 'HD00001', employeeId: 'NV00001', employeeName: 'Nguyễn Văn An', employeeRole: 'Pha chế', contractType: 'Part-time', status: 'Còn hạn', startDate: '25/12/2025', endDate: '25/12/2026', salary: '2.000.000', note: 'Ký hợp đồng 1 năm.' },
        { id: 'HD00002', employeeId: 'NV00002', employeeName: 'Lê Hoài Bảo An', employeeRole: 'Giữ xe', contractType: 'Full-time', status: 'Còn hạn', startDate: '01/03/2024', endDate: '01/03/2026', salary: '4.500.000', note: 'Hợp đồng chính thức.' },
        { id: 'HD00003', employeeId: 'NV00003', employeeName: 'Trần Thị Mai Loan', employeeRole: 'Phục vụ', contractType: 'Part-time', status: 'Hết hiệu lực', startDate: '01/05/2023', endDate: '30/04/2024', salary: '3.200.000', note: 'Đã hết hạn và chờ tái ký.' },
        { id: 'HD00004', employeeId: 'NV00004', employeeName: 'Phạm Quang Bảo', employeeRole: 'Phục vụ', contractType: 'Full-time', status: 'Còn hạn', startDate: '01/02/2024', endDate: '31/01/2025', salary: '4.000.000', note: '' },
        { id: 'HD00005', employeeId: 'NV00005', employeeName: 'Nguyễn Viết Bảo', employeeRole: 'Pha chế', contractType: 'Full-time', status: 'Còn hạn', startDate: '01/04/2024', endDate: '01/04/2026', salary: '4.800.000', note: '' },
        { id: 'HD00006', employeeId: 'NV00006', employeeName: 'Lê Văn Nhật Anh', employeeRole: 'Giữ xe', contractType: 'Part-time', status: 'Sắp hiệu lực', startDate: '08/05/2024', endDate: '07/05/2025', salary: '2.500.000', note: 'Đang chờ ký hợp đồng cuối.' },
        { id: 'HD00007', employeeId: 'NV00007', employeeName: 'Nguyễn Văn Anh', employeeRole: 'Pha chế', contractType: 'Part-time', status: 'Còn hạn', startDate: '10/03/2024', endDate: '09/03/2025', salary: '2.200.000', note: '' },
        { id: 'HD00008', employeeId: 'NV00008', employeeName: 'Trần Lê Văn Khoa', employeeRole: 'Giữ xe', contractType: 'Full-time', status: 'Còn hạn', startDate: '05/04/2024', endDate: '04/04/2025', salary: '3.800.000', note: '' }
    ];

    let contracts = JSON.parse(localStorage.getItem('contracts'));
    if (!contracts) {
        contracts = defaultContracts;
        localStorage.setItem('contracts', JSON.stringify(contracts));
    } else {
        // Update old statuses to new ones if they exist
        contracts = contracts.map(c => {
            if (c.status === 'Hiệu lực') c.status = 'Còn hạn';
            if (c.status === 'Hết hạn') c.status = 'Hết hiệu lực';
            if (c.status === 'Chờ') c.status = 'Sắp hiệu lực';
            return c;
        });
        localStorage.setItem('contracts', JSON.stringify(contracts));
    }

    let contractToDelete = null;
    const tableBody = document.getElementById('contractTableBody');
    const searchInput = document.getElementById('searchInput');

    const normalizeContractType = (type) => {
        if (!type) return '';
        const value = type.toString().trim();
        const lower = value.toLowerCase();
        if (lower.includes('part')) return 'Part-time';
        if (lower.includes('full')) return 'Full-time';
        if (lower.includes('thời hạn')) return 'Part-time';
        if (lower.includes('vô thời hạn')) return 'Full-time';
        return value;
    };

    const normalizeDetailValue = (value, fallback = '') => {
        if (value === undefined || value === null) return fallback;
        const text = String(value).trim();
        return text === '' ? fallback : text;
    };

    const formatSalary = (value, fallback = '') => {
        const text = normalizeDetailValue(value, fallback);
        if (!text) return '';
        return text.endsWith('₫') || text.endsWith('VND') ? text : `${text} ₫`;
    };

    const getStatusStyle = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        const lower = status.toLowerCase();
        if (lower === 'còn hạn') return 'bg-green-100 text-green-800';
        if (lower === 'hết hiệu lực') return 'bg-red-100 text-red-800';
        if (lower === 'sắp hiệu lực') return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    const sampleContract = {
        employeeName: 'Nguyễn Văn An',
        employeeId: 'NV00001',
        contractId: 'HD00001',
        contractType: 'Part-time',
        startDate: '25/12/2025',
        endDate: '25/12/2026',
        salary: '2.000.000',
        employeeRole: 'Pha chế'
    };

    const searchBtn = document.getElementById('searchBtn');
    const addContractBtn = document.getElementById('addContractBtn');
    const deleteModal = document.getElementById('deleteConfirmModal');
    const deleteConfirmContent = document.getElementById('deleteConfirmContent');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const detailModal = document.getElementById('contractDetailModal');
    const detailModalContent = document.getElementById('contractDetailContent');
    const closeDetailModalBtn = document.getElementById('closeDetailModal');
    const detailFields = {
        employeeName: document.getElementById('detailEmployeeName'),
        employeeId: document.getElementById('detailEmployeeId'),
        contractId: document.getElementById('detailContractId'),
        contractType: document.getElementById('detailContractType'),
        startDate: document.getElementById('detailStartDate'),
        endDate: document.getElementById('detailEndDate'),
        salary: document.getElementById('detailSalary'),
        role: document.getElementById('detailRole')
    };
    const successToast = document.getElementById('successToast');
    const successToastText = document.getElementById('successToastText');
    const closeSuccessToast = document.getElementById('closeSuccessToast');

    const showToast = (message) => {
        if (!successToast || !successToastText) return;
        successToastText.textContent = message;
        successToast.classList.remove('hidden');
        setTimeout(() => {
            successToast.classList.add('hidden');
        }, 4000);
    };

    const showDeleteModal = () => {
        deleteModal.classList.remove('hidden');
        setTimeout(() => {
            deleteModal.classList.remove('opacity-0');
            deleteConfirmContent.classList.remove('opacity-0', 'scale-95');
        }, 10);
    };

    const hideDeleteModal = () => {
        deleteModal.classList.add('opacity-0');
        deleteConfirmContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            deleteModal.classList.add('hidden');
        }, 300);
    };

    const showDetailModal = (contract) => {
        if (!detailModal || !detailModalContent) return;
        detailFields.employeeName.textContent = normalizeDetailValue(contract.employeeName, sampleContract.employeeName);
        detailFields.employeeId.textContent = `Mã nhân viên - ${normalizeDetailValue(contract.employeeId, sampleContract.employeeId)}`;
        detailFields.contractId.textContent = normalizeDetailValue(contract.id, sampleContract.contractId);
        detailFields.contractType.textContent = normalizeContractType(normalizeDetailValue(contract.contractType, sampleContract.contractType));
        detailFields.startDate.textContent = normalizeDetailValue(contract.startDate, sampleContract.startDate);
        detailFields.endDate.textContent = normalizeDetailValue(contract.endDate, sampleContract.endDate);
        detailFields.salary.textContent = formatSalary(contract.salary, sampleContract.salary);
        detailFields.role.textContent = normalizeDetailValue(contract.employeeRole, sampleContract.employeeRole);

        detailModal.classList.remove('hidden');
        setTimeout(() => {
            detailModal.classList.remove('opacity-0');
            detailModalContent.classList.remove('opacity-0', 'scale-95');
        }, 10);
    };

    const hideDetailModal = () => {
        if (!detailModal || !detailModalContent) return;
        detailModal.classList.add('opacity-0');
        detailModalContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            detailModal.classList.add('hidden');
        }, 300);
    };

    const getFilteredContracts = () => {
        const keyword = searchInput.value.trim().toLowerCase();
        if (!keyword) return contracts.filter(c => c.status !== 'deleted');
        return contracts.filter(contract => {
            if (contract.status === 'deleted') return false;
            return [contract.id, contract.employeeId, contract.employeeName, contract.employeeRole, contract.contractType, contract.status]
                .some(value => value && value.toString().toLowerCase().includes(keyword));
        });
    };

    const renderTable = () => {
        const filteredContracts = getFilteredContracts();
        tableBody.innerHTML = filteredContracts.map((contract, index) => {
            return `
                <tr data-id="${contract.id}" class="${index % 2 === 0 ? 'bg-[#f4ede7]' : 'bg-white'} hover:bg-[#e8ddd4] transition-colors text-center text-gray-800 cursor-pointer">
                    <td class="py-4 px-2 border-r border-transparent">${index + 1}</td>
                    <td class="py-4 px-4 border-r border-transparent">${contract.id}</td>
                    <td class="py-4 px-4 border-r border-transparent">${contract.employeeId}</td>
                    <td class="py-4 px-4 border-r border-transparent text-center">${contract.employeeName}</td>
                    <td class="py-4 px-4 border-r border-transparent">${contract.employeeRole}</td>
                    <td class="py-4 px-4 border-r border-transparent text-center">
                        <span class="px-4 py-2 text-[16px] font-medium ${getStatusStyle(contract.status)} rounded-full inline-block">${contract.status}</span>
                    </td>
                    <td class="py-4 px-4 text-[#4B2E1F]/80 flex items-center justify-center gap-4">
                        <button class="action-btn view-btn" data-id="${contract.id}" title="Xem"><i class="fa-solid fa-eye"></i></button>
                        <button class="action-btn edit-btn" data-id="${contract.id}" title="Sửa"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn delete-btn" data-id="${contract.id}" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
        bindTableActions();
    };

    const bindTableActions = () => {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                const id = event.currentTarget.dataset.id;
                const contract = contracts.find(c => c.id === id);
                if (contract) showDetailModal(contract);
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                const id = event.currentTarget.dataset.id;
                sessionStorage.setItem('editingContractId', id);
                window.location.href = 'contract_edit.html';
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                contractToDelete = event.currentTarget.dataset.id;
                showDeleteModal();
            });
        });

        document.querySelectorAll('#contractTableBody tr').forEach(row => {
            row.addEventListener('click', (event) => {
                if (event.target.closest('button')) return;
                const id = row.dataset.id;
                const contract = contracts.find(c => c.id === id);
                if (contract) showDetailModal(contract);
            });
        });
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            renderTable();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            renderTable();
        });
    }

    if (addContractBtn) {
        addContractBtn.addEventListener('click', () => {
            window.location.href = 'contract_add.html';
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (!contractToDelete) return;
            const index = contracts.findIndex(c => c.id === contractToDelete);
            if (index >= 0) {
                contracts[index].status = 'deleted';
                localStorage.setItem('contracts', JSON.stringify(contracts));
                renderTable();
                showToast('Xóa hợp đồng thành công');
            }
            contractToDelete = null;
            hideDeleteModal();
        });
    }

    if (closeSuccessToast) {
        closeSuccessToast.addEventListener('click', () => {
            successToast.classList.add('hidden');
        });
    }

    if (closeDetailModalBtn) {
        closeDetailModalBtn.addEventListener('click', hideDetailModal);
    }

    if (detailModal) {
        detailModal.addEventListener('click', (event) => {
            if (event.target === detailModal) {
                hideDetailModal();
            }
        });
    }

    if (sessionStorage.getItem('contractToast')) {
        showToast(sessionStorage.getItem('contractToast'));
        sessionStorage.removeItem('contractToast');
    }

    renderTable();
});