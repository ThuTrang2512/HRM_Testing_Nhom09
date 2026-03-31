document.addEventListener('DOMContentLoaded', () => {
    const detailContractId = document.getElementById('detailContractId');
    const detailContractType = document.getElementById('detailContractType');
    const detailContractStatus = document.getElementById('detailContractStatus');
    const detailStartDate = document.getElementById('detailStartDate');
    const detailEndDate = document.getElementById('detailEndDate');
    const detailSalary = document.getElementById('detailSalary');
    const detailEmployeeId = document.getElementById('detailEmployeeId');
    const detailEmployeeName = document.getElementById('detailEmployeeName');
    const detailEmployeeRole = document.getElementById('detailEmployeeRole');
    const detailNote = document.getElementById('detailNote');

    const contractId = sessionStorage.getItem('viewingContractId');
    const contracts = JSON.parse(localStorage.getItem('contracts')) || [];
    const contract = contracts.find(c => c.id === contractId);

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

    const sampleContract = {
        id: 'HD00001',
        contractType: 'Part-time',
        status: 'Hiệu lực',
        startDate: '25/12/2025',
        endDate: '25/12/2026',
        salary: '2.000.000',
        employeeId: 'NV00001',
        employeeName: 'Nguyễn Văn An',
        employeeRole: 'Pha chế',
        note: 'Ký hợp đồng 1 năm.'
    };

    const contractToShow = contract || sampleContract;

    detailContractId.textContent = normalizeDetailValue(contractToShow.id, sampleContract.id);
    detailContractType.textContent = normalizeContractType(normalizeDetailValue(contractToShow.contractType, sampleContract.contractType));
    detailContractStatus.textContent = normalizeDetailValue(contractToShow.status, sampleContract.status);
    detailStartDate.textContent = normalizeDetailValue(contractToShow.startDate, sampleContract.startDate);
    detailEndDate.textContent = normalizeDetailValue(contractToShow.endDate, sampleContract.endDate);
    detailSalary.textContent = formatSalary(contractToShow.salary, sampleContract.salary);
    detailEmployeeId.textContent = normalizeDetailValue(contractToShow.employeeId, sampleContract.employeeId);
    detailEmployeeName.textContent = normalizeDetailValue(contractToShow.employeeName, sampleContract.employeeName);
    detailEmployeeRole.textContent = normalizeDetailValue(contractToShow.employeeRole, sampleContract.employeeRole);
    detailNote.textContent = normalizeDetailValue(contractToShow.note, sampleContract.note);
});
