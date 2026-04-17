let currentWeekOffset = 0;
let today = new Date();
today.setHours(0,0,0,0);

let employees = [];
let schedules = [];
let activeEmployeeIds = new Set(); // For filtering in sidebar
let lastConfirmedSearchQuery = ""; // Only updates when Enter or Search button is clicked

// --- Initialization ---

let isDragging = false;
let dragStartY = 0;
let dragCol = null;

async function init() {
    await fetchEmployees();
    await fetchSchedules();
    renderMiniCalendar();
    renderEmployeeSidebar();
    renderCalendar();
    populateRoleDropdown();
    setupDragListeners();

    // Search Box Enter Key Listener
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') window.performSearch();
        });
    }
}

function populateRoleDropdown() {
    const roleSelect = document.getElementById('schedule-role');
    if (!roleSelect) return;
    
    const roles = [...new Set(employees.map(e => e.role).filter(r => r))];
    roles.sort();
    
    roleSelect.innerHTML = '<option value="">Tất cả chức vụ</option>';
    roles.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.innerText = r;
        roleSelect.appendChild(opt);
    });
}

async function fetchEmployees() {
    try {
        const response = await fetch('/schedule/api/employees/');
        const data = await response.json();
        employees = data.employees;
        // Initially actve all
        employees.forEach(e => activeEmployeeIds.add(e.id));
        
        // Fill select in modal
        const select = document.getElementById('schedule-emp');
        if (select) {
            select.innerHTML = employees.map(e => `<option value="${e.id}">${e.name} (${e.role})</option>`).join('');
        }
    } catch (error) {
        console.error('Error fetching employees:', error);
    }
}

// Add click listeners for mini-calendar month navigation
document.addEventListener('DOMContentLoaded', () => {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    if (prevMonthBtn) prevMonthBtn.onclick = () => window.changeMonth(-1);
    if (nextMonthBtn) nextMonthBtn.onclick = () => window.changeMonth(1);
    
    init();
});

window.changeMonth = async function(diff) {
    currentWeekOffset += diff * 4; // Approximate month jump
    await fetchSchedules();
    renderCalendar();
    renderMiniCalendar();
}

// Add click listeners for mini-calendar month navigation
document.addEventListener('DOMContentLoaded', () => {
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    if (prevMonthBtn) prevMonthBtn.onclick = () => window.changeMonth(-1);
    if (nextMonthBtn) nextMonthBtn.onclick = () => window.changeMonth(1);
    
    init();
});

window.changeMonth = async function(diff) {
    currentWeekOffset += diff * 4; // Approximate month jump
    await fetchSchedules();
    renderCalendar();
    renderMiniCalendar();
}

