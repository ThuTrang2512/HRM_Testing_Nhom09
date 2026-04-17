
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
