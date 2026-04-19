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

let loginAttempts = 0; // Biến theo dõi số lần đăng nhập sai

// Xử lý sự kiện đăng nhập theo tài khoản chỉ định
function handleLogin(event) {
    event.preventDefault(); // Tránh tải lại trang mặc định của form
    console.log("Hàm handleLogin đã được kích hoạt!"); // Log kiểm tra

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    const errorText = document.getElementById('login-error');
    const hintText = document.getElementById('password-hint');

    // Reset error states
    usernameError.style.display = 'none';
    passwordError.style.display = 'none';
    errorText.style.display = 'none';
    usernameInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    let hasError = false;

    // Kiểm tra bỏ trống
    if (!usernameInput.value.trim()) {
        usernameError.style.display = 'block';
        usernameInput.classList.add('input-error');
        hasError = true;
    }
    if (!passwordInput.value.trim()) {
        passwordError.style.display = 'block';
        passwordInput.classList.add('input-error');
        hasError = true;
    }

    if (hasError) return;

    // Gửi yêu cầu đăng nhập tới Server
    fetch('/employee/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Đúng, chuyển tới trang chủ (dashboard.html)
            loginAttempts = 0; 
            window.location.href = '/dashboard';
        } else {
            // Tăng số lần nhập sai
            loginAttempts++;
            
            if (loginAttempts >= 5) {
                // Đạt 5 lần sai -> Khóa tài khoản
                showCustomAlert('error', 'Tài khoản đã bị tạm khóa.', 'Vui lòng thử lại sau!');
                errorText.style.display = 'none';
                usernameInput.disabled = true;
                passwordInput.disabled = true;
                const submitBtn = document.querySelector('.login-form button[type="submit"]');
                if(submitBtn) submitBtn.disabled = true;
            } else {
                // Sai, hiển thị thông báo lỗi nhỏ dưới ô input
                hintText.style.display = 'none'; 
                errorText.innerText = data.message || 'Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng nhập lại.';
                errorText.style.display = 'block'; 
                
                usernameInput.classList.add('input-error');
                passwordInput.classList.add('input-error');
            }
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        showCustomAlert('error', 'Lỗi hệ thống', 'Không thể kết nối tới máy chủ.');
    });
}

// =======================
// XỬ LÝ QUÊN MẬT KHẨU VÀ OTP
// =======================

// Hiển thị màn hình nhập Số điện thoại khi bấm Quên mật khẩu
function showPhoneModal(event) {
    if (event) event.preventDefault();
    
    // Không xóa số cũ để người dùng dễ sửa
    document.getElementById('phone-error').style.display = 'none';
    
    // Hiển thị modal
    document.getElementById('phone-modal').classList.remove('hidden-modal');
    
    setTimeout(() => {
        document.getElementById('phone-number').focus();
    }, 100);
}

// Xử lý khi nhấn Xác nhận số điện thoại
function submitPhone(event) {
    event.preventDefault();
    
    const phoneInput = document.getElementById('phone-number');
    const phoneError = document.getElementById('phone-error');
    const phoneNumber = phoneInput.value.trim();
    
    if (!phoneNumber) {
        phoneError.innerText = 'Số điện thoại không được để trống. Vui lòng nhập lại.';
        phoneError.style.display = 'block';
        return;
    }

    // Kiểm tra định dạng (10 số, bắt đầu bằng số 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
        phoneError.innerText = 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số bắt đầu bằng số 0.';
        phoneError.style.display = 'block';
        phoneInput.classList.add('input-error');
        return;
    }
    
    // Hàm ẩn 6 số giữa: Ví dụ 0912345678 -> 09******78
    const maskPhone = (phone) => {
        if(phone.length < 4) return phone; // Trường hợp số quá ngắn
        const start = phone.substring(0, 2);
        const end = phone.substring(phone.length - 2);
        return start + "******" + end;
    };
    
    // Cập nhật số điện thoại đã ẩn vào màn hình OTP
    document.getElementById('otp-phone-display').innerText = maskPhone(phoneNumber);
    
    // Đóng màn hình này và mở màn hình OTP
    document.getElementById('phone-modal').classList.add('hidden-modal');
    showOtpModal(null); // Truyền null vì event đã được xử lý
}

