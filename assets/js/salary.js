const payrolls = [
    { id: "ML0001", employeeId: "NV0001", employeeName: "Nguyễn Văn An", month: "11/2025", totalSalary: 5000000, bonus: 500000, penalty: 0, status: "pending" },
    { id: "ML0002", employeeId: "NV0002", employeeName: "Nguyễn Thị An", month: "11/2025", totalSalary: 4500000, bonus: 700000, penalty: 0, status: "pending" },
    { id: "ML0003", employeeId: "NV0003", employeeName: "Nguyễn Văn Anh", month: "11/2025", totalSalary: 4000000, bonus: 500000, penalty: 0, status: "pending" },
    { id: "ML0004", employeeId: "NV0004", employeeName: "Nguyễn Thị Anh", month: "11/2025", totalSalary: 5000000, bonus: 1000000, penalty: 0, status: "approved" },
    { id: "ML0005", employeeId: "NV0005", employeeName: "Nguyễn Văn Ánh", month: "11/2025", totalSalary: 5000000, bonus: 500000, penalty: 0, status: "approved" },
    { id: "ML0006", employeeId: "NV0006", employeeName: "Trần Minh Quân", month: "11/2025", totalSalary: 4000000, bonus: 300000, penalty: 0, status: "rejected" },
    { id: "ML0007", employeeId: "NV0007", employeeName: "Lê Thị Hồng", month: "11/2025", totalSalary: 3500000, bonus: 200000, penalty: 100000, status: "rejected" },
    { id: "ML0008", employeeId: "NV0008", employeeName: "Phạm Văn Long", month: "11/2025", totalSalary: 4200000, bonus: 300000, penalty: 0, status: "pending" },
    { id: "ML0009", employeeId: "NV0009", employeeName: "Đặng Thị Mai", month: "11/2025", totalSalary: 4700000, bonus: 400000, penalty: 50000, status: "pending" },
    { id: "ML0010", employeeId: "NV0010", employeeName: "Bùi Văn Nam", month: "11/2025", totalSalary: 3900000, bonus: 200000, penalty: 0, status: "pending" },
    { id: "ML0011", employeeId: "NV0011", employeeName: "Hoàng Thị Nhung", month: "11/2025", totalSalary: 4500000, bonus: 350000, penalty: 0, status: "approved" },
    { id: "ML0012", employeeId: "NV0012", employeeName: "Vũ Văn Phúc", month: "11/2025", totalSalary: 4300000, bonus: 300000, penalty: 100000, status: "rejected" },
    { id: "ML0013", employeeId: "NV0013", employeeName: "Ngô Thị Quỳnh", month: "11/2025", totalSalary: 4800000, bonus: 400000, penalty: 0, status: "approved" },
    { id: "ML0014", employeeId: "NV0014", employeeName: "Phan Văn Sơn", month: "11/2025", totalSalary: 4100000, bonus: 250000, penalty: 0, status: "pending" },
    { id: "ML0015", employeeId: "NV0015", employeeName: "Lý Thị Thảo", month: "11/2025", totalSalary: 4600000, bonus: 300000, penalty: 50000, status: "rejected" },
    { id: "ML0016", employeeId: "NV0016", employeeName: "Trịnh Văn Tài", month: "11/2025", totalSalary: 5200000, bonus: 600000, penalty: 0, status: "approved" },
    { id: "ML0017", employeeId: "NV0017", employeeName: "Đỗ Thị Trang", month: "11/2025", totalSalary: 4700000, bonus: 500000, penalty: 0, status: "approved" },
    { id: "ML0018", employeeId: "NV0018", employeeName: "Hà Văn Tuấn", month: "11/2025", totalSalary: 3800000, bonus: 200000, penalty: 0, status: "pending" },
    { id: "ML0019", employeeId: "NV0019", employeeName: "Mai Thị Uyên", month: "11/2025", totalSalary: 4400000, bonus: 350000, penalty: 0, status: "pending" },
    { id: "ML0020", employeeId: "NV0020", employeeName: "Nguyễn Văn Vinh", month: "11/2025", totalSalary: 5000000, bonus: 450000, penalty: 0, status: "approved" }
];

