let payrolls = [];
let attendanceData = [];

async function fetchSalaryData() {
    try {
        console.log("Đang tải dữ liệu từ /salary/api/data/...");
        const response = await fetch('/salary/api/data/');
        const data = await response.json();
        console.log("Dữ liệu nhận được từ DB:", data);
        payrolls = data.payrolls || [];
        attendanceData = data.attendanceData || [];
        renderTable();
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ máy chủ:", error);
        tableBody.innerHTML = `<tr><td colspan="12" style="color:red">Lỗi kết nối máy chủ: ${error.message}</td></tr>`;
    }
}

async function syncSalaryAction(payload) {
    try {
        const response = await fetch('/salary/api/action/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error("Lỗi khi đồng bộ dữ liệu:", error);
        return false;
    }
}

function saveFilters() {
    const filters = {
        month: monthSelect?.value || "",
        year: yearSelect?.value || "",
        tab: currentFilter
    };
    localStorage.setItem("salary_filters", JSON.stringify(filters));
}

function loadFilters() {
    const saved = localStorage.getItem("salary_filters");
    if (saved) {
        try {
            const filters = JSON.parse(saved);
            if (monthSelect) monthSelect.value = filters.month || "";
            if (yearSelect) yearSelect.value = filters.year || "";
            if (filters.tab) {
                currentFilter = filters.tab;
                // Update UI active tab
                filterTabs.forEach(tab => {
                    if (tab.dataset.status === currentFilter) {
                        tab.classList.add("active");
                    } else {
                        tab.classList.remove("active");
                    }
                });
            }
        } catch (e) {
            console.error("Lỗi khi tải bộ lọc:", e);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Không ép buộc lọc theo tháng hiện tại ngay lập tức để người dùng thấy được dữ liệu cũ nếu có
    if (monthSelect) monthSelect.value = "";
    if (yearSelect) yearSelect.value = "2026"; // Mặc định năm 2026

    loadFilters();
    fetchSalaryData();
});

let selectedCalcEmployeeId = null;
let currentSalaryDraft = null;
let editingPayrollId = null;
let currentFilter = "all";
let pendingDeleteId = null;
let selectedExportFormat = "";

const btnCalculateSalary = document.getElementById("btnCalculateSalary");
const salaryCalcModal = document.getElementById("salaryCalcModal");
const closeCalcModal = document.getElementById("closeCalcModal");
const btnCancelCalc = document.getElementById("btnCancelCalc");
const btnStartCalc = document.getElementById("btnStartCalc");
const btnShowCalcEmployees = document.getElementById("btnShowCalcEmployees");
const calcMonthSelect = document.getElementById("calcMonthSelect");
const calcYearSelect = document.getElementById("calcYearSelect");
const calcTableBody = document.getElementById("calcTableBody");

const salaryDetailModal = document.getElementById("salaryDetailModal");
const closeSalaryDetailModal = document.getElementById("closeSalaryDetailModal");
const btnCancelSalaryDetail = document.getElementById("btnCancelSalaryDetail");
const btnSaveSalary = document.getElementById("btnSaveSalary");

const salaryCodePreview = document.getElementById("salaryCodePreview");
const salaryEmployeePreview = document.getElementById("salaryEmployeePreview");
const salaryMonthPreview = document.getElementById("salaryMonthPreview");

const detailBaseSalary = document.getElementById("detailBaseSalary");
const detailHourlyRate = document.getElementById("detailHourlyRate");
const detailWorkedHours = document.getElementById("detailWorkedHours");
const detailBonus = document.getElementById("detailBonus");
const detailPenalty = document.getElementById("detailPenalty");
const detailNetSalary = document.getElementById("detailNetSalary");

const tableBody = document.getElementById("payrollTableBody");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
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
const checkAllExport = document.getElementById("checkAllExport");

const btnChooseFormat = document.getElementById("btnChooseFormat");
const formatDropdownMenu = document.getElementById("formatDropdownMenu");
const btnExportPdf = document.getElementById("btnExportPdf");
const btnExportExcel = document.getElementById("btnExportExcel");
const btnDoExport = document.getElementById("btnDoExport");

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("vi-VN");
}

function getSelectedMonthText() {
    const month = monthSelect?.value || "";
    const year = yearSelect?.value || "";
    if (!month || !year) return "";
    return `${month}/${year}`;
}

function getCalcMonthText() {
    const month = calcMonthSelect?.value || "";
    const year = calcYearSelect?.value || "";
    if (!month || !year) return "";
    return `${month}/${year}`;
}

function getExportMonthText() {
    if (!exportMonth || !exportMonth.value) return "";
    const [year, month] = exportMonth.value.split("-");
    const result = `${month}/${year}`;
    console.log("Export filter month:", result);
    return result;
}

function getAttendanceRecord(employeeId, monthText) {
    return attendanceData.find(
        (item) => item.employeeId === employeeId && item.month === monthText
    );
}

function getPayrollByEmployeeAndMonth(employeeId, monthText) {
    return payrolls.find(
        (item) =>
            item.employeeId === employeeId &&
            item.month === monthText &&
            item.status !== "deleted"
    );
}

function calculateBasePayrollAmount(baseSalary, hourlyRate, workedHours) {
    if (Number(baseSalary) > 0) {
        return Number(baseSalary);
    }

    if (Number(hourlyRate) > 0) {
        return Number(workedHours) * Number(hourlyRate);
    }

    return 0;
}

function calculateNetSalaryFromDraft(draft) {
    const baseAmount = calculateBasePayrollAmount(
        draft.baseSalary,
        draft.hourlyRate,
        draft.workedHours
    );

    return baseAmount + Number(draft.bonus || 0) - Number(draft.penalty || 0);
}

function getNetSalary(item) {
    return Number(item.totalSalary || 0) + Number(item.bonus || 0) - Number(item.penalty || 0);
}

function buildFilteredData() {
    const keyword = (searchInput?.value || "").trim().toLowerCase();
    const selectedMonth = getSelectedMonthText();

    console.log("Đang lọc với Month/Year:", selectedMonth, "Trạng thái:", currentFilter);

    const filtered = payrolls.filter((item) => {
        if (item.status === "deleted") return false;

        const matchStatus = currentFilter === "all" || item.status === currentFilter;
        const matchMonth = !selectedMonth || item.month === selectedMonth;
        const matchKeyword =
            !keyword ||
            (item.id && item.id.toLowerCase().includes(keyword)) ||
            (item.employeeId && item.employeeId.toLowerCase().includes(keyword));

        return matchStatus && matchMonth && matchKeyword;
    });

    console.log("Kết quả lọc:", filtered.length, "bản ghi");
    return filtered;
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
            <th>Tháng</th>
            <th>Lương cơ bản</th>
            <th>Lương theo giờ</th>
            <th>Số giờ làm</th>
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
            <th>Tháng</th>
            <th>Lương cơ bản</th>
            <th>Lương theo giờ</th>
            <th>Số giờ làm</th>
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
            <span class="status-check">✔</span>
            <span class="status-cross">✕</span>
        </div>
    `;
}

function renderPendingStatus(payrollId) {
    return `
        <div class="status-symbols">
            <span class="status-check action-approve" title="Duyệt" onclick="handleApproveClick('${payrollId}')">✔</span>
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
            <td colspan="12" class="empty-pending-cell">
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
            <td colspan="${showAction ? 12 : 11}" class="empty-state">Không có dữ liệu phù hợp.</td>
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
        const attendance = getAttendanceRecord(item.employeeId, item.month);
        const baseSalary = attendance?.baseSalary || 0;
        const hourlyRate = attendance?.hourlyRate || 0;
        const workedHours = parseFloat(Number(attendance?.workedHours || 0).toFixed(2));

        if (showAction) {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.id}</td>
                    <td>${item.employeeId}</td>
                    <td>${item.month}</td>
                    <td>${formatCurrency(baseSalary)}</td>
                    <td>${formatCurrency(hourlyRate)}</td>
                    <td>${workedHours}</td>
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
                <td>${item.month}</td>
                <td>${formatCurrency(baseSalary)}</td>
                <td>${formatCurrency(hourlyRate)}</td>
                <td>${workedHours}</td>
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

    showMessagePopup.timer = setTimeout(() => {
        messagePopupBox.classList.remove("show");
    }, 2500);
}

function showErrorModal(message) {
    const modal = document.getElementById("errorModal");
    const msgEl = document.getElementById("errorModalMsg");
    if (modal && msgEl) {
        msgEl.textContent = message;
        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("open"), 10);
    }
}

