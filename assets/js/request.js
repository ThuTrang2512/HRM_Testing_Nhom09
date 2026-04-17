let requests = [];

let currentStatusFilter = "all";
let currentRequestId = null;

// Địa chỉ server Django của bạn
const BASE_URL = "http://127.0.0.1:8000";

const requestTableBody = document.getElementById("requestTableBody");
const requestTypeFilter = document.getElementById("requestTypeFilter");
const searchInput = document.getElementById("searchInput");
const btnSearch = document.getElementById("btnSearch");
const filterTabs = document.querySelectorAll(".filter-tab");

const requestDetailModal = document.getElementById("requestDetailModal");
const closeRequestDetailModal = document.getElementById("closeRequestDetailModal");
const btnCloseRequestDetail = document.getElementById("btnCloseRequestDetail");
const btnApproveRequest = document.getElementById("btnApproveRequest");
const btnRejectRequest = document.getElementById("btnRejectRequest");

const detailEmployeeName = document.getElementById("detailEmployeeName");
const detailEmployeeCodeText = document.getElementById("detailEmployeeCodeText");
const requestDetailFields = document.getElementById("requestDetailFields");

const rejectReasonModal = document.getElementById("rejectReasonModal");
const closeRejectReasonModal = document.getElementById("closeRejectReasonModal");
const btnCancelReject = document.getElementById("btnCancelReject");
const btnConfirmReject = document.getElementById("btnConfirmReject");
const rejectReasonInput = document.getElementById("rejectReasonInput");
const rejectReasonError = document.getElementById("rejectReasonError");

const messagePopupBox = document.getElementById("messagePopupBox");
const messagePopupText = document.getElementById("messagePopupText");
const messagePopupIcon = document.getElementById("messagePopupIcon");

requestDetailModal.classList.remove("show");
rejectReasonModal.classList.remove("show");

// ========== FETCH DATA FROM BACKEND ==========

