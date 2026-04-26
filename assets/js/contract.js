document.addEventListener('DOMContentLoaded', () => {
    let contracts = [];

    const removeAccents = (str) => {
        if (!str) return '';
        return str.normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    };

    const loadContracts = () => {
        fetch('/contract/api/data/')
            .then(res => res.json())
            .then(data => {
                contracts = data.contracts || [];
                renderTable();
            })
            .catch(err => console.error("Lỗi tải API hợp đồng:", err));
    };

    loadContracts();

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
        if (lower === 'còn hạn') return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';
        if (lower === 'hết hạn') return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium';
        if (lower === 'sắp hiệu lực' || lower === 'sắp đến hạn') return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium';
        return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium';
    };

    const getContractStatus = (startDateStr, endDateStr) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize time for comparison
        let startDate, endDate;
        
        if (startDateStr && startDateStr.includes('-')) {
            startDate = new Date(startDateStr);
            endDate = new Date(endDateStr);
        } else if (startDateStr && startDateStr.includes('/')) {
            const [day, month, year] = startDateStr.split('/');
            startDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
            const [endDay, endMonth, endYear] = endDateStr.split('/');
            endDate = new Date(`${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`);
        } else {
            return 'Còn hạn';
        }

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (now < startDate) return 'Sắp hiệu lực';
        if (now > endDate) return 'Hết hạn';
        
        // Active: check if within 30 days of expiration
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) return 'Sắp đến hạn';
        
        return 'Còn hạn';
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
    const detailViewModal = document.getElementById('contractDetailViewModal');
    const detailViewContent = document.getElementById('contractDetailViewContent');
    const closeDetailViewBtn = document.getElementById('closeDetailViewBtn');
    const closeDetailViewFormBtn = document.getElementById('closeDetailViewFormBtn');
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

    const showToast = (message) => {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        if (!toast || !toastMessage) return;
        toastMessage.textContent = message;
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 3000);
    };

    const showError = (text) => {
        const existingToast = document.querySelector('[id^="errorToast_"]');
        if (existingToast) existingToast.remove();

        const toastId = `errorToast_${Date.now()}`;
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = 'fixed bottom-[20px] right-[20px] bg-red-100 text-red-700 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-[1000] max-w-[400px] animate-in';
        toast.innerHTML = `
            <i class="fa-solid fa-circle-xmark text-[24px] flex-shrink-0"></i>
            <p class="font-medium text-[16px]">${text}</p>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
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

    const convertDateToISO = (dateStr) => {
        if (!dateStr || !dateStr.includes('/')) return dateStr;
        const [d, m, y] = dateStr.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    };

    const showDetailViewModal = (contract) => {
        if (!detailViewModal || !detailViewContent) return;
        
        // Helper to format currency values for display
        const formatForInput = (val) => {
            if (val === undefined || val === null || val === '') return '0';
            return parseFloat(val).toLocaleString('vi-VN');
        };

        document.getElementById('viewContractId').value = normalizeDetailValue(contract.id, '');
        document.getElementById('viewEmployeeId').value = normalizeDetailValue(contract.employeeId, '');
        document.getElementById('viewEmployeeName').value = normalizeDetailValue(contract.employeeName, '');
        document.getElementById('viewContractType').value = normalizeContractType(normalizeDetailValue(contract.contractType, ''));
        document.getElementById('viewSalary').value = formatForInput(contract.salary);
        document.getElementById('viewStartDate').value = convertDateToISO(contract.startDate);
        document.getElementById('viewBaseSalary').value = formatForInput(contract.baseSalary);
        document.getElementById('viewHourSalary').value = formatForInput(contract.hourSalary);
        document.getElementById('viewEndDate').value = convertDateToISO(contract.endDate);
        document.getElementById('viewMinHour').value = normalizeDetailValue(contract.minHour, '0');
        document.getElementById('viewBonus').value = formatForInput(contract.bonus);
        document.getElementById('viewEmployeeRole').value = normalizeDetailValue(contract.employeeRole, '');
        document.getElementById('viewWorkplace').value = '24 Nguyễn Công Trứ'; // Fixed location
        document.getElementById('viewNote').value = normalizeDetailValue(contract.note, '');

        detailViewModal.classList.remove('hidden');
        setTimeout(() => {
            detailViewModal.classList.remove('opacity-0');
            detailViewContent.classList.remove('opacity-0', 'scale-95');
        }, 10);
    };

    const hideDetailViewModal = () => {
        if (!detailViewModal || !detailViewContent) return;
        detailViewModal.classList.add('opacity-0');
        detailViewContent.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            detailViewModal.classList.add('hidden');
        }, 300);
    };

    const getFilteredContracts = () => {
        const keyword = removeAccents(searchInput.value.trim().toLowerCase());
        if (!keyword) return contracts.filter(c => c.status !== 'deleted');
        return contracts.filter(contract => {
            if (contract.status === 'deleted') return false;
            return [contract.id, contract.employeeId, contract.employeeName, contract.employeeRole, contract.contractType, contract.status]
                .some(value => value && removeAccents(value.toString().toLowerCase()).includes(keyword));
        });
    };

    const renderTable = () => {
        const filteredContracts = getFilteredContracts();
        tableBody.innerHTML = filteredContracts.map((contract, index) => {
            const currentStatus = getContractStatus(contract.startDate, contract.endDate);
            return `
                <tr data-id="${contract.id}" class="${index % 2 === 0 ? 'bg-[#f4ede7]' : 'bg-white'} hover:bg-[#e8ddd4] transition-colors text-center text-gray-800 cursor-pointer">
                    <td class="py-4 px-2 border-r border-transparent">${index + 1}</td>
                    <td class="py-4 px-4 border-r border-transparent">${contract.id}</td>
                    <td class="py-4 px-4 border-r border-transparent">${contract.employeeId}</td>
                    <td class="py-4 px-4 border-r border-transparent text-center">${contract.employeeName}</td>
                    <td class="py-4 px-4 border-r border-transparent">${contract.employeeRole}</td>
                    <td class="py-4 px-4 border-r border-transparent text-center">
                        <span class="px-4 py-2 text-[16px] font-medium ${getStatusStyle(currentStatus)} rounded-full inline-block">${currentStatus}</span>
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
                if (contract) showDetailViewModal(contract);
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
                if (contract) showDetailViewModal(contract);
            });
        });
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            renderTable();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                renderTable();
            }
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
            const contract = contracts.find(c => c.id === contractToDelete);
            if (!contract) return;
            const currentStatus = getContractStatus(contract.startDate, contract.endDate);
            if (currentStatus === 'Còn hạn') {
                showError('Không thể xóa hợp đồng đang có hiệu lực');
                contractToDelete = null;
                hideDeleteModal();
                return;
            }
            
            fetch('/contract/api/action/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'DELETE', id: contractToDelete })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast('Đã xóa hợp đồng thành công');
                    loadContracts();
                } else {
                    showError('Lỗi xóa: ' + (data.error || 'Vui lòng thử lại.'));
                }
            })
            .catch(err => {
                console.error("Lỗi:", err);
                showError('Không thể kết nối đến máy chủ.');
            })
            .finally(() => {
                contractToDelete = null;
                hideDeleteModal();
            });
        });
    }


    if (closeDetailViewBtn) {
        closeDetailViewBtn.addEventListener('click', hideDetailViewModal);
    }

    if (closeDetailViewFormBtn) {
        closeDetailViewFormBtn.addEventListener('click', hideDetailViewModal);
    }

    if (detailViewModal) {
        detailViewModal.addEventListener('click', (event) => {
            if (event.target === detailViewModal) {
                hideDetailViewModal();
            }
        });
    }

    if (sessionStorage.getItem('contractToast')) {
        showToast(sessionStorage.getItem('contractToast'));
        sessionStorage.removeItem('contractToast');
    }
});