function closeErrorModal() {
    const modal = document.getElementById("errorModal");
    if (modal) {
        modal.classList.remove("open");
        setTimeout(() => modal.style.display = "none", 300);
    }
}

// Chức năng xuất Excel thực tế
function exportToExcel(data, filename) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");
    XLSX.writeFile(wb, filename + ".xlsx");
}

// Chức năng xuất PDF thực tế hỗ trợ tiếng Việt
function exportToPDF(data, filename) {
    // Tạo một container tạm thời để dựng bảng HTML
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.fontFamily = 'Montserrat, sans-serif';
    
    container.innerHTML = `
        <h2 style="text-align: center; color: #4B2E1F; margin-bottom: 30px; font-size: 24px; font-weight: bold; text-transform: uppercase;">PHIẾU LƯƠNG NHÂN VIÊN - ĐI LẠC COFFEE</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
                <tr style="background-color: #4B2E1F; color: white;">
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Mã lương</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Mã NV</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Tháng</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Lương CB</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">L.Theo giờ</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Giờ làm</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Thưởng</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Phạt</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Lương thực lãnh</th>
                    <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Trạng thái</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(item => `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item["Mã lương"]}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item["Mã NV"]}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item["Tháng"]}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${parseInt(item["Lương cơ bản"]).toLocaleString("vi-VN")}đ</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${parseInt(item["Lương theo giờ"]).toLocaleString("vi-VN")}đ</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item["Giờ làm"]}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${parseInt(item["Thưởng"]).toLocaleString("vi-VN")}đ</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${parseInt(item["Phạt"]).toLocaleString("vi-VN")}đ</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold; color: #b71c1c;">${parseInt(item["Lương thực lãnh"]).toLocaleString("vi-VN")}đ</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item["Trạng thái"]}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 30px; text-align: right; font-style: italic; font-size: 13px;">
            <p>Ngày in phiếu: ${new Date().toLocaleDateString('vi-VN')}</p>
            <p style="margin-top: 40px; font-weight: bold; margin-right: 20px;">Người duyệt</p>
        </div>
    `;

    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     filename + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(container).save();
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
    let isValid = true;
    
    const bonusError = document.getElementById("bonusError");
    const penaltyError = document.getElementById("penaltyError");

    if (bonusValue === "" || Number.isNaN(bonus) || bonus < 0) {
        detailBonus.classList.add("input-error");
        if (bonusError) bonusError.style.display = "block";
        isValid = false;
    } else {
        detailBonus.classList.remove("input-error");
        if (bonusError) bonusError.style.display = "none";
    }

    if (penaltyValue === "" || Number.isNaN(penalty) || penalty < 0) {
        detailPenalty.classList.add("input-error");
        if (penaltyError) penaltyError.style.display = "block";
        isValid = false;
    } else {
        detailPenalty.classList.remove("input-error");
        if (penaltyError) penaltyError.style.display = "none";
    }

    if (!isValid) return { valid: false, message: "Vui lòng nhập số tiền hợp lệ (>= 0)." };

    return { valid: true, bonus, penalty };
}

function fillEditSalaryDetail(payroll) {
    editingPayrollId = payroll.id;

    const attendance = getAttendanceRecord(payroll.employeeId, payroll.month);

    currentSalaryDraft = {
        id: payroll.id,
        employeeId: payroll.employeeId,
        employeeName: payroll.employeeName,
        month: payroll.month,
        baseSalary: attendance?.baseSalary || 0,
        hourlyRate: attendance?.hourlyRate || 0,
        workedHours: parseFloat(Number(attendance?.workedHours || 0).toFixed(2)),
        bonus: payroll.bonus,
        penalty: payroll.penalty,
        isEditMode: true
    };

    salaryCodePreview.textContent = `Mã lương: ${currentSalaryDraft.id}`;
    salaryEmployeePreview.textContent = `Mã NV: ${currentSalaryDraft.employeeId}`;
    salaryMonthPreview.textContent = `Tháng: ${currentSalaryDraft.month}`;

    // Khóa các trường không được phép sửa trong chế độ Chỉnh sửa
    detailBaseSalary.readOnly = true;
    detailHourlyRate.readOnly = true;
    detailWorkedHours.readOnly = true;

    detailBaseSalary.value = currentSalaryDraft.baseSalary;
    detailHourlyRate.value = currentSalaryDraft.hourlyRate;
    detailWorkedHours.value = parseFloat(Number(currentSalaryDraft.workedHours).toFixed(2));
    detailBonus.value = currentSalaryDraft.bonus;
    detailPenalty.value = currentSalaryDraft.penalty;

    updateSalaryTotalPreview();
}

function updatePayroll(payrollId, payload) {
    const payroll = payrolls.find((item) => item.id === payrollId);
    if (!payroll) throw new Error("NOT_FOUND");

    payroll.totalSalary = payload.totalSalary;
    payroll.bonus = payload.bonus;
    payroll.penalty = payload.penalty;
    payroll.status = "pending";
}

function handleEditClick(payrollId) {
    const payroll = payrolls.find((item) => item.id === payrollId);

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

async function handleApproveClick(payrollId) {
    try {
        const success = await syncSalaryAction({
            action: 'UPDATE_STATUS',
            id: payrollId,
            status: 'approved'
        });

        if (success) {
            approvePayroll(payrollId);
            renderTable();
            showMessagePopup(`Đã duyệt bảng lương ${payrollId}`, "success");
        } else {
            showMessagePopup("Lỗi đồng bộ dữ liệu.<br>Vui lòng thử lại !!!", "error");
        }
    } catch {
        showMessagePopup("Kết nối dữ liệu.<br>Vui lòng thử lại !!!", "error");
    }
}

async function handleRejectClick(payrollId) {
    try {
        const success = await syncSalaryAction({
            action: 'UPDATE_STATUS',
            id: payrollId,
            status: 'rejected'
        });

        if (success) {
            rejectPayroll(payrollId);
            renderTable();
            showMessagePopup(`Đã từ chối bảng lương ${payrollId}`, "success");
        } else {
            showMessagePopup("Lỗi đồng bộ dữ liệu.<br>Vui lòng thử lại !!!", "error");
        }
    } catch {
        showMessagePopup("Kết nối dữ liệu.<br>Vui lòng thử lại !!!", "error");
    }
}

function getCalcEmployeesByMonth(monthText) {
    const data = attendanceData
        .filter((item) => item.month === monthText)
        .map((item) => {
            const existedPayroll = getPayrollByEmployeeAndMonth(item.employeeId, monthText);

            return {
                ...item,
                isCalculated: !!existedPayroll
            };
        });

    data.sort((a, b) => Number(a.isCalculated) - Number(b.isCalculated));
    return data;
}

function generatePayrollId() {
    const maxNum = payrolls.reduce((max, item) => {
        const num = parseInt(String(item.id).replace("BL", "").replace("ML", ""), 10);
        return Number.isNaN(num) ? max : Math.max(max, num);
    }, 0);

    return `BL${String(maxNum + 1).padStart(8, "0")}`;
}

function updateSalaryTotalPreview() {
    if (!currentSalaryDraft) return;

    currentSalaryDraft.bonus = Number(detailBonus.value) || 0;
    currentSalaryDraft.penalty = Number(detailPenalty.value) || 0;
    currentSalaryDraft.baseSalary = Number(detailBaseSalary.value) || 0;
    currentSalaryDraft.hourlyRate = Number(detailHourlyRate.value) || 0;
    currentSalaryDraft.workedHours = Number(detailWorkedHours.value) || 0;

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

    if (calcMonthSelect) calcMonthSelect.value = "";
    if (calcYearSelect) calcYearSelect.value = "";

    calcTableBody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center; padding:20px;">
                Vui lòng chọn tháng và năm, sau đó bấm Hiển thị
            </td>
        </tr>
    `;
    btnStartCalc.disabled = true;
}

