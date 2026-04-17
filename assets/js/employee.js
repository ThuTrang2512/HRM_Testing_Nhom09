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

    let employees = [];

    const loadEmployees = () => {
        fetch('/employee/api/data/')
            .then(res => res.json())
            .then(data => {
                employees = data.employees || [];
                renderCards();
            })
            .catch(err => console.error("Lỗi tải API nhân viên:", err));
    };

    loadEmployees();

    const cardsContainer = document.getElementById('employeeCardsContainer');
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

    // Function to generate avatar with initials
    const getAvatarColor = (index) => {
        const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#14B8A6', '#0891B2'];
        return colors[index % colors.length];
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDateValue = (dateStr) => {
        if (!dateStr) return '';
        // If format is YYYY-MM-DD (contains hyphens and first part is length 4)
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts[0].length === 4) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }
        return dateStr;
    };

    // Function to render employee cards
    const renderCards = (searchTerm = '') => {
        cardsContainer.innerHTML = '';

        // Filter by status and search term
        const activeEmployees = employees.filter(emp => {
            const matchesStatus = emp.status !== 'inactive';
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        if (activeEmployees.length === 0) {
            cardsContainer.innerHTML = `
                <div class="col-span-full text-center py-20 text-gray-400">
                    <i class="fa-solid fa-magnifying-glass text-6xl mb-4 opacity-20"></i>
                    <p class="text-xl font-medium">Không tìm thấy nhân viên phù hợp</p>
                    <p class="text-sm mt-2">Vui lòng thử lại với tên khác</p>
                </div>`;
            return;
        }

        activeEmployees.forEach((emp, index) => {
            const card = document.createElement('div');
            const avatarColor = getAvatarColor(index);
            const initials = getInitials(emp.name);

            card.className = 'bg-white rounded-[15px] shadow-sm hover:shadow-md transition-all cursor-pointer border border-[#f0f0f0] p-4 flex gap-4 items-center';
            card.style.height = 'auto';

            // Create avatar HTML - show image if available, otherwise show initials
            let avatarHTML = '';
            if (emp.avatar) {
                avatarHTML = `<img src="${emp.avatar}" alt="${emp.name}" class="w-full h-full object-cover">`;
            } else {
                avatarHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold text-2xl" style="background-color: ${avatarColor}">${initials}</div>`;
            }

            card.innerHTML = `
                <!-- Left: Avatar (Slightly Smaller for 4-col) -->
                <div class="w-24 h-28 flex-shrink-0 rounded-[12px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                    ${avatarHTML}
                </div>

                <!-- Right: Content -->
                <div class="flex-1 flex flex-col justify-between h-full min-h-[112px] overflow-hidden">
                    <!-- Employee Name -->
                    <h3 class="font-bold text-[16px] text-[#2d3748] mt-1 mb-1 leading-tight hover:text-brand-primary transition employee-name-edit truncate" title="${emp.name}">${emp.name}</h3>

                    <!-- Employee info and action -->
                    <div class="flex justify-between items-end gap-1">
                        <!-- Employee Info -->
                        <div class="space-y-[0px] cursor-pointer hover:opacity-75 transition employee-info-edit">
                            <div class="flex items-center gap-1.5 text-[13px] text-gray-600">
                                <i class="fa-solid fa-briefcase text-brand-primary w-4 text-center"></i>
                                <span class="truncate max-w-[90px]">${emp.role}</span>
                            </div>
                            <div class="flex items-center gap-1.5 text-[12px] text-gray-500">
                                <i class="fa-solid fa-phone text-brand-primary w-4 text-center"></i>
                                <span>${emp.phone}</span>
                            </div>
                            <div class="flex items-center gap-1.5 text-[12px] text-gray-500">
                                <i class="fa-solid fa-calendar text-brand-primary w-4 text-center"></i>
                                <span>${formatDateValue(emp.dob)}</span>
                            </div>
                            <div class="flex items-center gap-1.5 text-[12px] text-gray-400">
                                <i class="fa-solid fa-id-card text-brand-primary w-4 text-center"></i>
                                <span>${emp.id}</span>
                            </div>
                        </div>

                        <!-- Delete Button (Icon Only) -->
                        <button class="delete-btn text-red-400 hover:text-red-600 transition flex-shrink-0 p-2 hover:bg-red-50 rounded-full translate-y-3" data-id="${emp.id}" title="Xóa nhân viên">
                            <i class="fa-solid fa-trash-can text-[18px]"></i>
                        </button>
                    </div>
                </div>
            `;

            // Add click event to view employee details
            const nameElement = card.querySelector('.employee-name-edit');
            const infoElement = card.querySelector('.employee-info-edit');

            if (nameElement) {
                nameElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sessionStorage.setItem('viewingEmployeeId', emp.id);
                    window.location.href = 'employee_detail.html';
                });
            }

            if (infoElement) {
                infoElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sessionStorage.setItem('viewingEmployeeId', emp.id);
                    window.location.href = 'employee_detail.html';
                });
            }

            cardsContainer.appendChild(card);
        });

        // Bind Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentDeleteId = e.currentTarget.getAttribute('data-id');
                showDeleteModal();
            });
        });
    };

    // Initial render
    renderCards();

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

                    renderCards();
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

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchEmployeeBtn');

    if (searchInput) {
        // Real-time search as user types
        searchInput.addEventListener('input', (e) => {
            renderCards(e.target.value);
        });

        // Trigger search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                renderCards(searchInput.value);
            }
        });
    }

    if (searchBtn) {
        // Trigger search on button click
        searchBtn.addEventListener('click', () => {
            renderCards(searchInput.value ? searchInput.value : '');
        });
    }

    // Branch filter functionality
    const branchFilter = document.getElementById('branchFilter');
    if (branchFilter) {
        branchFilter.addEventListener('change', () => {
            renderCards(searchInput ? searchInput.value : '');
        });
    }
});