const attendanceData = [
    { employeeId: "NV0001", employeeName: "Nguyễn Văn An", month: "01/2026", workedHours: 12, coefficient: 2.0, baseSalary: 8000000, hourlyRate: 20000 },
    { employeeId: "NV0002", employeeName: "Trần Thị Bình", month: "01/2026", workedHours: 11, coefficient: 2.5, baseSalary: 8500000, hourlyRate: 22000 },
    { employeeId: "NV0003", employeeName: "Lê Văn Cang", month: "01/2026", workedHours: 16, coefficient: 2.0, baseSalary: 7800000, hourlyRate: 18000 },
    { employeeId: "NV0001", employeeName: "Nguyễn Văn An", month: "02/2026", workedHours: 20, coefficient: 2.0, baseSalary: 8000000, hourlyRate: 20000 },
    { employeeId: "NV0002", employeeName: "Trần Thị Bình", month: "02/2026", workedHours: 20, coefficient: 2.5, baseSalary: 8500000, hourlyRate: 22000 },
    { employeeId: "NV0003", employeeName: "Lê Văn Cang", month: "02/2026", workedHours: 30, coefficient: 2.0, baseSalary: 7800000, hourlyRate: 18000 }
];

let selectedCalcEmployeeId = null;
let currentSalaryDraft = null;
let editingPayrollId = null;
let currentFilter = "pending";
let pendingDeleteId = null;

const btnCalculateSalary = document.getElementById("btnCalculateSalary");
const salaryCalcModal = document.getElementById("salaryCalcModal");
const closeCalcModal = document.getElementById("closeCalcModal");
const btnCancelCalc = document.getElementById("btnCancelCalc");
const btnStartCalc = document.getElementById("btnStartCalc");
const calcMonth = document.getElementById("calcMonth");
const calcTableBody = document.getElementById("calcTableBody");

const salaryDetailModal = document.getElementById("salaryDetailModal");
const closeSalaryDetailModal = document.getElementById("closeSalaryDetailModal");
const btnCancelSalaryDetail = document.getElementById("btnCancelSalaryDetail");
const btnSaveSalary = document.getElementById("btnSaveSalary");

const salaryCodePreview = document.getElementById("salaryCodePreview");
const salaryEmployeePreview = document.getElementById("salaryEmployeePreview");
const salaryMonthPreview = document.getElementById("salaryMonthPreview");

const detailBaseSalary = document.getElementById("detailBaseSalary");
const detailCoefficient = document.getElementById("detailCoefficient");
const detailHourlyRate = document.getElementById("detailHourlyRate");
const detailWorkedHours = document.getElementById("detailWorkedHours");
const detailBonus = document.getElementById("detailBonus");
const detailPenalty = document.getElementById("detailPenalty");
const detailNetSalary = document.getElementById("detailNetSalary");

const tableBody = document.getElementById("payrollTableBody");
const monthFilter = document.getElementById("monthFilter");
const searchInput = document.getElementById("searchInput");
const btnSearch = document.getElementById("btnSearch");
const filterTabs = document.querySelectorAll(".filter-tab");

const deletePopup = document.getElementById("deletePopup");
const btnCancelDelete = document.getElementById("btnCancelDelete");
const btnConfirmDelete = document.getElementById("btnConfirmDelete");

const messagePopupBox = document.getElementById("messagePopupBox");
const messagePopupText = document.getElementById("messagePopupText");
const messagePopupIcon = document.getElementById("messagePopupIcon");

const tableHeadRow = document.getElementById("salaryTableHeadRow");

const salaryPage = document.getElementById("salaryPage");
const exportPage = document.getElementById("exportPage");
const btnExportSalary = document.getElementById("btnExportSalary");
const btnBack = document.getElementById("btnBack");
const exportTableBody = document.getElementById("exportTableBody");
const exportMonth = document.getElementById("exportMonth");
const btnPrintSalary = document.getElementById("btnPrintSalary");

const calcErrorMode = {
    fetchFailed: false,
    saveFailed: false
};

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("vi-VN");
}

function getNetSalary(item) {
    return Number(item.totalSalary || 0) + Number(item.bonus || 0) - Number(item.penalty || 0);
}

function getSelectedMonthText() {
    if (!monthFilter.value) return "";
    const [year, month] = monthFilter.value.split("-");
    return `${month}/${year}`;
}