function closeSalaryDetailPopup() {
    salaryDetailModal.classList.remove("show");
    currentSalaryDraft = null;
    editingPayrollId = null;
    detailBonus.classList.remove("input-error");
    detailPenalty.classList.remove("input-error");
    const bonusError = document.getElementById("bonusError");
    if (bonusError) bonusError.style.display = "none";
    const penaltyError = document.getElementById("penaltyError");
    if (penaltyError) penaltyError.style.display = "none";
}

function openSalaryDetailPopup() {
    salaryDetailModal.classList.add("show");
}

function renderCalcTable() {
    const selectedMonthText = getCalcMonthText();

    if (!selectedMonthText) {
        calcTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:20px;">
                    Vui lòng chọn tháng và năm để hiển thị danh sách nhân viên
                </td>
            </tr>
        `;
        btnStartCalc.disabled = true;
        return;
    }

    const data = getCalcEmployeesByMonth(selectedMonthText);

    if (data.length === 0) {
        calcTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="padding: 0; border-bottom: none; background: transparent;">
                    <div class="calc-empty-box">
                        <div class="calc-empty-icon">✕</div>
                        <div class="calc-empty-title">Không có dữ liệu nhân viên trong kỳ này</div>
                        <div class="calc-empty-subtitle">Vui lòng kiểm tra dữ liệu chấm công.</div>
                    </div>
                </td>
            </tr>
        `;
        btnStartCalc.disabled = true;
        selectedCalcEmployeeId = null;
        return;
    }

    const availableEmployees = data.filter((item) => !item.isCalculated);

    if (!selectedCalcEmployeeId || !availableEmployees.some((item) => item.employeeId === selectedCalcEmployeeId)) {
        selectedCalcEmployeeId = availableEmployees.length ? availableEmployees[0].employeeId : null;
    }

    btnStartCalc.disabled = availableEmployees.length === 0;

    calcTableBody.innerHTML = data.map((item) => `
        <tr class="calc-row ${selectedCalcEmployeeId === item.employeeId ? "selected" : ""} ${item.isCalculated ? "calculated-row" : ""}">
            <td>
                <input
                    type="radio"
                    name="calcEmployeeSelect"
                    value="${item.employeeId}"
                    ${selectedCalcEmployeeId === item.employeeId ? "checked" : ""}
                    ${item.isCalculated ? "disabled" : ""}
                >
            </td>
            <td>${item.employeeId}</td>
            <td>${parseFloat(Number(item.workedHours || 0).toFixed(2))}</td>
            <td>
                ${item.isCalculated
                    ? `<span class="calc-done-badge">Đã tính lương</span>`
                    : `<span class="calc-pending-badge">Chưa tính</span>`
                }
            </td>
        </tr>
    `).join("");

    const radios = calcTableBody.querySelectorAll('input[name="calcEmployeeSelect"]:not(:disabled)');
    radios.forEach((radio) => {
        radio.addEventListener("change", () => {
            selectedCalcEmployeeId = radio.value;
            renderCalcTable();
        });
    });
}