async function fetchSchedules() {
    const monday = getMonday(new Date(today.getTime() + currentWeekOffset * 7 * 24 * 60 * 60 * 1000));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const start = formatDateISO(monday);
    const end = formatDateISO(sunday);
    
    try {
        const response = await fetch(`/schedule/api/data/?start=${start}&end=${end}`);
        const data = await response.json();
        schedules = data.schedules;
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
}

// --- Helpers ---

function getMonday(d) {
    let nd = new Date(d);
    let day = nd.getDay();
    let diff = nd.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(nd.setDate(diff));
}

function formatDateISO(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getEmployeeColor(empId) {
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.color : '#ccc';
}

// --- Render Functions ---

function renderCalendar() {
    const monday = getMonday(new Date(today.getTime() + currentWeekOffset * 7 * 24 * 60 * 60 * 1000));
    
    // Update labels - Only month and year as requested (if element exists)
    const weekLabel = document.getElementById('week-label');
    const monthNames = ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6", "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"];
    if (weekLabel) {
        weekLabel.innerText = `${monthNames[monday.getMonth()]} ${monday.getFullYear()}`;
    }

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        document.getElementById(`date-${i}`).innerText = date.getDate();
        if (formatDateISO(date) === formatDateISO(new Date())) {
            document.getElementById(`date-${i}`).classList.add('text-odoo-purple', 'font-bold');
        } else {
            document.getElementById(`date-${i}`).classList.remove('text-odoo-purple', 'font-bold');
        }
    }

    // Render Grid Lines if empty - 24 hours now (6 AM to 6 AM next day)
    const hourGrid = document.getElementById('hour-grid');
    if (hourGrid.innerHTML === "" || hourGrid.children.length < 20) {
        let lines = "";
        for (let i = 0; i < 24; i++) {
            lines += `<div style="top: ${i * 60}px; border-bottom: 1px solid #dee2e6; position: absolute; left: 0; right: 0; height: 1px;"></div>`;
        }
        hourGrid.innerHTML = lines;
    }

    renderShifts();
}

function renderShifts() {
    // Clear old cards
    document.querySelectorAll('.shift-card').forEach(el => el.remove());

    const monday = getMonday(new Date(today.getTime() + currentWeekOffset * 7 * 24 * 60 * 60 * 1000));
    const searchQuery = lastConfirmedSearchQuery;
    
    // Group schedules by Day and exact Time Range
    const dayGroups = [[],[],[],[],[],[],[]]; // Each day has an array of groups
    
    let renderedCardCount = 0;
    schedules.forEach(s => {
        // Filter by Sidebar Checkboxes
        if (!activeEmployeeIds.has(s.empId)) return;
        
        // Filter by Search Box (Name or Role)
        if (searchQuery && !s.name.toLowerCase().includes(searchQuery) && !(s.role && s.role.toLowerCase().includes(searchQuery))) return;

        const sDate = new Date(s.date);
        const diff = Math.round((sDate - monday) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) {
            renderedCardCount++;
            // Find existing group for the same time on this day
            let group = dayGroups[diff].find(g => g.start === s.start && g.end === s.end);
            if (!group) {
                group = { start: s.start, end: s.end, items: [] };
                dayGroups[diff].push(group);
            }
            group.items.push(s);
        }
    });

    dayGroups.forEach((groups, dayIndex) => {
        const col = document.getElementById(`col-${dayIndex}`);
        
        groups.forEach(group => {
            const startH = timeToDecimal(group.start);
            let endH = timeToDecimal(group.end);
            
            // Pastel shift colors with matching strong borders
            let bgColor = "#f9fafb";
            let borderColor = "#70452F"; // Default brown
            
            if (group.start === "06:00") {
                bgColor = "#E3F2FD"; borderColor = "#1E88E5"; // Morning Blue
            } else if (group.start === "12:00") {
                bgColor = "#E8F5E9"; borderColor = "#43A047"; // Afternoon Green
            } else if (group.start === "17:00") {
                bgColor = "#FFF3E0"; borderColor = "#FB8C00"; // Evening Orange
            }

            // Adjust for 24h window (6 AM to 6 AM)
            let drawStart = startH;
            if (drawStart < 6) drawStart += 24;
            
            let drawEnd = endH;
            if (drawEnd <= startH && drawEnd < 6) drawEnd += 24;
            else if (drawEnd < 6) drawEnd += 24;

            const top = (drawStart - 6) * 60;
            const height = Math.max(35, (drawEnd - drawStart) * 60);
            
            const card = document.createElement('div');
            card.className = 'shift-card group hover:brightness-95';
            card.title = "Nhấn để chỉnh sửa ca làm này";
            card.onclick = (e) => { e.stopPropagation(); window.openEditModal(group); }; // Open group edit
            
            card.style.cssText = `
                position: absolute;
                top: ${top}px;
                height: ${height}px;
                left: 2px;
                right: 2px;
                background: ${bgColor};
                border-left: 6px solid ${borderColor};
                border-top: 1px solid rgba(0,0,0,0.05);
                border-right: 1px solid rgba(0,0,0,0.05);
                border-bottom: 1px solid rgba(0,0,0,0.05);
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                border-radius: 4px;
                padding: 4px 6px;
                overflow-y: auto;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 10;
                font-family: 'Montserrat', sans-serif;
                font-size: 11px;
                line-height: 1.3;
            `;
            
            // Generate list of employees with Role and Phone (Priority Phone)
            let employeeListHtml = "";
            group.items.forEach(s => {
                const emp = employees.find(e => e.id === s.empId);
                const role = emp ? (emp.role || "KV") : "KV";
                const phone = emp ? (emp.phone || "---") : "---";
                employeeListHtml += `
                    <div class="mb-1 pb-1 border-b border-black/5 last:border-0 hover:bg-black/5">
                        <span class="font-bold text-[#4B2E1F]">${s.name}</span><br/>
                        <span class="text-[9px] text-gray-500 uppercase font-semibold">${role} - ${phone}</span>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="sticky top-0 bg-white/40 backdrop-blur-sm pb-1 mb-1 border-b border-black/5 flex justify-between items-center">
                    <span class="text-[10px] font-black text-[#70452F]">${group.start} - ${group.end}</span>
                    <span class="flex items-center justify-center min-w-[18px] h-[18px] text-[10px] bg-white text-${borderColor} border border-${borderColor}/20 rounded-full font-black shadow-sm px-1" style="color: ${borderColor}; border-color: ${borderColor}33">
                        ${group.items.length}
                    </span>
                </div>
                <div>${employeeListHtml}</div>
            `;
            
            col.appendChild(card);
        });
    });

    // Handle Empty State
    const existingMsg = document.getElementById('search-empty-msg');
    if (existingMsg) existingMsg.remove();
    
    if (renderedCardCount === 0 && (searchQuery || activeEmployeeIds.size < employees.length)) {
        window.showSearchPopup(searchQuery);
    }
}

window.showSearchPopup = function(query) {
    const existing = document.getElementById('search-empty-msg');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'search-empty-msg';
    popup.className = 'fixed inset-0 z-[999] flex items-center justify-center p-4 pointer-events-none';
    popup.innerHTML = `
        <div class="bg-white border border-gray-100 rounded-xl p-6 shadow-2xl flex flex-col items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-500 pointer-events-auto max-w-[400px] w-full text-center">
            <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <i class="fa-solid fa-circle-exclamation text-red-500 text-2xl"></i>
            </div>
            <div class="flex flex-col gap-0.5">
                <h2 class="text-[#0a0a0a] font-black text-lg tracking-tight leading-tight">
                    KHÔNG CÓ DỮ LIỆU <span class="text-red-500">HỢP LỆ</span>
                </h2>
                <p class="text-gray-400 font-medium text-[10px] uppercase tracking-wider opacity-70">Không có kết quả khớp cho "${query || 'bộ lọc này'}"</p>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Auto remove after 5s
    setTimeout(() => {
        if (popup.parentElement) {
            popup.classList.add('animate-out', 'fade-out', 'zoom-out-95', 'duration-500');
            setTimeout(() => popup.remove(), 500);
        }
    }, 5000);
}

function timeToDecimal(t) {
    const parts = t.split(':');
    return parseInt(parts[0]) + parseInt(parts[1])/60;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}

// --- Sidebar Mini Calendar ---

function renderMiniCalendar() {
    const container = document.getElementById('mini-calendar-body');
    const monthLabel = document.getElementById('mini-month-label');
    
    // Focus mini calendar on the month currently visible in the main view
    const mainViewDate = new Date(today.getTime() + currentWeekOffset * 7 * 24 * 60 * 60 * 1000);
    const year = mainViewDate.getFullYear();
    const month = mainViewDate.getMonth();
    
    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    monthLabel.innerText = `${monthNames[month]} ${year}`;
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate highlight range (active week)
    const mondayOfActiveWeek = getMonday(mainViewDate);
    const activeWeekStart = mondayOfActiveWeek.getDate();
    const activeWeekMonth = mondayOfActiveWeek.getMonth();

    let html = '<tr>';
    let dayOfWeek = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon=0
    
    for (let i = 0; i < dayOfWeek; i++) html += '<td></td>';
    
    for (let day = 1; day <= daysInMonth; day++) {
        if (dayOfWeek === 7) {
            html += '</tr><tr>';
            dayOfWeek = 0;
        }
        
        const currentDate = new Date(year, month, day);
        const isSelectedWeek = (currentDate >= mondayOfActiveWeek && currentDate < new Date(mondayOfActiveWeek.getTime() + 7 * 86400000));
        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        
        const cls = [
            isSelectedWeek ? 'bg-brand-primary/20 font-bold' : '',
            isToday ? 'bg-brand-primary text-white' : ''
        ].join(' ');

        html += `<td class="${cls} hover:bg-gray-100 rounded cursor-pointer" onclick="window.jumpToDate(${year}, ${month}, ${day})">${day}</td>`;
        dayOfWeek++;
    }
    html += '</tr>';
    container.innerHTML = html;
}

window.jumpToDate = async function(y, m, d) {
    const targetDate = new Date(y, m, d);
    targetDate.setHours(0,0,0,0);
    
    // Calculate offset from current 'today'
    const diffTime = targetDate - today;
    currentWeekOffset = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
    
    await fetchSchedules();
    renderCalendar();
    renderMiniCalendar();
}

function renderEmployeeSidebar() {
    const list = document.getElementById('employee-sidebar-list');
    list.innerHTML = employees.map(emp => `
        <div class="flex items-center gap-2 py-1 px-2 hover:bg-odoo-light rounded cursor-pointer group" onclick="window.toggleEmployeeFilter('${emp.id}')">
            <input type="checkbox" ${activeEmployeeIds.has(emp.id) ? 'checked' : ''} class="accent-odoo-purple pointer-events-none">
            <div class="w-2.5 h-2.5 rounded-full" style="background-color: ${emp.color}"></div>
            <span class="text-[11px] flex-grow truncate">${emp.name}</span>
        </div>
    `).join('');
}

window.toggleEmployeeFilter = function(id) {
    if (activeEmployeeIds.has(id)) activeEmployeeIds.delete(id);
    else activeEmployeeIds.add(id);
    renderEmployeeSidebar();
    renderShifts();
}

window.selectAllEmployees = function() {
    if (activeEmployeeIds.size < employees.length) {
        // Not all selected -> select all
        employees.forEach(e => activeEmployeeIds.add(e.id));
    } else {
        // All already selected -> deselect all
        activeEmployeeIds.clear();
    }
    renderEmployeeSidebar();
    renderShifts();
}

// --- Actions ---

window.changeWeek = async function(diff) {
    currentWeekOffset += diff;
    await fetchSchedules();
    renderCalendar();
    renderMiniCalendar();
};

window.jumpToToday = async function() {
    currentWeekOffset = 0;
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = "";
    await fetchSchedules();
    renderCalendar();
    renderMiniCalendar();
};

window.handleGridClick = function(dayIndex, event) {
    if (event.target.closest('.shift-card')) return;
    // Handled by drag listeners now for clicks too (drag of 0 distance)
};

function setupDragListeners() {
    const calendarBody = document.getElementById('calendar-body');
    const ghost = document.getElementById('drag-ghost');

    window.addEventListener('mousedown', (e) => {
        const col = e.target.closest('.day-column');
        if (!col) return;
        if (e.target.closest('.shift-card')) return;

        isDragging = true;
        dragCol = parseInt(col.id.split('-')[1]);
        const rect = col.getBoundingClientRect();
        dragStartY = e.clientY - rect.top;

        ghost.style.left = `${col.offsetLeft}px`;
        ghost.style.width = `${col.offsetWidth}px`;
        ghost.style.top = `${dragStartY}px`;
        ghost.style.height = `0px`;
        ghost.classList.remove('hidden');
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const col = document.getElementById(`col-${dragCol}`);
        const rect = col.getBoundingClientRect();
        let currentY = e.clientY - rect.top;
        
        // Clamp to grid boundaries (0 to 1440px for 24h)
        currentY = Math.max(0, Math.min(1440, currentY));
        
        const top = Math.min(dragStartY, currentY);
        const height = Math.abs(currentY - dragStartY);
        
        ghost.style.top = `${top}px`;
        ghost.style.height = `${height}px`;
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        ghost.classList.add('hidden');

        const col = document.getElementById(`col-${dragCol}`);
        const rect = col.getBoundingClientRect();
        let endY = e.clientY - rect.top;
        endY = Math.max(0, Math.min(1440, endY));

        const top = Math.min(dragStartY, endY);
        const bottom = Math.max(dragStartY, endY);
        
        // At least 30 mins
        const finalBottom = (bottom - top < 15) ? top + 30 : bottom;

        let startDecimal = 6 + (top / 60);
        let endDecimal = 6 + (finalBottom / 60);
        
        if (startDecimal >= 24) startDecimal -= 24;
        if (endDecimal >= 24) endDecimal -= 24;

        const startTime = decimalToTime(startDecimal);
        const endTime = decimalToTime(endDecimal);

        const monday = getMonday(new Date(today.getTime() + currentWeekOffset * 7 * 86400000));
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + dragCol);

        window.openAddModal(formatDateISO(targetDate), startTime, endTime);
    });
}

function decimalToTime(decimal) {
    const h = Math.floor(decimal);
    const m = Math.floor((decimal - h) * 60);
    // Round to nearest 5 mins for cleaner UI
    const rm = Math.round(m / 5) * 5;
    return `${h.toString().padStart(2, '0')}:${rm >= 60 ? '55' : rm.toString().padStart(2, '0')}`;
}

window.updateEmpId = function(select) {
    // Deprecated for multi-select
};

window.filterEmployeesByRole = function(role) {
    window.renderEmployeeSelectionList(role);
};

window.renderEmployeeSelectionList = function(roleFilter = "", selectedIds = []) {
    const list = document.getElementById('employee-selection-list');
    if (!list) return;
    
    list.innerHTML = "";
    
    const filtered = roleFilter ? employees.filter(e => e.role === roleFilter) : employees;
    
    filtered.forEach(emp => {
        const label = document.createElement('label');
        label.className = "flex items-start gap-4 p-3 hover:bg-white rounded-[4px] cursor-pointer transition-all border border-transparent hover:border-[#e6e1dd] group";
        
        const isChecked = selectedIds.includes(emp.id) ? "checked" : "";
        
        label.innerHTML = `
            <input type="checkbox" name="emp-select" value="${emp.id}" ${isChecked} class="mt-1 w-4 h-4 rounded border-gray-300 text-[#70452F] focus:ring-[#7b543b] cursor-pointer">
            <div class="flex flex-col">
                <span class="text-[15px] font-bold text-[#4B2E1F] leading-tight">${emp.name}</span>
                <span class="text-[12px] text-[#999] font-semibold uppercase tracking-tight">${emp.role || "Nhân viên"}</span>
            </div>
        `;
        list.appendChild(label);
    });
    
    if (filtered.length === 0) {
        list.innerHTML = '<div class="text-center py-8 text-gray-400 text-xs italic">Không có nhân viên phù hợp</div>';
    }
};

window.updateShiftTimes = function(select) {
    const shift = select.value;
    const startField = document.getElementById('schedule-start');
    const endField = document.getElementById('schedule-end');

    if (shift === "Ca sáng") {
        startField.value = "06:00";
        endField.value = "12:00";
    } else if (shift === "Ca chiều") {
        startField.value = "12:00";
        endField.value = "17:00";
    } else if (shift === "Ca tối") {
        startField.value = "17:00";
        endField.value = "22:00";
    }
};

window.performSearch = function() {
    lastConfirmedSearchQuery = (document.getElementById('search-input')?.value || "").toLowerCase().trim();
    renderShifts();
}

window.openAddModal = function(date, start, end) {
    if (!date) date = formatDateISO(new Date());
    if (!start) start = "08:00";
    if (!end) end = "09:00";

    document.getElementById('modal-title').innerText = "Thêm lịch làm việc";
    document.getElementById('edit-id').value = "";
    document.getElementById('edit-date').value = date;
    document.getElementById('schedule-start').value = start;
    document.getElementById('schedule-end').value = end;
    
    // Reset Save button visibility and form interactivty
    document.getElementById('btn-save').classList.remove('hidden');
    document.getElementById('schedule-form-content').classList.remove('opacity-60', 'grayscale-[0.2]', 'pointer-events-none');
    
    // Auto-identify Shift (Ca làm) based on times
    const shiftSelect = document.getElementById('schedule-shift');
    if (start === "06:00" && end === "12:00") shiftSelect.value = "Ca sáng";
    else if (start === "12:00" && end === "17:00") shiftSelect.value = "Ca chiều";
    else if (start === "17:00" && end === "22:00") shiftSelect.value = "Ca tối";
    else shiftSelect.value = "";

    document.getElementById('schedule-note').value = "";
    document.getElementById('btn-delete').classList.add('hidden');
    
    // Reset Role and Employee List
    document.getElementById('schedule-role').value = "";
    window.renderEmployeeSelectionList();
    document.getElementById('role-select-box').classList.remove('hidden');

    document.getElementById('modal-schedule').classList.remove('hidden');
    document.getElementById('modal-schedule').classList.add('flex');
}

window.openEditModal = function(group) {
    // group contains {start, end, items: [{id, empId, date, name, ...}]}
    const first = group.items[0];
    
    document.getElementById('modal-title').innerText = "Chỉnh sửa lịch làm việc";
    document.getElementById('edit-id').value = "GROUP_EDIT"; // Signify it's an edit
    document.getElementById('edit-date').value = first.date;
    document.getElementById('schedule-start').value = group.start;
    document.getElementById('schedule-end').value = group.end;
    
    // Select correct shift (Exact matches only as requested)
    const shiftSelect = document.getElementById('schedule-shift');
    if (group.start === "06:00" && group.end === "12:00") shiftSelect.value = "Ca sáng";
    else if (group.start === "12:00" && group.end === "17:00") shiftSelect.value = "Ca chiều";
    else if (group.start === "17:00" && group.end === "22:00") shiftSelect.value = "Ca tối";
    else shiftSelect.value = "";

    document.getElementById('schedule-note').value = first.note || "";
    // Check if the date is in the past to disable editing
    const inputDate = new Date(first.date);
    inputDate.setHours(0,0,0,0);
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const isPast = inputDate < todayDate;

    if (isPast) {
        document.getElementById('modal-title').innerText = "Xem chi tiết lịch làm việc";
        document.getElementById('btn-save').classList.add('hidden');
        document.getElementById('btn-delete').classList.add('hidden');
        // Removed faded effect as requested
    } else {
        document.getElementById('modal-title').innerText = "Chỉnh sửa lịch làm việc";
        document.getElementById('btn-save').classList.remove('hidden');
        document.getElementById('btn-delete').classList.remove('hidden');
    }
    // Ensure form is always interactive (removed pointer-events-none)
    document.getElementById('schedule-form-content').classList.remove('opacity-60', 'grayscale-[0.2]', 'pointer-events-none');

    // Check all employees in the group
    const currentEmpIds = group.items.map(s => s.empId);
    document.getElementById('schedule-role').value = "";
    document.getElementById('role-select-box').classList.remove('hidden');
    window.renderEmployeeSelectionList("", currentEmpIds);

    window.clearAllErrors();
    document.getElementById('modal-schedule').classList.remove('hidden');
    document.getElementById('modal-schedule').classList.add('flex');
}

window.closeModal = function() {
    window.clearAllErrors();
    document.getElementById('modal-schedule').classList.add('hidden');
    document.getElementById('modal-schedule').classList.remove('flex');
}

window.showFieldError = function(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errDiv = document.getElementById(errorId);
    if (field) field.style.borderColor = "#ef4444"; // red-500
    if (errDiv) {
        errDiv.innerText = message;
        errDiv.classList.remove('hidden');
    }
}

window.clearAllErrors = function() {
    ['edit-date', 'schedule-shift', 'schedule-start', 'schedule-end', 'employee-selection-list'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.borderColor = ""; 
    });
    ['err-date', 'err-shift', 'err-start', 'err-end', 'err-emp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = "";
            el.classList.add('hidden');
        }
    });
}

window.saveSchedule = async function(e) {
    e.preventDefault();
    window.clearAllErrors();
    
    // Custom Validation
    const id = document.getElementById('edit-id').value;
    const dateStr = document.getElementById('edit-date').value;
    const shift = document.getElementById('schedule-shift').value;
    const start = document.getElementById('schedule-start').value;
    const end = document.getElementById('schedule-end').value;
    const checked = document.querySelectorAll('input[name="emp-select"]:checked');
    const empIds = Array.from(checked).map(c => c.value);
    
    let hasError = false;

    // 1. Check Required Fields
    if (!dateStr) { 
        window.showFieldError('edit-date', 'err-date', "Ngày làm không được để trống. Vui lòng nhập lại."); 
        hasError = true; 
    }
    if (!shift) { 
        window.showFieldError('schedule-shift', 'err-shift', "Ca làm không được để trống. Vui lòng nhập lại."); 
        hasError = true; 
    }
    if (!start) { 
        window.showFieldError('schedule-start', 'err-start', "Giờ mở đầu không được để trống. Vui lòng nhập lại."); 
        hasError = true; 
    }
    if (!end) { 
        window.showFieldError('schedule-end', 'err-end', "Giờ kết thúc không được để trống. Vui lòng nhập lại."); 
        hasError = true; 
    }
    if (empIds.length === 0) { 
        window.showFieldError('employee-selection-list', 'err-emp', "Nhân viên không được để trống. Vui lòng nhập lại."); 
        hasError = true; 
    }

    // 2. Check Past Date
    if (dateStr) {
        const inputDate = new Date(dateStr);
        inputDate.setHours(0,0,0,0);
        const todayDate = new Date();
        todayDate.setHours(0,0,0,0);
        
        if (inputDate < todayDate) {
            window.showFieldError('edit-date', 'err-date', "Không thể tạo hoặc chuyển lịch sang một ngày ở quá khứ. Vui lòng chọn lại.");
            hasError = true;
        }
    }

    if (hasError) return;

    const payload = {
        id: document.getElementById('edit-id').value,
        empId: empIds, // Now sending a list
        date: dateStr,
        start: start,
        end: end,
        shift: shift,
        note: document.getElementById('schedule-note').value,
    };
    
    try {
        const response = await fetch('/schedule/api/save/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            window.closeModal();
            await fetchSchedules();
            renderShifts();
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving schedule:', error);
    }
}

window.deleteSchedule = async function() {
    const id = document.getElementById('edit-id').value;
    if (id !== "GROUP_EDIT") return;
    
    const date = document.getElementById('edit-date').value;
    const start = document.getElementById('schedule-start').value;
    const end = document.getElementById('schedule-end').value;

    const inputDate = new Date(date);
    inputDate.setHours(0,0,0,0);
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    if (inputDate < todayDate) {
        alert("Không thể xóa lịch làm việc ở quá khứ.");
        return;
    }

    if (!confirm(`Bạn có chắc muốn xóa TOÀN BỘ ca làm việc này (${start} - ${end}) cho tất cả nhân viên?`)) return;
    
    try {
        const response = await fetch('/schedule/api/save/', { // We'll recycle save with an empty list or specific delete flag
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: "DELETE_GROUP",
                date: date,
                start: start,
                end: end,
                empId: [] // Empty list + DELETE_GROUP flag
            })
        });
        const result = await response.json();
        if (result.success) {
            window.closeModal();
            await fetchSchedules();
            renderShifts();
        }
    } catch (error) {
        console.error('Error deleting schedule group:', error);
    }
}

// App initialized on DOMContentLoaded above