function buildFilteredData() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedMonth = getSelectedMonthText();

    return payrolls.filter((item) => {
        if (item.status === "deleted") return false;

        const matchStatus = item.status === currentFilter;
        const matchMonth = !selectedMonth || item.month === selectedMonth;
        const matchKeyword =
            !keyword ||
            item.id.toLowerCase().includes(keyword) ||
            item.employeeId.toLowerCase().includes(keyword) ||
            item.employeeName.toLowerCase().includes(keyword);

        return matchStatus && matchMonth && matchKeyword;
    });
}

function shouldShowActionColumn() {
    return currentFilter === "pending";
}

function renderTableHeader() {
    if (!tableHeadRow) return;

    if (shouldShowActionColumn()) {
        tableHeadRow.innerHTML = `
            <th>STT</th>
            <th>Mã lương</th>
            <th>Mã NV</th>
            <th>Tên nhân viên</th>
            <th>Tháng</th>
            <th>Lương cơ bản</th>
            <th>Thưởng</th>
            <th>Phạt</th>
            <th>Lương thực lãnh</th>
            <th>Hành động</th>
            <th>Trạng thái</th>
        `;
    } else {
        tableHeadRow.innerHTML = `
            <th>STT</th>
            <th>Mã lương</th>
            <th>Mã NV</th>
            <th>Tên nhân viên</th>
            <th>Tháng</th>
            <th>Lương cơ bản</th>
            <th>Thưởng</th>
            <th>Phạt</th>
            <th>Lương thực lãnh</th>
            <th>Trạng thái</th>
        `;
    }
}

function renderStatus(status) {
    if (status === "approved") return `<span class="status-approved-text">Đã duyệt</span>`;
    if (status === "rejected") return `<span class="status-rejected-text">Đã từ chối</span>`;
    return `
        <div class="status-symbols">
            <span class="status-check">✓</span>
            <span class="status-cross">✕</span>
        </div>
    `;
}

function renderPendingStatus(payrollId) {
    return `
        <div class="status-symbols">
            <span class="status-check action-approve" title="Duyệt" onclick="handleApproveClick('${payrollId}')">✓</span>
            <span class="status-cross action-reject" title="Từ chối" onclick="handleRejectClick('${payrollId}')">✕</span>
        </div>
    `;
}

function renderActionButtons(item) {
    return `
        <div class="action-group">
            <i class="fa-solid fa-pen action-icon" title="Chỉnh sửa" onclick="handleEditClick('${item.id}')"></i>
            <i class="fa-regular fa-trash-can action-icon action-delete" title="Xóa" onclick="handleDeleteClick('${item.id}')"></i>
        </div>
    `;
}

function renderEmptyPendingState() {
    tableBody.innerHTML = `
        <tr>
            <td colspan="11" class="empty-pending-cell">
                <div class="empty-pending-box">
                    <div class="empty-pending-icon">✕</div>
                    <div class="empty-pending-title">Chưa có bảng lương để duyệt</div>
                    <div class="empty-pending-subtitle">Hiện tại không có bảng lương nào đang chờ duyệt.</div>
                </div>
            </td>
        </tr>
    `;
}

function renderEmptyNormalState(showAction) {
    tableBody.innerHTML = `
        <tr>
            <td colspan="${showAction ? 11 : 10}" class="empty-state">Không có dữ liệu phù hợp.</td>
        </tr>
    `;
}

function renderTable() {
    const data = buildFilteredData();
    const showAction = shouldShowActionColumn();

    renderTableHeader();

    if (data.length === 0) {
        if (currentFilter === "pending") {
            renderEmptyPendingState();
        } else {
            renderEmptyNormalState(showAction);
        }
        return;
    }

    tableBody.innerHTML = data.map((item, index) => {
        if (showAction) {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.id}</td>
                    <td>${item.employeeId}</td>
                    <td>${item.employeeName}</td>
                    <td>${item.month}</td>
                    <td>${formatCurrency(item.totalSalary)}</td>
                    <td>${formatCurrency(item.bonus)}</td>
                    <td>${formatCurrency(item.penalty)}</td>
                    <td>${formatCurrency(getNetSalary(item))}</td>
                    <td>${renderActionButtons(item)}</td>
                    <td>${renderPendingStatus(item.id)}</td>
                </tr>
            `;
        }

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${item.id}</td>
                <td>${item.employeeId}</td>
                <td>${item.employeeName}</td>
                <td>${item.month}</td>
                <td>${formatCurrency(item.totalSalary)}</td>
                <td>${formatCurrency(item.bonus)}</td>
                <td>${formatCurrency(item.penalty)}</td>
                <td>${formatCurrency(getNetSalary(item))}</td>
                <td>${renderStatus(item.status)}</td>
            </tr>
        `;
    }).join("");
}

