// Mảng Quản lý Dữ Liệu
let currentWeekOffset = 0;
let todayRefDate = new Date();
// Giả lập ID tự động
let guid = 100;

let shifts = [
    { id: '1', empId: 'NV001', name: 'Nguyễn Thị Thu Trang', date: formatFullDate(new Date()), start: '06:15', end: '12:30', note: 'Ca sáng' },
    { id: '2', empId: 'NV002', name: 'Trần Văn Bình', date: formatFullDate(new Date()), start: '13:00', end: '17:00', note: 'Ca chiều' },
];

// Tạm mảng dữ liệu nhân viên để làm gợi ý nhập
const mockEmployeesData = [
    { id: 'NV001', name: 'Nguyễn Thị Thu Trang', bg: 'bg-[#316aff]', border: 'border-[#1b4edc]' }, // Blue
    { id: 'NV002', name: 'Trần Văn Bình', bg: 'bg-[#10b981]', border: 'border-[#059669]' }, // Green
    { id: 'NV003', name: 'Lê Văn Cảng', bg: 'bg-[#8b5cf6]', border: 'border-[#6d28d9]' }, // Purple
    { id: 'NV004', name: 'Phạm Thị Dung', bg: 'bg-[#f59e0b]', border: 'border-[#d97706]' }, // Orange
    { id: 'NV005', name: 'Hoàng Văn Em', bg: 'bg-[#ec4899]', border: 'border-[#be185d]' }  // Pink
];

let actionShiftId = null;

// Khởi tạo Datalist cho input chọn tên
function initDatalist() {
    const existingList = document.getElementById('employee-list');
    if (existingList) existingList.remove();

    const datalist = document.createElement('datalist');
    datalist.id = 'employee-list';
    mockEmployeesData.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.name;
        datalist.appendChild(option);
    });
    document.body.appendChild(datalist);
}

// Xử lý sự kiện nhập/chọn Tên nhân viên
window.handleEmployeeSelect = function(mode) {
    const nameInput = document.getElementById(mode + '-empName').value;
    const idInput = document.getElementById(mode + '-empId');

    const matchedEmp = mockEmployeesData.find(e => e.name === nameInput.trim());
    if(matchedEmp) {
        idInput.value = matchedEmp.id;
    } else {
        idInput.value = '';
    }
};

