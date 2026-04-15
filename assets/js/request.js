const requests = [
    {
        id: "YC000001",
        employeeId: "NV001",
        employeeName: "Nguyễn Văn An",
        type: "Nghỉ phép",
        requestDate: "25/12/2026",
        status: "pending",
        startDate: "26/12/2026",
        endDate: "27/12/2026",
        reason: "Đi khám sức khỏe",
        rejectReason: ""
    },
    {
        id: "YC000002",
        employeeId: "NV002",
        employeeName: "Nguyễn Thanh Anh",
        type: "Nghỉ phép",
        requestDate: "26/02/2025",
        status: "pending",
        startDate: "27/02/2025",
        endDate: "28/02/2025",
        reason: "Giải quyết việc cá nhân",
        rejectReason: ""
    },
    {
        id: "YC000003",
        employeeId: "NV003",
        employeeName: "Nguyễn Văn Anh",
        type: "Nghỉ phép",
        requestDate: "26/03/2025",
        status: "pending",
        startDate: "27/03/2025",
        endDate: "27/03/2025",
        reason: "Nghỉ ốm",
        rejectReason: ""
    },
    {
        id: "YC000004",
        employeeId: "NV004",
        employeeName: "Nguyễn Thị Anh",
        type: "Đăng ký ca",
        requestDate: "25/12/2026",
        status: "approved",
        workDate: "08/02/2026",
        startTime: "08:00",
        endTime: "17:00",
        rejectReason: ""
    },
    {
        id: "YC000005",
        employeeId: "NV005",
        employeeName: "Nguyễn Văn Ánh",
        type: "Nghỉ phép",
        requestDate: "26/05/2025",
        status: "approved",
        startDate: "27/05/2025",
        endDate: "28/05/2025",
        reason: "Việc gia đình",
        rejectReason: ""
    },
    {
        id: "YC000006",
        employeeId: "NV006",
        employeeName: "Trần Minh Quân",
        type: "Đăng ký ca",
        requestDate: "02/06/2025",
        status: "pending",
        workDate: "10/06/2025",
        startTime: "13:00",
        endTime: "21:00",
        rejectReason: ""
    },
    {
        id: "YC000007",
        employeeId: "NV007",
        employeeName: "Lê Thị Hồng",
        type: "Nghỉ phép",
        requestDate: "05/06/2025",
        status: "pending",
        startDate: "06/06/2025",
        endDate: "06/06/2025",
        reason: "Lý do sức khỏe",
        rejectReason: ""
    }
];

let currentStatusFilter = "all";
let currentRequestId = null;

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

function renderEmptyState() {
    requestTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">Không có dữ liệu phù hợp.</td>
        </tr>
    `;
}

function renderTable() {
    const data = buildFilteredRequests();

    if (data.length === 0) {
        renderEmptyState();
        return;
    }

    requestTableBody.innerHTML = data.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.id}</td>
            <td>${item.employeeName}</td>
            <td>${item.type}</td>
            <td>${item.requestDate}</td>
            <td>${formatStatus(item.status)}</td>
            <td>
                <button class="view-detail-btn" type="button" onclick="handleViewDetail('${item.id}')">
                    Xem chi tiết
                </button>
            </td>
        </tr>
    `).join("");
}

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

function fillLeaveRequestDetail(request) {
    requestDetailFields.innerHTML = `
        ${createDetailRow("Mã nhân viên:", request.employeeId)}
        ${createDetailRow("Loại yêu cầu:", request.type, true)}
        ${createDetailRow("Ngày bắt đầu:", request.startDate)}
        ${createDetailRow("Ngày kết thúc:", request.endDate, true)}
        ${createDetailRow("Lý do:", request.reason)}
        ${createDetailRow("Ngày đăng ký:", request.requestDate, true)}
    `;
}

function fillShiftRequestDetail(request) {
    requestDetailFields.innerHTML = `
        ${createDetailRow("Mã nhân viên:", request.employeeId)}
        ${createDetailRow("Loại yêu cầu:", "Ca làm việc", true)}
        ${createDetailRow("Ngày làm:", request.workDate)}
        ${createDetailRow("Giờ bắt đầu:", request.startTime, true)}
        ${createDetailRow("Giờ kết thúc:", request.endTime)}
        ${createDetailRow("Ngày đăng ký:", request.requestDate, true)}
    `;
}

function fillRequestDetail(request) {
    currentRequestId = request.id;

    detailEmployeeName.textContent = request.employeeName;
    detailEmployeeCodeText.textContent = `Mã nhân viên - ${request.employeeId}`;

    if (request.type === "Nghỉ phép") {
        fillLeaveRequestDetail(request);
    } else {
        fillShiftRequestDetail(request);
    }

    const isPending = request.status === "pending";

    btnApproveRequest.style.display = "inline-flex";
    btnRejectRequest.style.display = "inline-flex";
    btnCloseRequestDetail.style.display = "none";

    if (isPending) {
        btnApproveRequest.disabled = false;
        btnRejectRequest.disabled = false;

        btnApproveRequest.classList.remove("disabled-btn");
        btnRejectRequest.classList.remove("disabled-btn");
    } else {
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

function approveRequest(requestId) {
    const request = requests.find((item) => item.id === requestId);

    if (!request) {
        throw new Error("NOT_FOUND");
    }

    request.status = "approved";
    request.rejectReason = "";
}

function rejectRequest(requestId, reason) {
    const request = requests.find((item) => item.id === requestId);

    if (!request) {
        throw new Error("NOT_FOUND");
    }

    request.status = "rejected";
    request.rejectReason = reason;
}

btnApproveRequest.addEventListener("click", () => {
    if (!currentRequestId || btnApproveRequest.disabled) return;

    try {
        approveRequest(currentRequestId);
        closeRequestDetailPopup();
        renderTable();
        showMessagePopup(`Duyệt yêu cầu ${currentRequestId} thành công`, "success");
    } catch (error) {
        showMessagePopup("Lỗi kết nối dữ liệu, vui lòng thử lại sau.", "error");
    }
});

btnRejectRequest.addEventListener("click", () => {
    if (!currentRequestId || btnRejectRequest.disabled) return;
    openRejectReasonPopup();
});

btnConfirmReject.addEventListener("click", () => {
    const reason = rejectReasonInput.value.trim();

    if (!reason) {
        rejectReasonInput.classList.add("input-error");
        rejectReasonError.classList.add("show");
        return;
    }

    try {
        rejectRequest(currentRequestId, reason);
        closeRejectReasonPopup();
        closeRequestDetailPopup();
        renderTable();
        showMessagePopup(`Đã từ chối yêu cầu ${currentRequestId}`, "success");
    } catch (error) {
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

rejectReasonModal.addEventListener("click", (event) => {
    if (event.target === rejectReasonModal) {
        closeRejectReasonPopup();
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

renderTable();

/*drp header */