function fillSalaryDetail(data) {
    const salaryCode = generatePayrollId();
    const baseAmount = calculateBasePayrollAmount(
        data.baseSalary,
        data.hourlyRate,
        data.workedHours
    );

    currentSalaryDraft = {
        id: salaryCode,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        month: data.month,
        baseSalary: data.baseSalary,
        hourlyRate: data.hourlyRate,
        workedHours: parseFloat(Number(data.workedHours || 0).toFixed(2)),
        bonus: 0,
        penalty: 0,
        totalSalary: baseAmount,
        isEditMode: false
    };

    salaryCodePreview.textContent = `Mã lương: ${salaryCode}`;
    salaryEmployeePreview.textContent = `Mã NV: ${data.employeeId}`;
    salaryMonthPreview.textContent = `Tháng: ${data.month}`;

    // Mở khóa các trường cho phép sửa trong chế độ tính lương mới
    detailBaseSalary.readOnly = false;
    detailHourlyRate.readOnly = false;
    detailWorkedHours.readOnly = false;

    detailBaseSalary.value = data.baseSalary;
    detailHourlyRate.value = data.hourlyRate;
    detailWorkedHours.value = parseFloat(Number(data.workedHours).toFixed(2));
    detailBonus.value = 0;
    detailPenalty.value = 0;

    editingPayrollId = null;
    updateSalaryTotalPreview();
}