function openDeletePopup(payrollId) {
    pendingDeleteId = payrollId;
    deletePopup.classList.add("show");
}

function closeDeletePopup() {
    pendingDeleteId = null;
    deletePopup.classList.remove("show");
}

function showMessagePopup(message, type = "success") {
    messagePopupText.innerHTML = message;
    messagePopupBox.className = `message-popup-box ${type} show`;

    if (type === "success") {
        messagePopupIcon.className = "fa-solid fa-circle-check";
        messagePopupIcon.style.display = "inline-block";
    } else {
        messagePopupIcon.style.display = "none";
    }

    clearTimeout(showMessagePopup.timer);
    showMessagePopup.timer = setTimeout(() => {
        messagePopupBox.classList.remove("show");
    }, 2500);
}

function handleDeleteClick(payrollId) {
    const payroll = payrolls.find((item) => item.id === payrollId);

    if (!payroll) {
        showMessagePopup("Kết nối dữ liệu.<br>Vui lòng thử lại !!!", "error");
        return;
    }

    if (payroll.status !== "pending") {
        showMessagePopup("Chỉ được xóa bảng lương ở trạng thái chờ duyệt.", "error");
        return;
    }

    openDeletePopup(payrollId);
}

function softDeletePayroll(payrollId) {
    const payroll = payrolls.find((item) => item.id === payrollId);
    if (!payroll) throw new Error("NOT_FOUND");
    payroll.status = "deleted";
}

function approvePayroll(payrollId) {
    const payroll = payrolls.find((item) => item.id === payrollId);
    if (!payroll) throw new Error("NOT_FOUND");
    payroll.status = "approved";
}

function rejectPayroll(payrollId) {
    const payroll = payrolls.find((item) => item.id === payrollId);
    if (!payroll) throw new Error("NOT_FOUND");
    payroll.status = "rejected";
}

function validateSalaryInputs(bonusValue, penaltyValue) {
    const bonus = Number(bonusValue);
    const penalty = Number(penaltyValue);

    if (bonusValue === "" || Number.isNaN(bonus) || bonus < 0) {
        detailBonus.classList.add("input-error");
        return { valid: false, message: "Tiền thưởng không hợp lệ, vui lòng nhập lại." };
    }

    if (penaltyValue === "" || Number.isNaN(penalty) || penalty < 0) {
        detailPenalty.classList.add("input-error");
        return { valid: false, message: "Tiền phạt không hợp lệ, vui lòng nhập lại." };
    }

    detailBonus.classList.remove("input-error");
    detailPenalty.classList.remove("input-error");

    return { valid: true, bonus, penalty };
}

function fillEditSalaryDetail(payroll) {
    editingPayrollId = payroll.id;

    currentSalaryDraft = {
        id: payroll.id,
        employeeId: payroll.employeeId,
        employeeName: payroll.employeeName,
        month: payroll.month,
        baseSalary: payroll.totalSalary,
        coefficient: 1,
        hourlyRate: 0,
        workedHours: 0,
        bonus: payroll.bonus,
        penalty: payroll.penalty,
        isEditMode: true
    };

    salaryCodePreview.textContent = `Mã lương: ${currentSalaryDraft.id}`;
    salaryEmployeePreview.textContent = `Mã NV: ${currentSalaryDraft.employeeId} - ${currentSalaryDraft.employeeName}`;
    salaryMonthPreview.textContent = `Tháng: ${currentSalaryDraft.month}`;

    detailBaseSalary.value = `${formatCurrency(currentSalaryDraft.baseSalary)} VNĐ`;
    detailCoefficient.value = currentSalaryDraft.coefficient;
    detailHourlyRate.value = `${formatCurrency(currentSalaryDraft.hourlyRate)} VNĐ`;
    detailWorkedHours.value = currentSalaryDraft.workedHours;
    detailBonus.value = currentSalaryDraft.bonus;
    detailPenalty.value = currentSalaryDraft.penalty;

    updateSalaryTotalPreview();
}

