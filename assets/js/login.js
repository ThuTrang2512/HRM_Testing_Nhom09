// Ẩn màn hình kết hợp hiệu ứng chuyển cảnh
function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    // Thêm class fade-out để kích hoạt animation ẩn dần bên css
    splash.classList.add('fade-out');

    setTimeout(() => {
        // Sau khi ẩn hoàn thành ẩn khỏi layout
        splash.style.display = 'none';

        // Hiện màn hình login
        const loginContainer = document.getElementById('login-container');
        loginContainer.classList.remove('hidden');

        // Timeout nhỏ để trình duyệt cập nhật việc remove hidden (xảy ra trong nội bộ)
        setTimeout(() => {
            loginContainer.classList.add('show');
            // Mở cuộn trang nếu màn hình nhỏ (do màn hình kia để overflow hidden)
            document.body.style.overflow = 'auto';
        }, 50);

    }, 500); // 0.5s bằng thời gian transition của css
}

// Bật tắt hiển thị mật khẩu bằng con mắt
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('togglePassword');

    // Đổi qua đổi lại type và icon (Sử dụng biểu tượng của Font Awesome)
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Biến lưu trữ thông tin đăng nhập tiêu chuẩn (có thể thay đổi khi đổi mật khẩu)
let requiredUsername = "Nguyễn Thị Thu Trang";
let requiredPassword = "NTTT24042005@h";
let loginAttempts = 0; // Biến theo dõi số lần đăng nhập sai

// Xử lý sự kiện đăng nhập theo tài khoản chỉ định
function handleLogin(event) {
    event.preventDefault(); // Tránh tải lại trang mặc định của form

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorText = document.getElementById('login-error');
    const hintText = document.getElementById('password-hint');

    // Nếu đã bị khóa, không cho xử lý tiếp
    if (loginAttempts >= 5) {
        showCustomAlert('error', 'Tài khoản đã bị tạm khóa.', 'Vui lòng thử lại sau !!!');
        return;
    }

    // Kiểm tra thông tin
    if (usernameInput.value === requiredUsername && passwordInput.value === requiredPassword) {
        // Đúng, chuyển tới trang chủ (dashboard.html)
        loginAttempts = 0; // Đặt lại số lần thử
        window.location.href = 'dashboard.html';
    } else {
        // Tăng số lần nhập sai
        loginAttempts++;
        
        if (loginAttempts >= 5) {
            // Đạt 5 lần sai -> Khóa tài khoản
            showCustomAlert('error', 'Tài khoản đã bị tạm khóa.', 'Vui lòng thử lại sau !!!');
            
            // Xoá dòng text đỏ nhỏ
            errorText.style.display = 'none';
            // Khóa các ô form nhập liệu
            usernameInput.disabled = true;
            passwordInput.disabled = true;
            const submitBtn = document.querySelector('.login-form button[type="submit"]');
            if(submitBtn) submitBtn.disabled = true;
            
        } else {
            // Sai, hiển thị thông báo lỗi nhỏ dưới ô input
            hintText.style.display = 'none'; // ẩn mẹo mật khẩu
            errorText.style.display = 'block'; // hiện lỗi hiện chữ đỏ
            
            // Thêm viền đỏ báo sai cho các ô input
            usernameInput.classList.add('input-error');
            passwordInput.classList.add('input-error');
        }
    }
}

// =======================
// XỬ LÝ QUÊN MẬT KHẨU VÀ OTP
// =======================

// Hiển thị màn hình OTP và giả lập gửi tin nhắn mã OTP
function showOtpModal(event) {
    if (event) event.preventDefault();

    // Xóa nội dung cũ trong các ô OTP và mở khóa các ô nếu có
    for (let i = 1; i <= 6; i++) {
        let otpInput = document.getElementById('otp-' + i);
        otpInput.value = '';
        otpInput.disabled = false;
    }
    document.querySelector('#otpForm button').disabled = false;
    otpAttempts = 0; // Đặt lại số lần thử

    // Hiển thị modal
    document.getElementById('otp-modal').classList.remove('hidden-modal');

    // Tự động focus vô ô đầu tiên
    setTimeout(() => {
        document.getElementById('otp-1').focus();
    }, 100);

    // Giả lập hệ thống nhắn tin mã OTP sau 1.5 giây
    setTimeout(() => {
        alert("Mã OTP xác thực của bạn là: 123456\nVui lòng không chia sẻ mã này.");
    }, 1500);
}

// Đóng toàn bộ các modal
function closeModals() {
    document.getElementById('otp-modal').classList.add('hidden-modal');
    document.getElementById('reset-modal').classList.add('hidden-modal');
}

// Xử lý khi nhấn nhập số ở màn hình OTP
function moveToNextOTP(element, event, index) {
    const value = element.value;

    // Chặn nhập phím không phải là số (ngoại trừ các phím điều khiển)
    if (value && isNaN(value)) {
        element.value = '';
        return;
    }

    // Tự động chuyển qua ô nhập kế tiếp
    if (value.length === 1 && index < 6) {
        document.getElementById('otp-' + (index + 1)).focus();
    }

    // Cho phép xóa lùi (Backspace)
    if (event.key === 'Backspace' && value.length === 0 && index > 1) {
        document.getElementById('otp-' + (index - 1)).focus();
    }
}