function createPayrollFromDraft() {
    if (!currentSalaryDraft) throw new Error("EMPTY_DRAFT");

    if (getPayrollByEmployeeAndMonth(currentSalaryDraft.employeeId, currentSalaryDraft.month)) {
        throw new Error("DUPLICATED_EMPLOYEE_MONTH");
    }

    const baseAmount = calculateBasePayrollAmount(
        currentSalaryDraft.baseSalary,
        currentSalaryDraft.hourlyRate,
        currentSalaryDraft.workedHours
    );

    payrolls.push({
        id: currentSalaryDraft.id,
        employeeId: currentSalaryDraft.employeeId,
        employeeName: currentSalaryDraft.employeeName,
        month: currentSalaryDraft.month,
        totalSalary: baseAmount,
        bonus: currentSalaryDraft.bonus,
        penalty: currentSalaryDraft.penalty,
        status: "pending"
    });
}

function getSelectedExportIds() {
    return [...document.querySelectorAll(".export-check:checked")].map((item) => item.dataset.id);
}

function renderExportTable() {
    if (!exportTableBody) return;

    const selectedMonth = getExportMonthText();
    console.log("Rendering export table for month:", selectedMonth);
    console.log("Total payrolls available:", payrolls.length);

    const approvedList = payrolls.filter((item) => {
        const matchStatus = item.status === "approved";
        const matchMonth = !selectedMonth || item.month === selectedMonth;
        return matchStatus && matchMonth;
    });

    console.log("Approved records found:", approvedList.length);

    if (checkAllExport) checkAllExport.checked = false;

    if (approvedList.length === 0) {
        exportTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="export-empty-cell">
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

    exportTableBody.innerHTML = approvedList.map((item) => {
        const attendance = getAttendanceRecord(item.employeeId, item.month);
        const baseSalary = attendance?.baseSalary || 0;
        const hourlyRate = attendance?.hourlyRate || 0;
        const workedHours = parseFloat(Number(attendance?.workedHours || 0).toFixed(2));
        
        return `
        <tr>
            <td style="text-align: center;"><input type="checkbox" class="export-check" data-id="${item.id}"></td>
            <td>${item.id}</td>
            <td>${item.employeeId}</td>
            <td>${item.month}</td>
            <td>${formatCurrency(baseSalary)}</td>
            <td>${formatCurrency(hourlyRate)}</td>
            <td>${workedHours}</td>
            <td>${formatCurrency(item.bonus)}</td>
            <td>${formatCurrency(item.penalty)}</td>
            <td style="font-weight: 600;">${formatCurrency(getNetSalary(item))}</td>
            <td class="status-approved">Đã duyệt</td>
        </tr>
        `
    }).join("");
}

btnConfirmDelete.addEventListener("click", async () => {
    if (!pendingDeleteId) return;

    try {
        const deletedId = pendingDeleteId;
        const success = await syncSalaryAction({
            action: 'DELETE',
            id: deletedId
        });

        if (success) {
            softDeletePayroll(deletedId);
            closeDeletePopup();
            renderTable();
            showMessagePopup(`Xóa bảng lương ${deletedId} thành công`, "success");
        } else {
            showMessagePopup("Lỗi đồng bộ dữ liệu.<br>Vui lòng thử lại !!!", "error");
        }
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
        saveFilters(); // Save when tab changes
        renderTable();
    });
});

