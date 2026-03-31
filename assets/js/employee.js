document.addEventListener('DOMContentLoaded', () => {
    // Initial static sample data
    const defaultEmployees = [
        { id: 'NV00001', name: 'Nguyễn Văn An', dob: '12/02/2000', phone: '0966983691', role: 'Pha chế', cccd: '010101010101', gender: 'Nam', address: '', tempAddress: '' },
        { id: 'NV00002', name: 'Nguyễn Văn Tiến', dob: '11/01/1996', phone: '0966983452', role: 'Phục vụ', cccd: '010101010102', gender: 'Nam', address: '', tempAddress: '' },
        { id: 'NV00003', name: 'Trần Vũ Anh', dob: '20/05/2001', phone: '0322183691', role: 'Giữ xe', cccd: '010101010103', gender: 'Nam', address: '', tempAddress: '' },
        { id: 'NV00004', name: 'Vũ Thị Ánh Thi', dob: '03/05/2000', phone: '0326512952', role: 'Pha chế', cccd: '010101010104', gender: 'Nữ', address: '', tempAddress: '' },
        { id: 'NV00005', name: 'Lê Thủy Vy', dob: '30/04/1997', phone: '0966984901', role: 'Pha chế', cccd: '010101010105', gender: 'Nữ', address: '', tempAddress: '' },
        { id: 'NV00006', name: 'Trịnh Phan Vũ', dob: '05/05/2003', phone: '0966984321', role: 'Giữ xe', cccd: '010101010106', gender: 'Nam', address: '', tempAddress: '' },
        { id: 'NV00007', name: 'Trần Thị Ly', dob: '25/08/2000', phone: '0339207162', role: 'Phục vụ', cccd: '010101010107', gender: 'Nữ', address: '', tempAddress: '' },
        { id: 'NV00008', name: 'Nguyễn Lê Mỹ', dob: '19/02/1999', phone: '0966942511', role: 'Pha chế', cccd: '010101010108', gender: 'Nữ', address: '', tempAddress: '' }
    ];

    // Read from localStorage or apply default
    let employees = JSON.parse(localStorage.getItem('employees'));
    if (!employees) {
        employees = defaultEmployees;
        localStorage.setItem('employees', JSON.stringify(employees));
    }

    const tableBody = document.getElementById('employeeTableBody');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const successBanner = document.getElementById('successBanner');
    const closeBannerBtn = document.getElementById('closeBannerBtn');

    // Delete Modal elements
    const deleteModal = document.getElementById('deleteConfirmModal');
    const deleteModalContent = document.getElementById('deleteConfirmModalContent');
    const btnDeleteYes = document.getElementById('btnDeleteYes');
    const btnDeleteNo = document.getElementById('btnDeleteNo');
    let currentDeleteId = null;

    // UI Feedback Helpers for Delete
    const showDeleteModal = () => {
        if (!deleteModal) return;
        deleteModal.classList.remove('hidden');
        setTimeout(() => {
            deleteModal.classList.remove('opacity-0');
            deleteModalContent.classList.remove('scale-95', 'opacity-0');
        }, 10);
    };

    const hideDeleteModal = () => {
        if (!deleteModal) return;
        deleteModal.classList.add('opacity-0');
        deleteModalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            deleteModal.classList.add('hidden');
        }, 300);
        currentDeleteId = null;
    };

    // Function to render the table 
    const renderTable = () => {
        tableBody.innerHTML = '';

        // Filter out inactive (soft-deleted) employees
        const activeEmployees = employees.filter(emp => emp.status !== 'inactive');

        activeEmployees.forEach((emp, index) => {
            const tr = document.createElement('tr');
            // Alternating row colors
            tr.className = index % 2 === 0 ? 'bg-[#f4ede7] hover:bg-[#e8ddd4] cursor-pointer transition-colors text-center text-gray-800' : 'bg-white hover:bg-gray-50 cursor-pointer transition-colors text-center text-gray-800';
            tr.setAttribute('data-id', emp.id);
            tr.innerHTML = `
                <td class="py-4 px-2 border-r border-transparent">${index + 1}</td>
                <td class="py-4 px-4 border-r border-transparent">${emp.id}</td>
                <td class="py-4 px-4 border-r border-transparent">
                    <div class="inline-block text-left w-max">${emp.name}</div>
                </td>
                <td class="py-4 px-4 border-r border-transparent">${emp.dob}</td>
                <td class="py-4 px-4 border-r border-transparent">${emp.phone}</td>
                <td class="py-4 px-4 border-r border-transparent">${emp.role}</td>
                <td class="py-4 px-4 text-[#4B2E1F]/80">
                    <button class="hover:text-black mx-2 edit-btn" title="Sửa" data-id="${emp.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="hover:text-black mx-2 delete-btn" title="Xóa" data-id="${emp.id}"><i class="fa-regular fa-trash-can"></i></button>
                </td>
            `;

            // View details event
            tr.addEventListener('click', (e) => {
                // Ignore if clicked on a button or its icon
                if (e.target.closest('button')) return;

                sessionStorage.setItem('viewingEmployeeId', emp.id);
                window.location.href = 'employee_detail.html';
            });

            tableBody.appendChild(tr);
        });

        // Bind Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                sessionStorage.setItem('editingEmployeeId', id);
                window.location.href = 'employee_edit.html';
            });
        });

        // Bind Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentDeleteId = e.currentTarget.getAttribute('data-id');
                showDeleteModal();
            });
        });
    };

    // Initial render
    renderTable();

    // Check Toast Notification state
    if (sessionStorage.getItem('showSuccessToast') === 'true') {
        const customMsg = sessionStorage.getItem('toastMessage');
        const editSuccessToast = document.getElementById('editSuccessToast');

        if (customMsg && editSuccessToast) {
            // Edit Employee Flow -> Bottom right toast
            editSuccessToast.classList.remove('hidden');
            sessionStorage.removeItem('toastMessage');

            // Auto hide after 5 seconds
            setTimeout(() => {
                editSuccessToast.classList.add('hidden');
            }, 5000);
        } else {
            // Add Employee Flow -> Top left overlay banner
            successBanner.classList.remove('hidden');

            // Auto hide after 5 seconds
            setTimeout(() => {
                successBanner.classList.add('hidden');
            }, 5000);
        }

        sessionStorage.removeItem('showSuccessToast');
    }

    // Check Info Toast (Flow 7a: Data not changed)
    if (sessionStorage.getItem('showInfoToast') === 'true') {
        const infoToast = document.getElementById('infoToast');
        if (infoToast) {
            infoToast.classList.remove('hidden');
            setTimeout(() => {
                infoToast.classList.add('hidden');
            }, 5000);
        }
        sessionStorage.removeItem('showInfoToast');
    }

    // Delete Confirmation Events
    if (btnDeleteNo) {
        btnDeleteNo.addEventListener('click', () => {
            hideDeleteModal();
        });
    }

    const errorDeleteToast = document.getElementById('errorDeleteToast');
    const closeErrorDeleteToastBtn = document.getElementById('closeErrorDeleteToastBtn');

    if (closeErrorDeleteToastBtn) {
        closeErrorDeleteToastBtn.addEventListener('click', () => {
            if (errorDeleteToast) errorDeleteToast.classList.add('hidden');
        });
    }

    if (btnDeleteYes) {
        btnDeleteYes.addEventListener('click', () => {
            if (currentDeleteId) {
                // Exception Flow 6a (Fake check for NV00001 working schedule/contract)
                if (currentDeleteId === 'NV00001') {
                    hideDeleteModal();
                    if (errorDeleteToast) {
                        errorDeleteToast.classList.remove('hidden');
                        setTimeout(() => {
                            errorDeleteToast.classList.add('hidden');
                        }, 5000);
                    }
                    return;
                }

                // Soft delete by updating status
                const empIndex = employees.findIndex(e => e.id === currentDeleteId);
                if (empIndex > -1) {
                    employees[empIndex].status = 'inactive';
                    localStorage.setItem('employees', JSON.stringify(employees));

                    // Show Green Success Toast (Bottom right)
                    const editSuccessToast = document.getElementById('editSuccessToast');
                    const editToastTitle = document.getElementById('editToastTitle');
                    if (editSuccessToast && editToastTitle) {
                        editToastTitle.innerHTML = 'Đã xóa nhân viên thành công<br><span class="text-[14px] font-normal">Danh sách đã được cập nhật.</span>';
                        editSuccessToast.classList.remove('hidden');

                        setTimeout(() => {
                            editSuccessToast.classList.add('hidden');
                        }, 5000);
                    }

                    renderTable();
                }
            }
            hideDeleteModal();
        });
    }

    // Event Listeners
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', () => {
            window.location.href = 'employee_add.html';
        });
    }

    if (closeBannerBtn) {
        closeBannerBtn.addEventListener('click', () => {
            successBanner.classList.add('hidden');
        });
    }

    const closeEditToastBtn = document.getElementById('closeEditToastBtn');
    if (closeEditToastBtn) {
        closeEditToastBtn.addEventListener('click', () => {
            const editSuccessToast = document.getElementById('editSuccessToast');
            if (editSuccessToast) editSuccessToast.classList.add('hidden');
        });
    }

    const closeInfoToastBtn = document.getElementById('closeInfoToastBtn');
    if (closeInfoToastBtn) {
        closeInfoToastBtn.addEventListener('click', () => {
            const infoToast = document.getElementById('infoToast');
            if (infoToast) infoToast.classList.add('hidden');
        });
    }
});