async function fetchRequests() {
    try {
        // Gọi API với địa chỉ tuyệt đối để chạy được khi mở file trực tiếp
        const response = await fetch(`${BASE_URL}/requests/api/list/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        requests = await response.json();
        renderTable();
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu yêu cầu:", error);
        showMessagePopup("Lỗi kết nối tới Server Django. <br> Hãy đảm bảo server đã được chạy bằng lệnh:<br> <b>python manage.py runserver</b>", "error");
        renderEmptyState();
    }
}

// ========== FORMAT & FILTER ==========

function formatStatus(status) {
    if (status === "approved") {
        return `<span class="status-approved">Đã duyệt</span>`;
    }

    if (status === "rejected") {
        return `<span class="status-rejected">Đã từ chối</span>`;
    }

    return `<span class="status-pending">Chờ duyệt</span>`;
}

function buildFilteredRequests() {
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedType = requestTypeFilter.value;

    return requests.filter((item) => {
        const matchStatus =
            currentStatusFilter === "all" || item.status === currentStatusFilter;

        const matchType =
            selectedType === "all" || item.type === selectedType;

        const matchKeyword =
            !keyword ||
            item.id.toLowerCase().includes(keyword) ||
            item.employeeName.toLowerCase().includes(keyword) ||
            item.type.toLowerCase().includes(keyword) ||
            item.employeeId.toLowerCase().includes(keyword);

        return matchStatus && matchType && matchKeyword;
    });
}

// ========== RENDER ==========

function renderEmptyState() {
    requestTableBody.innerHTML = `
        <tr>
            <td colspan="9" class="empty-state">Không có yêu cầu phù hợp.</td>
        </tr>
    `;
}

function renderTable() {
    const data = buildFilteredRequests();

    if (data.length === 0) {
        renderEmptyState();
        return;
    }

    requestTableBody.innerHTML = data.map((item, index) => {
        // Hiển thị tên ca làm cho mọi loại yêu cầu
        const displayShift = item.shiftName ? item.shiftName : "-";

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${item.id}</td>
                <td>${item.employeeId}</td>
                <td>${item.employeeName}</td>
                <td>${item.type}</td>
                <td>${displayShift}</td>
                <td>${item.requestDate}</td>
                <td>${formatStatus(item.status)}</td>
                <td>
                    <button class="view-detail-btn" type="button" onclick="handleViewDetail('${item.id}')">
                        Xem chi tiết
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// ========== MESSAGE POPUP ==========

function showMessagePopup(message, type = "success") {
    messagePopupText.innerHTML = message;
    messagePopupBox.className = `message-popup-box ${type} show`;

    if (type === "success") {
        messagePopupIcon.className = "fa-solid fa-circle-check";
        messagePopupIcon.style.display = "inline-block";
    } else {
        messagePopupIcon.className = "fa-solid fa-circle-xmark";
        messagePopupIcon.style.display = "inline-block";
    }

    clearTimeout(showMessagePopup.timer);
    showMessagePopup.timer = setTimeout(() => {
        messagePopupBox.classList.remove("show");
    }, 2500);
}

// ========== DETAIL MODAL ==========

function openRequestDetailModal() {
    requestDetailModal.classList.add("show");
}

function closeRequestDetailPopup() {
    requestDetailModal.classList.remove("show");
    currentRequestId = null;
}

function openRejectReasonPopup() {
    rejectReasonModal.classList.add("show");
}

function closeRejectReasonPopup() {
    rejectReasonModal.classList.remove("show");
    rejectReasonInput.value = "";
    rejectReasonInput.classList.remove("input-error");
    rejectReasonError.classList.remove("show");
}

function createDetailRow(label, value, highlight = false) {
    return `
        <div class="request-detail-row ${highlight ? "highlight" : ""}">
            <div class="request-detail-label">${label}</div>
            <div class="request-detail-value">${value}</div>
        </div>
    `;
}

function formatReason(reason) {
    if (!reason) return "-";
    
    // Chuẩn hóa xuống dòng và khoảng trắng
    let text = reason.replace(/[\n\r]+/g, "\n").trim();
    let lines = text.split("\n").map(s => s.trim()).filter(s => s !== "");
    
    let segments = [];
    lines.forEach(line => {
        // Tìm các cụm [Từ chối vì: ...]
        const rejectMatches = line.match(/\[Từ chối vì: .*?\]/g) || [];
        let baseText = line;
        
        // Loại bỏ các cụm này khỏi dòng để lấy text gốc (ví dụ: "Bị ốm")
        rejectMatches.forEach(m => {
            baseText = baseText.replace(m, "").trim();
        });
        
        if (baseText) segments.push(baseText);
        rejectMatches.forEach(m => segments.push(m));
    });
    
    // Chỉ giữ lại các phần duy nhất
    const uniqueSegments = [];
    segments.forEach(s => {
        if (!uniqueSegments.includes(s)) {
            uniqueSegments.push(s);
        }
    });
    
    return uniqueSegments.join("<br>");
}

function fillLeaveRequestDetail(request) {
    requestDetailFields.innerHTML = `
        ${createDetailRow("Mã nhân viên:", request.employeeId)}
        ${createDetailRow("Loại yêu cầu:", "Nghỉ phép", true)}
        ${createDetailRow("Ca nghỉ:", request.shiftName || "N/A")}
        ${createDetailRow("Ngày bắt đầu:", request.startDate, true)}
        ${createDetailRow("Ngày kết thúc:", request.endDate)}
        ${createDetailRow("Lý do:", formatReason(request.reason), true)}
        ${createDetailRow("Ngày đăng ký:", request.requestDate)}
    `;
}

function fillShiftRequestDetail(request) {
    requestDetailFields.innerHTML = `
        ${createDetailRow("Mã nhân viên:", request.employeeId)}
        ${createDetailRow("Loại yêu cầu:", "Đăng ký ca", true)}
        ${createDetailRow("Ca làm:", request.shiftName || "N/A")}
        ${createDetailRow("Ngày làm:", request.workDate, true)}
        ${createDetailRow("Giờ bắt đầu:", request.startTime)}
        ${createDetailRow("Giờ kết thúc:", request.endTime, true)}
        ${createDetailRow("Ngày đăng ký:", request.requestDate)}
    `;
}

function fillRequestDetail(request) {
    currentRequestId = request.id;

    detailEmployeeName.textContent = request.employeeName;

    if (request.type === "Nghỉ phép") {
        fillLeaveRequestDetail(request);
    } else {
        fillShiftRequestDetail(request);
    }

    const isPending = request.status === "pending";

    const detailActions = document.querySelector(".request-detail-actions");

    if (isPending) {
        detailActions.style.display = "flex"; // Hiện footer
        btnApproveRequest.style.display = "inline-flex";
        btnRejectRequest.style.display = "inline-flex";
        btnCloseRequestDetail.style.display = "none";
        
        btnApproveRequest.disabled = false;
        btnRejectRequest.disabled = false;
        btnApproveRequest.classList.remove("disabled-btn");
        btnRejectRequest.classList.remove("disabled-btn");
    } else {
        detailActions.style.display = "none"; // Ẩn hoàn toàn footer nếu đã duyệt/từ chối
        
        btnApproveRequest.style.display = "none";
        btnRejectRequest.style.display = "none";
        btnCloseRequestDetail.style.display = "none";
        
        btnApproveRequest.disabled = true;
        btnRejectRequest.disabled = true;
        btnApproveRequest.classList.add("disabled-btn");
        btnRejectRequest.classList.add("disabled-btn");
    }
}

function handleViewDetail(requestId) {
    const request = requests.find((item) => item.id === requestId);

    if (!request) {
        showMessagePopup("Không tìm thấy yêu cầu.", "error");
        return;
    }

    fillRequestDetail(request);
    openRequestDetailModal();
}

// ========== APPROVE / REJECT (CALL BACKEND API) ==========

async function approveRequest(requestId) {
    const response = await fetch(`${BASE_URL}/requests/api/update-status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: requestId, status: "approved" })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi duyệt yêu cầu");
    }
    return await response.json();
}