btnSearch.addEventListener("click", renderTable);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") renderTable();
});

if (monthSelect) {
    monthSelect.addEventListener("change", () => {
        saveFilters();
        renderTable();
    });
}

if (yearSelect) {
    yearSelect.addEventListener("change", () => {
        saveFilters();
        renderTable();
    });
}

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

if (checkAllExport) {
    checkAllExport.addEventListener("change", () => {
        const checks = document.querySelectorAll(".export-check");
        checks.forEach((item) => {
            item.checked = checkAllExport.checked;
        });
    });
}

if (btnPrintSalary) {
    btnPrintSalary.addEventListener("click", () => {
        const selectedIds = getSelectedExportIds();

        if (!selectedIds.length) {
            showMessagePopup("Vui lòng chọn ít nhất một nhân viên để in phiếu lương", "error");
            return;
        }

        const itemsToPrint = payrolls.filter(p => selectedIds.includes(p.id));
        
        const printWindow = window.open('', '_blank');
        
        let htmlContent = `
            <html>
            <head>
                <title>In Phiếu Lương</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    .print-container { width: 100%; max-width: 800px; margin: 0 auto; }
                    h2 { text-align: center; color: #4B2E1F; font-size: 24px; text-transform: uppercase; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #4B2E1F; color: white; text-align: center !important; }
                    .num { text-align: right; }
                    .center { text-align: center; }
                    .footer { text-align: right; font-style: italic; margin-top: 30px; }
                    @media print { 
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <h2>PHIẾU LƯƠNG NHÂN VIÊN - ĐI LẠC COFFEE</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Mã lương</th>
                                <th>Mã NV</th>
                                <th>Tháng</th>
                                <th>Lương CB</th>
                                <th>L.Theo giờ</th>
                                <th>Giờ làm</th>
                                <th>Thưởng</th>
                                <th>Phạt</th>
                                <th>Lương thực lãnh</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        itemsToPrint.forEach(item => {
            const attendance = getAttendanceRecord(item.employeeId, item.month);
            htmlContent += `
                            <tr>
                                <td class="center">${item.id}</td>
                                <td class="center">${item.employeeId}</td>
                                <td class="center">${item.month}</td>
                                <td class="num">${formatCurrency(attendance?.baseSalary || 0)}đ</td>
                                <td class="num">${formatCurrency(attendance?.hourlyRate || 0)}đ</td>
                                <td class="center">${parseFloat(Number(attendance?.workedHours || 0).toFixed(2))}</td>
                                <td class="num">${formatCurrency(item.bonus || 0)}đ</td>
                                <td class="num">${formatCurrency(item.penalty || 0)}đ</td>
                                <td class="num" style="font-weight: bold;">${formatCurrency(getNetSalary(item))}đ</td>
                            </tr>
            `;
        });
        
        htmlContent += `
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                        <p style="margin-top: 50px; margin-right: 50px; font-weight: bold; font-style: normal;">Ban Quản Lý</p>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
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

if (btnShowCalcEmployees) {
    btnShowCalcEmployees.addEventListener("click", () => {
        selectedCalcEmployeeId = null;
        renderCalcTable();
    });
}

btnStartCalc.addEventListener("click", () => {
    const selectedMonthText = getCalcMonthText();

    if (!selectedMonthText) {
        showMessagePopup("Vui lòng chọn tháng và năm", "error");
        return;
    }

    const data = getCalcEmployeesByMonth(selectedMonthText).filter((item) => !item.isCalculated);

    if (!data.length) {
        renderCalcTable();
        showMessagePopup("Tất cả nhân viên trong kỳ này đã được tính lương", "error");
        return;
    }

    if (!selectedCalcEmployeeId) {
        selectedCalcEmployeeId = data[0].employeeId;
    }

    const employeeAttendance = data.find((item) => item.employeeId === selectedCalcEmployeeId);

    if (!employeeAttendance) {
        showMessagePopup("Vui lòng chọn nhân viên chưa tính lương", "error");
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

detailBonus.addEventListener("input", () => {
    validateSalaryInputs(detailBonus.value, detailPenalty.value);
    updateSalaryTotalPreview();
});
detailPenalty.addEventListener("input", () => {
    validateSalaryInputs(detailBonus.value, detailPenalty.value);
    updateSalaryTotalPreview();
});
detailBaseSalary.addEventListener("input", updateSalaryTotalPreview);
detailHourlyRate.addEventListener("input", updateSalaryTotalPreview);
detailWorkedHours.addEventListener("input", updateSalaryTotalPreview);

btnSaveSalary.addEventListener("click", async () => {
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
            const baseAmount = calculateBasePayrollAmount(
                currentSalaryDraft.baseSalary,
                currentSalaryDraft.hourlyRate,
                currentSalaryDraft.workedHours
            );

            const success = await syncSalaryAction({
                action: 'UPDATE',
                id: editingPayrollId,
                bonus: currentSalaryDraft.bonus,
                penalty: currentSalaryDraft.penalty,
                totalSalary: currentSalaryDraft.netSalary
            });

            if (success) {
                await fetchSalaryData(); // Refetch to ensure sync with DB
                closeSalaryDetailPopup();
                showMessagePopup("Chỉnh sửa bảng lương thành công", "success");
            } else {
                showMessagePopup("Lỗi đồng bộ dữ liệu.<br>Vui lòng thử lại !!!", "error");
            }
            return;
        }

        const successSync = await syncSalaryAction({
            action: 'CREATE',
            ...currentSalaryDraft,
            totalSalary: currentSalaryDraft.netSalary
        });

        if (successSync) {
            await fetchSalaryData(); // Refetch to ensure new record is persistent
            const successMonth = currentSalaryDraft.month;

            closeSalaryDetailPopup();

            if (salaryCalcModal.classList.contains("show")) {
                renderCalcTable();
            }

            showMessagePopup(`Tính lương tháng ${successMonth} thành công`, "success");
        } else {
            showMessagePopup("Lỗi đồng bộ dữ liệu.<br>Vui lòng thử lại !!!", "error");
        }
    } catch (error) {
        if (error.message === "DUPLICATED_EMPLOYEE_MONTH") {
            showMessagePopup("Bảng lương nhân viên này trong tháng đã tồn tại", "error");
            return;
        }

        showMessagePopup("Lỗi kết nối dữ liệu, vui lòng thử lại sau.", "error");
    }
});

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
        const selectedIds = getSelectedExportIds();

        if (!selectedExportFormat) {
            showMessagePopup("Vui lòng chọn định dạng trước khi xuất", "error");
            return;
        }

        if (!selectedIds.length) {
            showMessagePopup("Vui lòng chọn ít nhất một bảng lương để xuất", "error");
            return;
        }

        // Chuẩn bị dữ liệu để xuất
        const exportData = payrolls.filter(p => selectedIds.includes(p.id)).map(p => {
            const attendance = getAttendanceRecord(p.employeeId, p.month);
            return {
                "Mã lương": p.id,
                "Mã NV": p.employeeId,
                "Tháng": p.month,
                "Lương cơ bản": attendance?.baseSalary || 0,
                "Lương theo giờ": attendance?.hourlyRate || 0,
                "Giờ làm": parseFloat(Number(attendance?.workedHours || 0).toFixed(2)),
                "Thưởng": p.bonus || 0,
                "Phạt": p.penalty || 0,
                "Lương thực lãnh": getNetSalary(p),
                "Trạng thái": p.status === 'approved' ? 'Đã duyệt' : p.status
            };
        });

        const filename = "Bao_Cao_Luong_" + getExportMonthText().replace('/', '_');

        try {
            if (selectedExportFormat === "Excel") {
                exportToExcel(exportData, filename);
                showMessagePopup(`Đã xuất ${selectedIds.length} bản ghi ra file ${selectedExportFormat} thành công`, "success");
            } else if (selectedExportFormat === "PDF") {
                exportToPDF(exportData, filename);
                showMessagePopup(`Đang tạo file PDF cho ${selectedIds.length} bản ghi...`, "success");
            }
        } catch (err) {
            console.error(err);
            showErrorModal("Có lỗi xảy ra khi xuất file!!");
        }
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

window.handleDeleteClick = handleDeleteClick;
window.handleApproveClick = handleApproveClick;
window.handleRejectClick = handleRejectClick;
window.handleEditClick = handleEditClick;


function initCustomMonthPicker() {
    const picker = document.getElementById("exportMonthPicker");
    const display = document.getElementById("exportMonthDisplay");
    const dropdown = document.getElementById("exportMonthDropdown");
    const label = document.getElementById("exportMonthLabel");
    const hiddenInput = document.getElementById("exportMonth");
    const displayYear = document.getElementById("displayYear");
    const prevYear = document.getElementById("prevYear");
    const nextYear = document.getElementById("nextYear");
    const monthItems = document.querySelectorAll(".picker-month");
    const clearBtn = document.getElementById("clearPicker");
    const todayBtn = document.getElementById("todayPicker");

    if (!picker || !display || !dropdown) return;

    let currentYear = 2026;
    let selectedMonth = "04";

    function updateLabel() {
        label.textContent = `Tháng ${selectedMonth} ${currentYear}`;
        hiddenInput.value = `${currentYear}-${selectedMonth}`;
        renderExportTable();
    }

    display.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
        display.classList.toggle("active");
    });

    prevYear.addEventListener("click", (e) => {
        e.stopPropagation();
        currentYear--;
        displayYear.textContent = currentYear;
        updateLabel();
    });

    nextYear.addEventListener("click", (e) => {
        e.stopPropagation();
        currentYear++;
        displayYear.textContent = currentYear;
        updateLabel();
    });

    monthItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedMonth = item.dataset.month;
            monthItems.forEach((m) => m.classList.remove("active"));
            item.classList.add("active");
            updateLabel();
            dropdown.classList.remove("show");
            display.classList.remove("active");
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedMonth = "";
            hiddenInput.value = "";
            label.textContent = "Chọn tháng";
            monthItems.forEach((m) => m.classList.remove("active"));
            renderExportTable();
            dropdown.classList.remove("show");
            display.classList.remove("active");
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const now = new Date();
            currentYear = now.getFullYear();
            selectedMonth = String(now.getMonth() + 1).padStart(2, "0");
            displayYear.textContent = currentYear;

            monthItems.forEach((m) => {
                if (m.dataset.month === selectedMonth) m.classList.add("active");
                else m.classList.remove("active");
            });

            updateLabel();
            dropdown.classList.remove("show");
            display.classList.remove("active");
        });
    }

    document.addEventListener("click", () => {
        dropdown.classList.remove("show");
        display.classList.remove("active");
    });
}

initCustomMonthPicker();

renderTable();