// Hiển thị màn hình OTP và giả lập gửi tin nhắn mã OTP
function showOtpModal(event) {
    if (event) event.preventDefault();

    for (let i = 1; i <= 6; i++) {
        let otpInput = document.getElementById('otp-' + i);
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
    document.getElementById('phone-modal').classList.add('hidden-modal');
    document.getElementById('otp-modal').classList.add('hidden-modal');
    document.getElementById('reset-modal').classList.add('hidden-modal');
}

// Quay lại màn hình nhập số điện thoại
function goBackToPhone() {
    closeModals();
    showPhoneModal();
}

// Quay lại màn hình nhập OTP
function goBackToOtp() {
    closeModals();
    showOtpModal();
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
    // Kiểm tra bỏ trống OTP
    let isComplete = true;
    for (let i = 1; i <= 6; i++) {
        if (!document.getElementById('otp-' + i).value) {
            isComplete = false;
            break;
        }
    }

    const otpError = document.getElementById('otp-error');
    if (!isComplete) {
        otpError.style.display = 'block';
        return;
    } else {
        otpError.style.display = 'none';
    }

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
        // Hiện chữ đỏ thay vì Popup
        const otpError = document.getElementById('otp-error');
        otpError.innerText = 'Mã xác thực không đúng. Vui lòng nhập lại!';
        otpError.style.display = 'block';

        // Tự động xóa các ô mật khẩu sai để nhập lại
        for (let i = 1; i <= 6; i++) document.getElementById('otp-' + i).value = '';
        document.getElementById('otp-1').focus();
    }
}

// Đặt lại mật khẩu mới
function submitNewPassword(event) {
    event.preventDefault();
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword').value;
    const newPassError = document.getElementById('newPassword-error');
    const confirmPassError = document.getElementById('confirmNewPassword-error');

    // Reset errors
    newPassError.style.display = 'none';
    confirmPassError.style.display = 'none';

    let hasError = false;
    if (!newPass.trim()) {
        newPassError.style.display = 'block';
        hasError = true;
    }
    if (!confirmPass.trim()) {
        confirmPassError.style.display = 'block';
        hasError = true;
    }

    if (hasError) return;

    // Kiểm tra sơ bộ: Mật khẩu ít nhất 8 ký tự, có chứa cả chữ và số
    const hasLetters = /[a-zA-Z]/.test(newPass);
    const hasNumbers = /[0-9]/.test(newPass);

    if (newPass.length < 8 || !hasLetters || !hasNumbers) {
        newPassError.innerText = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ và số.';
        newPassError.style.display = 'block';
        document.getElementById('newPassword').classList.add('input-error');
        return;
    }

    if (newPass !== confirmPass) {
        const confirmError = document.getElementById('confirmNewPassword-error');
        confirmError.innerText = 'Mật khẩu không khớp! Vui lòng kiểm tra lại.';
        confirmError.style.display = 'block';
        document.getElementById('confirmNewPassword').classList.add('input-error');
        return;
    }

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

// Lắng nghe sự kiện nhập liệu để ẩn thông báo lỗi ngay khi người dùng gõ
document.addEventListener('DOMContentLoaded', function() {
    // 1. Trang Login
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if(usernameInput) {
        usernameInput.addEventListener('input', () => {
            document.getElementById('username-error').style.display = 'none';
            usernameInput.classList.remove('input-error');
        });
    }
    if(passwordInput) {
        passwordInput.addEventListener('input', () => {
            document.getElementById('password-error').style.display = 'none';
            passwordInput.classList.remove('input-error');
        });
    }

    // 2. Trang OTP
    for (let i = 1; i <= 6; i++) {
        const otpInput = document.getElementById('otp-' + i);
        if(otpInput) {
            otpInput.addEventListener('input', () => {
                document.getElementById('otp-error').style.display = 'none';
            });
        }
    }

    // 3. Trang Đặt lại mật khẩu
    const newPass = document.getElementById('newPassword');
    const confirmPass = document.getElementById('confirmNewPassword');
    if(newPass) {
        newPass.addEventListener('input', () => {
            document.getElementById('newPassword-error').style.display = 'none';
        });
    }
    if(confirmPass) {
        confirmPass.addEventListener('input', () => {
            document.getElementById('confirmNewPassword-error').style.display = 'none';
        });
    }

    // 4. Trang nhập Số điện thoại
    const phoneInput = document.getElementById('phone-number');
    if(phoneInput) {
        phoneInput.addEventListener('input', () => {
            document.getElementById('phone-error').style.display = 'none';
        });
    }
});