function getMonday(d) {
    let nd = new Date(d);
    let day = nd.getDay();
    let diff = nd.getDate() - day + (day === 0 ? -6 : 1);
    let monday = new Date(nd.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
}

function formatDate(date) {
    let d = date.getDate().toString().padStart(2, '0');
    let m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}`;
}

function formatFullDate(date) {
    let d = date.getDate().toString().padStart(2, '0');
    let m = (date.getMonth() + 1).toString().padStart(2, '0');
    let y = date.getFullYear();
    return `${y}-${m}-${d}`;
}

// --- Render UI ---
function renderCalendar() {
    let ref = new Date(todayRefDate);
    ref.setDate(ref.getDate() + currentWeekOffset * 7);

    let monday = getMonday(ref);
    let sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);

    // Cập nhật Header
    const weekTitleEl = document.getElementById('week-title');
    if (weekTitleEl) {
        weekTitleEl.innerText = `Tuần ${formatDate(monday)} – ${formatDate(sunday)}/${sunday.getFullYear()}`;
    }

    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    for (let i = 0; i < 7; i++) {
        let currentDay = new Date(monday);
        currentDay.setDate(monday.getDate() + i);
        const headerDayEl = document.getElementById(`header-day-${i}`);
        if (headerDayEl) {
            headerDayEl.innerText = `${dayNames[i]}_${formatDate(currentDay)}`;
        }
    }

    // Cập nhật khung giờ 06:00 -> 24:00
    const calendarBody = document.getElementById('calendar-body');
    if (!calendarBody) return;

    let htmlGrid = "";
    for(let hour = 6; hour <= 24; hour++) {
        const hourText = hour.toString().padStart(2, '0') + ":00";
        htmlGrid += `<div class="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-100 min-h-[50px] w-full">`;

        htmlGrid += `
            <div class="relative flex items-start justify-center text-[#9ca3af] font-medium pt-2 border-r border-gray-100 bg-white z-0">
                <span class="bg-white px-1 leading-none text-[11px]">${hourText}</span>
            </div>
        `;

        for(let day = 0; day < 7; day++) {
            let currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + day);
            let dateStr = formatFullDate(currentDay);
            let defaultTime = hour.toString().padStart(2, '0') + ":00";
            htmlGrid += `<div class="cursor-pointer border-r border-gray-100/50 hover:bg-[#f3ece8]/30 transition z-0 text-transparent" onclick="window.openAddModal('${dateStr}', '${defaultTime}')">.</div>`;
        }
        htmlGrid += `</div>`;
    }
    calendarBody.innerHTML = htmlGrid;

    renderShifts(monday, sunday);
}

function renderShifts(monday, sunday) {
    const gridBody = document.getElementById('calendar-body');
    if (!gridBody) return;

    const olds = gridBody.querySelectorAll('.shift-card');
    olds.forEach(o => o.remove());

    shifts.forEach(shift => {
        const shiftDate = new Date(shift.date);
        shiftDate.setHours(0,0,0,0);

        if (shiftDate >= monday && shiftDate <= sunday) {
            const dayIndex = shiftDate.getDay() === 0 ? 6 : shiftDate.getDay() - 1;

            const startParts = shift.start.split(':');
            const endParts = shift.end.split(':');
            const startHour = parseInt(startParts[0]) + parseInt(startParts[1])/60;
            const endHour = parseInt(endParts[0]) + parseInt(endParts[1])/60;

            let topPos = (startHour - 6) * 50;
            if(topPos < 0) topPos = 0;
            let heightPos = (endHour - startHour) * 50;

            const empData = mockEmployeesData.find(e => e.id === shift.empId);
            const bgClass = empData ? empData.bg : 'bg-[#64748b]';
            const borderClass = empData ? empData.border : 'border-[#475569]';

            const card = document.createElement('div');
            card.className = `shift-card absolute ${bgClass} rounded-md text-white p-2 shadow-sm flex flex-col transition-transform duration-200 hover:scale-[1.01] cursor-pointer border ${borderClass} group z-30 pointer-events-auto`;

            card.style.left = `calc(60px + ${dayIndex} * ((100% - 60px) / 7) + 2px)`;
            card.style.width = `calc(((100% - 60px) / 7) - 4px)`;
            card.style.top = `${topPos}px`;
            card.style.height = `${heightPos}px`;
            card.style.minHeight = `45px`;
            card.innerHTML = `
                <div class="overflow-hidden flex-grow flex flex-col justify-start pointer-events-none">
                    <div class="font-bold text-[12px] md:text-[13px] leading-tight truncate px-1">${shift.empId}</div>
                    <div class="font-bold text-[12px] md:text-[13px] leading-tight mb-1 truncate px-1">${shift.name}</div>
                    <div class="text-[10px] md:text-[11px] opacity-90 font-medium px-1">${shift.start} - ${shift.end}</div>
                </div>
                <div class="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 bg-gradient-to-t from-black/20 to-transparent mt-auto rounded-b-md">
                    <button onclick="event.stopPropagation(); window.openEditModal('${shift.id}')" class="text-white hover:text-gray-200 transition p-1"><i class="fa-solid fa-pencil text-[12px] md:text-[14px]"></i></button>
                    <button onclick="event.stopPropagation(); window.openDeleteModal('${shift.id}')" class="text-white hover:text-red-200 transition p-1"><i class="fa-regular fa-trash-can text-[13px] md:text-[15px]"></i></button>
                </div>
            `;
            gridBody.appendChild(card);
        }
    });
}

// --- Logic Chức Năng Cốt Lõi ---

window.changeWeek = function(diff) {
    currentWeekOffset += diff;
    renderCalendar();
};

window.jumpToDate = function(dateStr) {
    if(!dateStr) return;
    const targetDate = new Date(dateStr);
    const currentMon = getMonday(todayRefDate);
    const targetMon = getMonday(targetDate);
    const diffTime = Math.abs(targetMon - currentMon);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = targetMon < currentMon ? -(diffDays/7) : (diffDays/7);
    currentWeekOffset = Math.round(weeks);
    renderCalendar();
};

window.openAddModal = function(dateStr, defaultTime = '06:00') {
    const formAdd = document.getElementById('form-add');
    if (formAdd) formAdd.reset();

    const addDateEl = document.getElementById('add-date');
    if (addDateEl) addDateEl.value = dateStr;

    const addStartEl = document.getElementById('add-start');
    if (addStartEl) addStartEl.value = defaultTime;

    let endHour = parseInt(defaultTime.split(':')[0]) + 4;
    if(endHour > 23) endHour = 23;
    const addEndEl = document.getElementById('add-end');
    if (addEndEl) addEndEl.value = endHour.toString().padStart(2, '0') + ":00";

    openModal('modal-add');
};

window.submitAddSchedule = function() {
    const empId = document.getElementById('add-empId').value;
    const empName = document.getElementById('add-empName').value;

    if(!empId) {
        showPopup('Tên nhân viên không tồn tại', 'error');
        return;
    }

    const start = document.getElementById('add-start').value;
    const end = document.getElementById('add-end').value;
    const note = document.getElementById('add-note').value;
    const date = document.getElementById('add-date').value;

    shifts.push({
        id: 'S' + (++guid),
        empId, name: empName, date, start, end, note
    });

    closeModal('modal-add');
    renderCalendar();
    showPopup('Tạo lịch làm việc thành công', 'success');
};

window.openEditModal = function(id) {
    actionShiftId = id;
    const shift = shifts.find(s => s.id === id);
    if(shift) {
        const editIdEl = document.getElementById('edit-id');
        if (editIdEl) editIdEl.value = shift.id;

        const editDateEl = document.getElementById('edit-date');
        if (editDateEl) editDateEl.value = shift.date;

        const editEmpIdEl = document.getElementById('edit-empId');
        if (editEmpIdEl) editEmpIdEl.value = shift.empId;

        const editEmpNameEl = document.getElementById('edit-empName');
        if (editEmpNameEl) editEmpNameEl.value = shift.name;

        const editStartEl = document.getElementById('edit-start');
        if (editStartEl) editStartEl.value = shift.start;

        const editEndEl = document.getElementById('edit-end');
        if (editEndEl) editEndEl.value = shift.end;

        const editNoteEl = document.getElementById('edit-note');
        if (editNoteEl) editNoteEl.value = shift.note;

        openModal('modal-edit');
    }
};

window.submitEditSchedule = function() {
    const empId = document.getElementById('edit-empId').value;
    if(!empId) {
        showPopup('Tên nhân viên không tồn tại', 'error');
        return;
    }
    const shiftIndex = shifts.findIndex(s => s.id === actionShiftId);
    if(shiftIndex > -1) {
        shifts[shiftIndex].empId = document.getElementById('edit-empId').value;
        shifts[shiftIndex].name = document.getElementById('edit-empName').value;
        shifts[shiftIndex].start = document.getElementById('edit-start').value;
        shifts[shiftIndex].end = document.getElementById('edit-end').value;
        shifts[shiftIndex].note = document.getElementById('edit-note').value;
    }

    closeModal('modal-edit');
    renderCalendar();
    showPopup('Cập nhật lịch làm việc thành công', 'success');
};

window.openDeleteModal = function(id) {
    actionShiftId = id;
    openModal('modal-delete');
};

window.submitDeleteSchedule = function() {
    shifts = shifts.filter(s => s.id !== actionShiftId);
    closeModal('modal-delete');
    renderCalendar();
    showPopup('Xóa lịch làm việc thành công', 'success');
};

// --- View Handlers ---
window.openModal = function(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('hidden');
    m.classList.add('flex');
    setTimeout(() => m.classList.remove('opacity-0'), 10);
};

window.closeModal = function(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('opacity-0');
    setTimeout(() => {
        m.classList.add('hidden');
        m.classList.remove('flex');
    }, 300);
};

window.closeOnBackdrop = function(e, id) {
    if (e.target.id === id) {
        closeModal(id);
    }
};

// --- Popup ---
let popupTimer;
window.showPopup = function(msg, type) {
    const popup = document.getElementById('popup-notification');
    const iconSuccess = document.getElementById('popup-icon-success');
    const iconError = document.getElementById('popup-icon-error');
    const textEl = document.getElementById('popup-msg');

    if (!popup || !iconSuccess || !iconError || !textEl) return;

    iconSuccess.classList.add('hidden');
    iconError.classList.add('hidden');
    clearTimeout(popupTimer);

    textEl.innerHTML = msg;
    if (type === 'success') {
        iconSuccess.classList.remove('hidden');
    } else {
        iconError.classList.remove('hidden');
    }

    popup.classList.remove('hidden');
    popup.classList.add('flex');
    setTimeout(() => popup.classList.remove('opacity-0'), 10);

    popupTimer = setTimeout(() => {
        closePopup();
    }, 2500);
};

window.closePopup = function() {
    const popup = document.getElementById('popup-notification');
    if (!popup) return;
    popup.classList.add('opacity-0');
    setTimeout(() => {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
    }, 300);
}

// Init App
document.addEventListener('DOMContentLoaded', () => {
    initDatalist();
    renderCalendar();
});
