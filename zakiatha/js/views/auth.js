// js/views/auth.js
// Authentication View - Handles Login & Registration screens and logic

const loginView = {
    render: function(container) {
        container.innerHTML = `
            <div class="auth-layout">
                <div class="card-glass auth-card">
                    <div class="auth-header">
                        <h2>Masuk Akun</h2>
                        <p>Akses akun gamer Anda untuk transaksi dan kumpulkan poin.</p>
                    </div>

                    <div id="login-error-message" class="badge status-failed" style="display: none; width: 100%; padding: 10px; margin-bottom: 20px; font-size: 13px; text-transform: none; border-radius: var(--radius-sm);">
                        <!-- Error message goes here -->
                    </div>

                    <form id="login-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="login-identifier">Username atau Gmail</label>
                            <input type="text" id="login-identifier" class="form-input" placeholder="Masukkan Username / Gmail terdaftar" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" class="form-input" placeholder="Masukkan Password Anda" required>
                        </div>

                        <button type="submit" class="btn-grad" style="margin-top: 12px; padding: 14px;">
                            <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>
                            <span>Masuk Sekarang</span>
                        </button>
                    </form>

                    <div class="auth-footer-link">
                        Belum punya akun? <a href="#register">Daftar Akun Baru</a>
                    </div>
                </div>
            </div>
        `;

        const form = document.getElementById('login-form');
        const errorDiv = document.getElementById('login-error-message');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';

            const identifier = document.getElementById('login-identifier').value.trim();
            const password = document.getElementById('login-password').value;

            const res = window.dbService.loginUser(identifier, password);
            if (res.success) {
                // Set session
                localStorage.setItem('topup_store_session', JSON.stringify({
                    username: res.user.username,
                    role: res.user.role
                }));
                // Dispatch event to refresh nav header
                window.dispatchEvent(new CustomEvent('sessionUpdated'));
                // Redirect
                window.location.hash = res.user.role === 'admin' ? '#admin' : '#home';
            } else {
                errorDiv.textContent = res.message;
                errorDiv.style.display = 'block';
            }
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};

const registerView = {
    render: function(container) {
        container.innerHTML = `
            <div class="auth-layout">
                <div class="card-glass auth-card">
                    <div class="auth-header">
                        <h2>Daftar Akun</h2>
                        <p>Daftar sekarang untuk mendapatkan keuntungan cashback poin 5%.</p>
                    </div>

                    <div id="register-error-message" class="badge status-failed" style="display: none; width: 100%; padding: 10px; margin-bottom: 20px; font-size: 13px; text-transform: none; border-radius: var(--radius-sm);">
                        <!-- Error message goes here -->
                    </div>

                    <form id="register-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="reg-phone">Nomor HP</label>
                            <input type="tel" id="reg-phone" class="form-input" placeholder="Masukkan nomor HP Anda (contoh: 0812...)" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="reg-gmail">Akun Gmail</label>
                            <input type="email" id="reg-gmail" class="form-input" placeholder="Masukkan alamat Gmail Anda" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="reg-username">Username Registrasi</label>
                            <input type="text" id="reg-username" class="form-input" placeholder="Masukkan Username pilihan Anda" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="reg-password">Password</label>
                            <input type="password" id="reg-password" class="form-input" placeholder="Buat Password baru" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="reg-password-confirm-1">Masukkan Ulang Password (Verifikasi 1)</label>
                            <input type="password" id="reg-password-confirm-1" class="form-input" placeholder="Ulangi password ke-1" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="reg-password-confirm-2">Masukkan Ulang Password (Verifikasi 2)</label>
                            <input type="password" id="reg-password-confirm-2" class="form-input" placeholder="Ulangi password ke-2" required>
                        </div>

                        <button type="submit" class="btn-grad" style="margin-top: 12px; padding: 14px;">
                            <i data-lucide="user-plus" style="width: 18px; height: 18px;"></i>
                            <span>Daftar Akun</span>
                        </button>
                    </form>

                    <div class="auth-footer-link">
                        Sudah memiliki akun? <a href="#login">Login di Sini</a>
                    </div>
                </div>
            </div>
        `;

        const form = document.getElementById('register-form');
        const errorDiv = document.getElementById('register-error-message');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            errorDiv.style.display = 'none';

            const phone = document.getElementById('reg-phone').value.trim();
            const gmail = document.getElementById('reg-gmail').value.trim();
            const username = document.getElementById('reg-username').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirm1 = document.getElementById('reg-password-confirm-1').value;
            const confirm2 = document.getElementById('reg-password-confirm-2').value;

            // Validation checks
            if (password !== confirm1 || password !== confirm2) {
                errorDiv.textContent = 'Password dan Konfirmasi Ulang (Verifikasi 1 & 2) harus sama!';
                errorDiv.style.display = 'block';
                return;
            }

            if (phone.length < 9) {
                errorDiv.textContent = 'Nomor HP tidak valid!';
                errorDiv.style.display = 'block';
                return;
            }

            const res = window.dbService.registerUser({
                phone,
                gmail,
                username,
                password
            });

            if (res.success) {
                // Auto login after registration
                localStorage.setItem('topup_store_session', JSON.stringify({
                    username: res.user.username,
                    role: res.user.role
                }));
                // Dispatch event to refresh nav header
                window.dispatchEvent(new CustomEvent('sessionUpdated'));
                // Redirect
                window.location.hash = '#home';
            } else {
                errorDiv.textContent = res.message;
                errorDiv.style.display = 'block';
            }
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};

window.loginView = loginView;
window.registerView = registerView;
