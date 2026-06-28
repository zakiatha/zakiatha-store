// js/views/settings.js
// User Settings View - Profile, Security, Transaction History, Points

const settingsView = {
    render: function(container) {
        const session = window.getSession();
        if (!session) {
            window.location.hash = '#login';
            return;
        }

        const user = window.dbService.getUserByUsername(session.username);
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        // Get user transactions
        const allTx = window.dbService.getTransactions();
        const userTx = allTx.filter(t => t.username && t.username.toLowerCase() === session.username.toLowerCase());
        const successTx = userTx.filter(t => t.status === 'SUCCESS');
        const totalSpent = successTx.reduce((sum, t) => sum + t.totalAmount, 0);

        container.innerHTML = `
            <div class="settings-layout">
                <!-- Breadcrumb -->
                <div style="display: flex; gap: 8px; font-size: 14px; color: var(--text-secondary);">
                    <a href="#home" style="hover: color(var(--primary));">Home</a>
                    <span>/</span>
                    <span style="color: var(--text-primary); font-weight:600;">Pengaturan Akun</span>
                </div>

                <!-- Header -->
                <div class="settings-header">
                    <i data-lucide="settings" style="width: 32px; height: 32px; color: var(--primary);"></i>
                    <h1 class="gradient-text">Pengaturan Akun</h1>
                </div>

                <!-- Profile Section -->
                <div class="card-glass settings-section">
                    <div class="settings-section-title">
                        <i data-lucide="user" style="width: 20px; height: 20px; color: var(--primary);"></i>
                        Profil Saya
                    </div>

                    <div class="settings-info-row">
                        <span class="settings-info-label">Username</span>
                        <span class="settings-info-value">${user.username}</span>
                    </div>
                    <div class="settings-info-row">
                        <span class="settings-info-label">Email</span>
                        <span class="settings-info-value">${user.gmail}</span>
                    </div>
                    <div class="settings-info-row">
                        <span class="settings-info-label">No. Handphone</span>
                        <span class="settings-info-value">${user.phone || '-'}</span>
                    </div>
                    <div class="settings-info-row">
                        <span class="settings-info-label">Role</span>
                        <span class="settings-info-value">
                            <span class="badge ${user.role === 'admin' ? 'popular' : 'status-success'}" style="font-size: 10px;">${user.role.toUpperCase()}</span>
                        </span>
                    </div>

                    <div style="margin-top: 20px;">
                        <button class="btn-grad" style="width: 100%; padding: 12px;" id="btn-edit-profile">
                            <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
                            <span>Edit Profil</span>
                        </button>
                    </div>
                </div>

                <!-- Edit Profile Form (hidden by default) -->
                <div class="card-glass settings-section" id="edit-profile-section" style="display: none;">
                    <div class="settings-section-title">
                        <i data-lucide="edit" style="width: 20px; height: 20px; color: var(--secondary);"></i>
                        Edit Profil
                    </div>
                    <div id="edit-profile-message" style="display: none; margin-bottom: 16px; padding: 10px; border-radius: var(--radius-sm);"></div>
                    <form id="edit-profile-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="edit-username">Username</label>
                            <input type="text" id="edit-username" class="form-input" value="${user.username}" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="edit-email">Email</label>
                            <input type="email" id="edit-email" class="form-input" value="${user.gmail}" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="edit-phone">No. Handphone</label>
                            <input type="text" id="edit-phone" class="form-input" value="${user.phone || ''}" placeholder="Contoh: 081234567890">
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button type="button" class="btn-action-small" id="btn-cancel-edit" style="flex: 1; padding: 12px;">Batal</button>
                            <button type="submit" class="btn-grad" style="flex: 1; padding: 12px;">
                                <i data-lucide="save" style="width: 16px; height: 16px;"></i>
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Points Section -->
                <div class="card-glass settings-section">
                    <div class="settings-section-title">
                        <i data-lucide="award" style="width: 20px; height: 20px; color: var(--success);"></i>
                        Poin Saya
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(16, 185, 129, 0.05); border-radius: var(--radius-sm); border: 1px solid rgba(16, 185, 129, 0.2);">
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Saldo Poin</div>
                            <div style="font-size: 28px; font-weight: 800; color: var(--success);">${user.points.toLocaleString('id-ID')} <span style="font-size: 14px;">Pts</span></div>
                        </div>
                        <i data-lucide="coins" style="width: 40px; height: 40px; color: var(--success); opacity: 0.5;"></i>
                    </div>
                    <p style="margin-top: 12px; font-size: 13px; color: var(--text-secondary);">
                        Setiap transaksi sukses memberikan cashback <strong style="color: var(--success);">5%</strong> dalam bentuk poin. Poin dapat digunakan sebagai diskon pada transaksi berikutnya.
                    </p>
                </div>

                <!-- Transaction Summary -->
                <div class="card-glass settings-section">
                    <div class="settings-section-title">
                        <i data-lucide="receipt" style="width: 20px; height: 20px; color: var(--secondary);"></i>
                        Ringkasan Transaksi
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px;">
                        <div style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border-color); text-align: center;">
                            <div style="font-size: 24px; font-weight: 800; color: var(--secondary);">${userTx.length}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">Total Transaksi</div>
                        </div>
                        <div style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border-color); text-align: center;">
                            <div style="font-size: 24px; font-weight: 800; color: var(--success);">${successTx.length}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">Sukses</div>
                        </div>
                        <div style="padding: 16px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border: 1px solid var(--border-color); text-align: center;">
                            <div style="font-size: 20px; font-weight: 800; color: var(--text-primary);">${window.formatRupiah(totalSpent)}</div>
                            <div style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">Total Belanja</div>
                        </div>
                    </div>
                    <div style="margin-top: 16px;">
                        <a href="#track" class="btn-grad" style="width: 100%; padding: 12px; text-align: center;">
                            <i data-lucide="search" style="width: 16px; height: 16px;"></i>
                            <span>Lacak Semua Transaksi</span>
                        </a>
                    </div>
                </div>

                <!-- Security Section -->
                <div class="card-glass settings-section">
                    <div class="settings-section-title">
                        <i data-lucide="shield" style="width: 20px; height: 20px; color: var(--warning);"></i>
                        Keamanan
                    </div>
                    <div id="password-message" style="display: none; margin-bottom: 16px; padding: 10px; border-radius: var(--radius-sm);"></div>
                    <form id="change-password-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="current-password">Password Saat Ini</label>
                            <input type="password" id="current-password" class="form-input" placeholder="Masukkan password saat ini" required>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="new-password">Password Baru</label>
                            <input type="password" id="new-password" class="form-input" placeholder="Masukkan password baru (min. 6 karakter)" required minlength="6">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="confirm-password">Konfirmasi Password Baru</label>
                            <input type="password" id="confirm-password" class="form-input" placeholder="Ulangi password baru" required>
                        </div>
                        <button type="submit" class="btn-grad" style="padding: 12px;">
                            <i data-lucide="lock" style="width: 16px; height: 16px;"></i>
                            <span>Ubah Password</span>
                        </button>
                    </form>
                </div>

                <!-- Danger Zone -->
                <div class="card-glass settings-section danger-zone">
                    <div class="settings-section-title">
                        <i data-lucide="alert-triangle" style="width: 20px; height: 20px;"></i>
                        Zona Berbahaya
                    </div>
                    <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 16px;">
                        Menghapus akun akan menghilangkan semua data profil dan poin Anda secara permanen. Riwayat transaksi akan tetap tersimpan di sistem.
                    </p>
                    <button class="btn-action-small danger" style="width: 100%; padding: 12px; font-size: 14px;" id="btn-delete-account">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        Hapus Akun Saya
                    </button>
                </div>
            </div>
        `;

        // Initialize Lucide
        if (window.lucide) window.lucide.createIcons();

        // --- Event Handlers ---

        // Toggle Edit Profile
        const editBtn = document.getElementById('btn-edit-profile');
        const editSection = document.getElementById('edit-profile-section');
        const cancelEditBtn = document.getElementById('btn-cancel-edit');

        editBtn.addEventListener('click', () => {
            editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
            editSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        cancelEditBtn.addEventListener('click', () => {
            editSection.style.display = 'none';
        });

        // Edit Profile Submit
        document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const msgDiv = document.getElementById('edit-profile-message');
            const newUsername = document.getElementById('edit-username').value.trim();
            const newEmail = document.getElementById('edit-email').value.trim();
            const newPhone = document.getElementById('edit-phone').value.trim();

            const result = window.dbService.updateUserProfile(session.username, {
                username: newUsername,
                gmail: newEmail,
                phone: newPhone
            });

            if (result.success) {
                // Update session
                const newSession = { ...session, username: result.user.username, role: result.user.role };
                localStorage.setItem('topup_store_session', JSON.stringify(newSession));
                window.dispatchEvent(new CustomEvent('sessionUpdated'));
                
                msgDiv.style.display = 'block';
                msgDiv.className = 'badge status-success';
                msgDiv.style.width = '100%';
                msgDiv.style.padding = '10px';
                msgDiv.style.textTransform = 'none';
                msgDiv.style.borderRadius = 'var(--radius-sm)';
                msgDiv.textContent = '✓ Profil berhasil diperbarui!';
                
                setTimeout(() => {
                    this.render(container);
                }, 1000);
            } else {
                msgDiv.style.display = 'block';
                msgDiv.className = 'badge status-failed';
                msgDiv.style.width = '100%';
                msgDiv.style.padding = '10px';
                msgDiv.style.textTransform = 'none';
                msgDiv.style.borderRadius = 'var(--radius-sm)';
                msgDiv.textContent = result.message;
            }
        });

        // Change Password Submit
        document.getElementById('change-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const msgDiv = document.getElementById('password-message');
            const currentPw = document.getElementById('current-password').value;
            const newPw = document.getElementById('new-password').value;
            const confirmPw = document.getElementById('confirm-password').value;

            if (newPw !== confirmPw) {
                msgDiv.style.display = 'block';
                msgDiv.className = 'badge status-failed';
                msgDiv.style.width = '100%';
                msgDiv.style.padding = '10px';
                msgDiv.style.textTransform = 'none';
                msgDiv.style.borderRadius = 'var(--radius-sm)';
                msgDiv.textContent = 'Password baru dan konfirmasi tidak cocok!';
                return;
            }

            const result = window.dbService.changePassword(session.username, currentPw, newPw);

            msgDiv.style.display = 'block';
            msgDiv.style.width = '100%';
            msgDiv.style.padding = '10px';
            msgDiv.style.textTransform = 'none';
            msgDiv.style.borderRadius = 'var(--radius-sm)';

            if (result.success) {
                msgDiv.className = 'badge status-success';
                msgDiv.textContent = '✓ Password berhasil diubah!';
                document.getElementById('change-password-form').reset();
            } else {
                msgDiv.className = 'badge status-failed';
                msgDiv.textContent = result.message;
            }
        });

        // Delete Account
        document.getElementById('btn-delete-account').addEventListener('click', () => {
            if (confirm('⚠️ PERINGATAN: Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan!')) {
                if (confirm('Ini adalah konfirmasi terakhir. Ketik "OK" untuk melanjutkan.')) {
                    window.dbService.deleteAccount(session.username);
                    localStorage.removeItem('topup_store_session');
                    window.dispatchEvent(new CustomEvent('sessionUpdated'));
                    alert('Akun Anda telah dihapus.');
                    window.location.hash = '#home';
                }
            }
        });
    }
};

window.settingsView = settingsView;