function updatePayroll(payrollId, payload) {
    const payroll = payrolls.find(item => item.id === payrollId);
    if (!payroll) throw new Error("NOT_FOUND");

    payroll.totalSalary = payload.totalSalary;
    payroll.bonus = payload.bonus;
    payroll.penalty = payload.penalty;
    payroll.status = "pending";
}
function handleEditClick(payrollId) {
    const payroll = payrolls.find(item => item.id === payrollId);

    if (!payroll) {
        showMessagePopup("Lỗi kết nối dữ liệu, vui lòng thử lại sau.", "error");
        return;
    }

    if (payroll.status !== "pending") {
        showMessagePopup("Chỉ bảng lương chưa duyệt mới được chỉnh sửa.", "error");
        return;
    }

    fillEditSalaryDetail(payroll);
    openSalaryDetailPopup();
}

function handleApproveClick(payrollId) {
    try {
        approvePayroll(payrollId);
        renderTable();
        showMessagePopup(`Đã duyệt bảng lương ${payrollId}`, "success");
    } catch {
        showMessagePopup("Kết nối dữ liệu.<br>Vui lòng thử lại !!!", "error");
    }
}

function handleRejectClick(payrollId) {
    try {
        rejectPayroll(payrollId);
        renderTable();
        showMessagePopup(`Đã từ chối bảng lương ${payrollId}`, "success");
    } catch {
        showMessagePopup("Kết nối dữ liệu.<br>Vui lòng thử lại !!!", "error");
    }
}


function monthTextToCode(value) {
    if (!value) return "";
    const [year, month] = value.split("-");
    return `${month}${year}`;
}

function getAttendanceByMonth(monthText) {
    return attendanceData.filter(item => item.month === monthText);
}

function hasPayrollInMonth(monthText) {
    return payrolls.some(item => item.month === monthText && item.status !== "deleted");
}

function getPayrollByEmployeeAndMonth(employeeId, monthText) {
    return payrolls.find(item =>
        item.employeeId === employeeId &&
        item.month === monthText &&
        item.status !== "deleted"
    );
}

function generatePayrollId(monthValue) {
    const monthCode = monthTextToCode(monthValue); // 112025
    const count = payrolls.length + 1;
    return `ML${monthCode}${String(count).padStart(3, "0")}`;
}
function calculateNetSalaryFromDraft(draft) {
    return (draft.baseSalary * draft.coefficient) + (draft.workedHours * draft.hourlyRate) + draft.bonus - draft.penalty;
}

function updateSalaryTotalPreview() {
    if (!currentSalaryDraft) return;

    currentSalaryDraft.bonus = Number(detailBonus.value) || 0;
    currentSalaryDraft.penalty = Number(detailPenalty.value) || 0;

    const total = calculateNetSalaryFromDraft(currentSalaryDraft);
    currentSalaryDraft.netSalary = total;
    detailNetSalary.textContent = `${formatCurrency(total)} VNĐ`;
}

function closeCalcSalaryModal() {
    salaryCalcModal.classList.remove("show");
    selectedCalcEmployeeId = null;
}

function openCalcSalaryModal() {
    salaryCalcModal.classList.add("show");
    selectedCalcEmployeeId = null;
    renderCalcTable();
}

function closeSalaryDetailPopup() {
    salaryDetailModal.classList.remove("show");
    currentSalaryDraft = null;
    editingPayrollId = null;
    detailBonus.classList.remove("input-error");
    detailPenalty.classList.remove("input-error");
}

function openSalaryDetailPopup() {
    salaryDetailModal.classList.add("show");
}