// Xử lý dán mã OTP siêu tốc
function handleOtpPaste(event) {
    const pastedData = event.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && !isNaN(pastedData)) {
        event.preventDefault();
        for (let i = 0; i < 6; i++) {
            document.getElementById('otp-' + (i + 1)).value = pastedData[i];
        }
        document.getElementById('otp-6').focus();
    }
}

// Gửi lại mã OTP
function resendOtp(event) {
    event.preventDefault();
    alert("Mã OTP xác thực mới của bạn là: 123456");
}

// Quản lý số lần nhận mã sai
let otpAttempts = 0;

// Hàm tạo hiển thị thông báo thay cho khung cảnh báo mặc định của trình duyệt
function showCustomAlert(type, title, subtitle) {
    const container = document.getElementById('custom-alert-container');
    const alertBox = document.createElement('div');
    alertBox.className = `custom-alert alert-${type}`;

    // Gán logo ! hay ✓ tùy theo loại thông báo lỗi / thành công
    let iconHtml = type === 'error' ? '<i class="fa-solid fa-exclamation"></i>' : '<i class="fa-solid fa-check"></i>';

    let subtitleHtml = subtitle ? `<div class="alert-subtitle">${subtitle}</div>` : '';

    alertBox.innerHTML = `
        <div class="alert-icon">${iconHtml}</div>
        <div class="alert-title">${title}</div>
        ${subtitleHtml}
    `;

    container.appendChild(alertBox);

    // Cho hiện với hiệu ứng trồi lên sau 10ms
    setTimeout(() => {
        alertBox.classList.add('show');
    }, 10);

    // Trừ khi bị cấm hẳn thì tắt popup OTP đi luôn
    if (title === "Tài khoản đã bị tạm khóa.") {
        closeModals();
    }

    // Tự động tắt popup sau 3 giây 
    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => alertBox.remove(), 300); // Đợi kết thúc hiệu ứng ẩn
    }, 2500);
}

// Nhấn xác nhận OTP
function submitOtp(event) {
    event.preventDefault();

    // Gộp mã từ các ô input
    let enteredOtp = '';
    for (let i = 1; i <= 6; i++) {
        enteredOtp += document.getElementById('otp-' + i).value;
    }

    // Giả sử mã đúng là 123456
    if (enteredOtp === '123456') {
        otpAttempts = 0; // Đặt lại bộ đếm khi đăng nhập đúng
        document.getElementById('otp-modal').classList.add('hidden-modal');
        document.getElementById('reset-modal').classList.remove('hidden-modal');

        // Cài đặt lại nội dung các ô mật khẩu
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';

        setTimeout(() => {
            document.getElementById('newPassword').focus();
        }, 100);
    } else {
        // Tăng số lần thử
        otpAttempts++;
        if (otpAttempts >= 5) {
            // Hiển thị popup tạm khóa
            showCustomAlert('error', 'Tài khoản đã bị tạm khóa.', 'Vui lòng thử lại sau !!!');

            // Xoá và chặn quyền gõ
            for (let i = 1; i <= 6; i++) document.getElementById('otp-' + i).disabled = true;
            document.querySelector('#otpForm button').disabled = true;
        } else {
            // Popup thông thường mã sai
            showCustomAlert('error', 'Mã xác thực không đúng.', 'Vui lòng nhập lại !!!');
            // Tự động xóa các ô mật khẩu sai để nhập lại
            for (let i = 1; i <= 6; i++) document.getElementById('otp-' + i).value = '';
            document.getElementById('otp-1').focus();
        }
    }
}

// Đặt lại mật khẩu mới
function submitNewPassword(event) {
    event.preventDefault();

    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword').value;

    // Kiểm tra sơ bộ: Mật khẩu ít nhất 8 ký tự, có chứa cả chữ và số
    const hasLetters = /[a-zA-Z]/.test(newPass);
    const hasNumbers = /[0-9]/.test(newPass);

    if (newPass.length < 8 || !hasLetters || !hasNumbers) {
        showCustomAlert('error', 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số.', '');
        return;
    }

    if (newPass !== confirmPass) {
        showCustomAlert('error', 'Mật khẩu nhập lại không khớp.', '');
        return;
    }

    // Cập nhật mật khẩu hệ thống bằng mật khẩu mới
    requiredPassword = newPass;

    // Hoàn tất đặt lại mật khẩu
    closeModals();
    showCustomAlert('success', 'Tạo mật khẩu thành công', 'Mật khẩu mới đã được cập nhật.');

    // (Tuỳ chọn) tự động điền mật khẩu mới vào form đăng nhập để trải nghiệm dễ dàng hơn
    document.getElementById('password').value = newPass;
    document.getElementById('password').focus();

    // Tắt thông báo lỗi cũ nếu có
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorText = document.getElementById('login-error');
    const hintText = document.getElementById('password-hint');

    usernameInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
    errorText.style.display = 'none';
    hintText.style.display = 'block';
}