async function rejectRequest(requestId, reason) {
    const response = await fetch(`${BASE_URL}/requests/api/update-status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: requestId, status: "rejected", rejectReason: reason })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi từ chối yêu cầu");
    }
    return await response.json();
}

// ========== EVENT LISTENERS ==========

btnApproveRequest.addEventListener("click", async () => {
    if (!currentRequestId || btnApproveRequest.disabled) return;

    try {
        const savedId = currentRequestId;
        await approveRequest(savedId);
        closeRequestDetailPopup();
        await fetchRequests();
        showMessagePopup("Duyệt yêu cầu thành công", "success");
    } catch (error) {
        console.error(error);
        showMessagePopup("Lỗi kết nối dữ liệu, vui lòng thử lại sau.", "error");
    }
});

btnRejectRequest.addEventListener("click", () => {
    if (!currentRequestId || btnRejectRequest.disabled) return;
    openRejectReasonPopup();
});

btnConfirmReject.addEventListener("click", async () => {
    const reason = rejectReasonInput.value.trim();

    if (!reason) {
        rejectReasonInput.classList.add("input-error");
        rejectReasonError.classList.add("show");
        return;
    }

    try {
        const savedId = currentRequestId;
        await rejectRequest(savedId, reason);
        closeRejectReasonPopup();
        closeRequestDetailPopup();
        await fetchRequests();
        showMessagePopup("Từ chối yêu cầu thành công", "success");
    } catch (error) {
        console.error(error);
        showMessagePopup("Lỗi kết nối dữ liệu, vui lòng thử lại sau.", "error");
    }
});

rejectReasonInput.addEventListener("input", () => {
    if (rejectReasonInput.value.trim()) {
        rejectReasonInput.classList.remove("input-error");
        rejectReasonError.classList.remove("show");
    }
});

closeRequestDetailModal.addEventListener("click", closeRequestDetailPopup);
btnCloseRequestDetail.addEventListener("click", closeRequestDetailPopup);

requestDetailModal.addEventListener("click", (event) => {
    if (event.target === requestDetailModal) {
        closeRequestDetailPopup();
    }
});

closeRejectReasonModal.addEventListener("click", closeRejectReasonPopup);
btnCancelReject.addEventListener("click", closeRejectReasonPopup);

requestDetailModal.addEventListener("click", (event) => {
    if (event.target === requestDetailModal) {
        closeRequestDetailPopup();
    }
});

filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        filterTabs.forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");
        currentStatusFilter = tab.dataset.status;
        renderTable();
    });
});

btnSearch.addEventListener("click", renderTable);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        renderTable();
    }
});

requestTypeFilter.addEventListener("change", renderTable);

window.handleViewDetail = handleViewDetail;

// ========== INIT: LOAD DATA FROM BACKEND ==========
fetchRequests();

/*drp header */