function renderCalcEmptyMessage(type = "empty") {
    if (type === "duplicated") {
        calcTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="padding: 0; border-bottom: none; background: transparent;">
                    <div class="calc-empty-box">
                        <div class="calc-empty-icon">✕</div>
                        <div class="calc-empty-title">Bảng lương tháng này đã được tính</div>
                        <div class="calc-empty-subtitle">Hiện tại không có bảng lương nào cần tính.</div>
                    </div>
                </td>
            </tr>
        `;
        btnStartCalc.disabled = true;
        return;
    }

    calcTableBody.innerHTML = `
        <tr>
            <td colspan="5" style="padding: 0; border-bottom: none; background: transparent;">
                <div class="calc-empty-box">
                    <div class="calc-empty-icon">✕</div>
                    <div class="calc-empty-title">Không có dữ liệu chấm công</div>
                    <div class="calc-empty-subtitle">Vui lòng kiểm tra dữ liệu chấm công trước khi tính.</div>
                </div>
            </td>
        </tr>
    `;
    btnStartCalc.disabled = true;
}

function renderCalcTable() {
    const selectedMonthText = monthInputToText(calcMonth.value);

    if (calcErrorMode.fetchFailed) {
        calcTableBody.innerHTML = "";
        btnStartCalc.disabled = true;
        showMessagePopup("Truy xuất dữ liệu không thành công,<br>vui lòng thử lại sau", "error");
        return;
    }

    if (hasPayrollInMonth(selectedMonthText)) {
        renderCalcEmptyMessage("duplicated");
        return;
    }

    const data = getAttendanceByMonth(selectedMonthText);

    if (data.length === 0) {
        renderCalcEmptyMessage("empty");
        return;
    }

    btnStartCalc.disabled = false;

    calcTableBody.innerHTML = data.map((item, index) => `
        <tr class="calc-row ${selectedCalcEmployeeId === item.employeeId ? "selected" : ""}">
            <td>
                <input 
                    type="radio" 
                    name="calcEmployeeSelect" 
                    value="${item.employeeId}" 
                    ${index === 0 && !selectedCalcEmployeeId ? "checked" : ""}
                    ${selectedCalcEmployeeId === item.employeeId ? "checked" : ""}
                >
            </td>
            <td>${item.employeeId}</td>
            <td>${item.employeeName}</td>
            <td>${item.workedHours}</td>
            <td>${item.coefficient}</td>
        </tr>
    `).join("");

    if (!selectedCalcEmployeeId && data.length > 0) {
        selectedCalcEmployeeId = data[0].employeeId;
    }

    const radios = calcTableBody.querySelectorAll('input[name="calcEmployeeSelect"]');
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            selectedCalcEmployeeId = radio.value;
            renderCalcTable();
        });
    });
}

function fillSalaryDetail(data) {
    const salaryCode = generatePayrollId(calcMonth.value);

    currentSalaryDraft = {
        id: salaryCode,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        month: data.month,
        baseSalary: data.baseSalary,
        coefficient: data.coefficient,
        hourlyRate: data.hourlyRate,
        workedHours: data.workedHours,
        bonus: 0,
        penalty: 0,
        totalSalary: (data.baseSalary * data.coefficient) + (data.workedHours * data.hourlyRate),
        isEditMode: false
    };

    salaryCodePreview.textContent = `Mã lương: ${salaryCode}`;
    salaryEmployeePreview.textContent = `Mã NV: ${data.employeeId} - ${data.employeeName}`;
    salaryMonthPreview.textContent = `Tháng: ${data.month}`;

    detailBaseSalary.value = `${formatCurrency(data.baseSalary)} VNĐ`;
    detailCoefficient.value = data.coefficient;
    detailHourlyRate.value = `${formatCurrency(data.hourlyRate)} VNĐ`;
    detailWorkedHours.value = data.workedHours;
    detailBonus.value = 0;
    detailPenalty.value = 0;

    editingPayrollId = null;
    updateSalaryTotalPreview();
}

function createPayrollFromDraft() {
    if (!currentSalaryDraft) throw new Error("EMPTY_DRAFT");
    if (calcErrorMode.saveFailed) throw new Error("SAVE_FAILED");

    if (getPayrollByEmployeeAndMonth(currentSalaryDraft.employeeId, currentSalaryDraft.month)) {
        throw new Error("DUPLICATED_EMPLOYEE_MONTH");
    }

    payrolls.push({
        id: currentSalaryDraft.id,
        employeeId: currentSalaryDraft.employeeId,
        employeeName: currentSalaryDraft.employeeName,
        month: currentSalaryDraft.month,
        totalSalary: (currentSalaryDraft.baseSalary * currentSalaryDraft.coefficient) + (currentSalaryDraft.workedHours * currentSalaryDraft.hourlyRate),
        bonus: currentSalaryDraft.bonus,
        penalty: currentSalaryDraft.penalty,
        status: "pending"
    });
}

function monthInputToText(value) {
    if (!value) return "";
    const [year, month] = value.split("-");
    return `${month}/${year}`;
}

function renderExportTable() {
    if (!exportTableBody) return;

    const selectedMonth = getExportMonthText();

    console.log("exportMonth.value =", exportMonth.value);
    console.log("selectedMonth =", selectedMonth);
    console.log("approved payrolls =", payrolls.filter(item => item.status === "approved"));

    const approvedList = payrolls.filter(item => {
        const matchStatus = item.status === "approved";
        const matchMonth = !selectedMonth || item.month === selectedMonth;
        return matchStatus && matchMonth;
    });

    console.log("approvedList =", approvedList);

    if (approvedList.length === 0) {
        exportTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="export-empty-cell">
                    <div class="export-empty-box">
                        <div class="export-empty-icon">✕</div>
                        <div class="export-empty-title">Không có bảng lương đã duyệt trong tháng này</div>
                        <div class="export-empty-subtitle">Hiện tại không có dữ liệu phù hợp để xuất</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    exportTableBody.innerHTML = approvedList.map(item => `
        <tr>
            <td><input type="checkbox" class="export-check"></td>
            <td>${item.employeeId}</td>
            <td>${item.employeeName}</td>
            <td>${formatCurrency(getNetSalary(item))}</td>
            <td class="status-approved">Đã duyệt</td>
        </tr>
    `).join("");
}

btnConfirmDelete.addEventListener("click", () => {
    if (!pendingDeleteId) return;

    try {
        const deletedId = pendingDeleteId;
        softDeletePayroll(deletedId);
        closeDeletePopup();
        renderTable();
        showMessagePopup(`Xóa bảng lương ${deletedId} thành công`, "success");
    } catch {
        closeDeletePopup();
        showMessagePopup("Kết nối dữ liệu.<br>Vui lòng thử lại !!!", "error");
    }
});

btnCancelDelete.addEventListener("click", closeDeletePopup);

deletePopup.addEventListener("click", (event) => {
    if (event.target === deletePopup) closeDeletePopup();
});

filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        filterTabs.forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");
        currentFilter = tab.dataset.status;
        renderTable();
    });
});

btnSearch.addEventListener("click", renderTable);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") renderTable();
});

monthFilter.addEventListener("change", renderTable);

if (btnExportSalary && salaryPage && exportPage && exportTableBody) {
    btnExportSalary.addEventListener("click", () => {
        salaryPage.style.display = "none";
        exportPage.style.display = "block";
        renderExportTable();
    });
}

if (btnBack && salaryPage && exportPage) {
    btnBack.addEventListener("click", () => {
        exportPage.style.display = "none";
        salaryPage.style.display = "block";
    });
}

if (exportMonth) {
    exportMonth.addEventListener("change", renderExportTable);
}

if (btnPrintSalary) {
    btnPrintSalary.addEventListener("click", () => {
        window.print();
    });
}

btnCalculateSalary.addEventListener("click", () => {
    openCalcSalaryModal();
});

closeCalcModal.addEventListener("click", closeCalcSalaryModal);
btnCancelCalc.addEventListener("click", closeCalcSalaryModal);

salaryCalcModal.addEventListener("click", (event) => {
    if (event.target === salaryCalcModal) closeCalcSalaryModal();
});

calcMonth.addEventListener("change", () => {
    selectedCalcEmployeeId = null;
    renderCalcTable();
});

btnStartCalc.addEventListener("click", () => {
    const selectedMonthText = monthInputToText(calcMonth.value);

    if (hasPayrollInMonth(selectedMonthText)) {
        renderCalcTable();
        return;
    }

    const data = getAttendanceByMonth(selectedMonthText);

    if (!data.length) {
        renderCalcTable();
        return;
    }

    if (!selectedCalcEmployeeId) {
        selectedCalcEmployeeId = data[0].employeeId;
    }

    const employeeAttendance = data.find(item => item.employeeId === selectedCalcEmployeeId);

    if (!employeeAttendance) {
        showMessagePopup("Vui lòng chọn nhân viên để tính lương", "error");
        return;
    }

    fillSalaryDetail(employeeAttendance);
    openSalaryDetailPopup();
});

closeSalaryDetailModal.addEventListener("click", closeSalaryDetailPopup);
btnCancelSalaryDetail.addEventListener("click", closeSalaryDetailPopup);

salaryDetailModal.addEventListener("click", (event) => {
    if (event.target === salaryDetailModal) closeSalaryDetailPopup();
});

detailBonus.addEventListener("input", updateSalaryTotalPreview);
detailPenalty.addEventListener("input", updateSalaryTotalPreview);

btnSaveSalary.addEventListener("click", () => {
    try {
        const validation = validateSalaryInputs(detailBonus.value, detailPenalty.value);

        if (!validation.valid) {
            showMessagePopup(validation.message, "error");
            return;
        }

        currentSalaryDraft.bonus = validation.bonus;
        currentSalaryDraft.penalty = validation.penalty;
        updateSalaryTotalPreview();

        if (currentSalaryDraft.isEditMode && editingPayrollId) {
            updatePayroll(editingPayrollId, {
                totalSalary:
                    (currentSalaryDraft.baseSalary * currentSalaryDraft.coefficient) +
                    (currentSalaryDraft.workedHours * currentSalaryDraft.hourlyRate),
                bonus: currentSalaryDraft.bonus,
                penalty: currentSalaryDraft.penalty
            });

            closeSalaryDetailPopup();
            renderTable();
            showMessagePopup("Chỉnh sửa bảng lương thành công", "success");
            return;
        }

        createPayrollFromDraft();
        const successMonth = currentSalaryDraft.month;

        closeSalaryDetailPopup();
        closeCalcSalaryModal();
        renderTable();
        showMessagePopup(`Tính lương tháng ${successMonth} thành công`, "success");
    } catch (error) {
        if (error.message === "DUPLICATED_EMPLOYEE_MONTH") {
            showMessagePopup("Bảng lương nhân viên này trong tháng đã tồn tại", "error");
            return;
        }

        showMessagePopup("Lỗi kết nối dữ liệu, vui lòng thử lại sau.", "error");
    }
});


const btnChooseFormat = document.getElementById("btnChooseFormat");
const formatDropdownMenu = document.getElementById("formatDropdownMenu");
const btnExportPdf = document.getElementById("btnExportPdf");
const btnExportExcel = document.getElementById("btnExportExcel");
const btnDoExport = document.getElementById("btnDoExport");

let selectedExportFormat = "";

if (btnChooseFormat && formatDropdownMenu) {
    btnChooseFormat.addEventListener("click", (event) => {
        event.stopPropagation();
        formatDropdownMenu.classList.toggle("show");
    });
}

if (btnExportPdf) {
    btnExportPdf.addEventListener("click", () => {
        selectedExportFormat = "PDF";
        btnChooseFormat.innerHTML = `PDF`;
        formatDropdownMenu.classList.remove("show");
    });
}

if (btnExportExcel) {
    btnExportExcel.addEventListener("click", () => {
        selectedExportFormat = "Excel";
        btnChooseFormat.innerHTML = `Excel`;
        formatDropdownMenu.classList.remove("show");
    });
}

if (btnDoExport) {
    btnDoExport.addEventListener("click", () => {
        if (!selectedExportFormat) {
            showMessagePopup("Vui lòng chọn định dạng trước khi xuất", "error");
            return;
        }

        showMessagePopup(`Đã chọn xuất file ${selectedExportFormat}`, "success");
    });
}

document.addEventListener("click", (event) => {
    if (
        formatDropdownMenu &&
        btnChooseFormat &&
        !formatDropdownMenu.contains(event.target) &&
        !btnChooseFormat.contains(event.target)
    ) {
        formatDropdownMenu.classList.remove("show");
    }
});


function getExportMonthText() {
    if (!exportMonth.value) return "";
    const [year, month] = exportMonth.value.split("-");
    return `${month}/${year}`;
}
window.handleDeleteClick = handleDeleteClick;
window.handleApproveClick = handleApproveClick;
window.handleRejectClick = handleRejectClick;
window.handleEditClick = handleEditClick;

renderTable();