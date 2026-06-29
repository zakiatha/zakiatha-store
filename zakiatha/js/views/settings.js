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
                        Setiap transaksi sukses memberikan cashback <strong style="color: var(--success);">1%</strong> dalam bentuk poin. Poin dapat digunakan sebagai diskon pada transaksi berikutnya.
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

                <!-- Tampilan & Tema Section -->
                <div class="card-glass settings-section">
                    <div class="settings-section-title">
                        <i data-lucide="palette" style="width: 20px; height: 20px; color: var(--primary);"></i>
                        Tampilan & Tema
                    </div>
                    <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px; line-height: 1.5;">
                        Pilih tema tampilan website yang nyaman untuk mata Anda. Mode Gelap atau Terang dapat diubah kapan saja.
                    </p>
                    <button class="btn-grad" id="btn-toggle-theme-settings" style="width: 100%; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0;">
                        <i data-lucide="sun" id="settings-theme-icon" style="width: 16px; height: 16px;"></i>
                        <span id="settings-theme-text">Ubah ke Mode Terang</span>
                    </button>
                </div>

                <!-- Order History Section -->
                <div class="card-glass settings-section" style="grid-column: 1 / -1; width: 100%;">
                    <div class="settings-section-title">
                        <i data-lucide="history" style="width: 20px; height: 20px; color: var(--primary);"></i>
                        Riwayat Pesanan Saya
                    </div>
                    
                    <!-- Filter & Search Bar -->
                    <div class="filter-bar" style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-md);">
                        <div class="form-group" style="margin-bottom: 0; flex: 2; min-width: 200px;">
                            <label style="font-size: 11px; margin-bottom: 6px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Cari Layanan / Produk</label>
                            <div style="position: relative;">
                                <input type="text" id="input-search-product" class="form-input" placeholder="Cari game, nominal, atau no. invoice..." style="padding-left: 36px; height: 42px; font-size: 13px;">
                                <i data-lucide="search" style="position: absolute; left: 12px; top: 13px; width: 16px; height: 16px; color: var(--text-muted);"></i>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 0; flex: 1; min-width: 150px;">
                            <label style="font-size: 11px; margin-bottom: 6px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Filter Tanggal</label>
                            <input type="date" id="input-filter-date" class="form-input" style="height: 42px; font-size: 13px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0; flex: 1; min-width: 150px;">
                            <label style="font-size: 11px; margin-bottom: 6px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Status Transaksi</label>
                            <div style="position: relative;">
                                <select id="select-filter-status" class="form-input form-select" style="height: 42px; font-size: 13px; padding-right: 32px;">
                                    <option value="ALL">Semua Status</option>
                                    <option value="PENDING">Sedang Diproses (PENDING)</option>
                                    <option value="SUCCESS">Berhasil / Selesai (SUCCESS)</option>
                                    <option value="FAILED">Pesanan Gagal (FAILED)</option>
                                </select>
                            </div>
                        </div>
                        <div style="display: flex; align-items: flex-end;">
                            <button id="btn-reset-filters" class="btn-grad" style="height: 42px; padding: 0 20px; margin: 0; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                                <i data-lucide="rotate-ccw" style="width: 14px; height: 14px;"></i>
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Tanggal</th>
                                    <th>Game</th>
                                    <th>Produk</th>
                                    <th>Total Bayar</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${userTx.length === 0 ? `
                                    <tr>
                                        <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                                            Belum ada riwayat pesanan.
                                        </td>
                                    </tr>
                                ` : userTx.map(tx => {
                                     const txDate = new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                                     let statusBadge = '';
                                     if (tx.status === 'PENDING') {
                                         statusBadge = '<span class="badge status-pending">PENDING</span>';
                                     } else if (tx.status === 'SUCCESS') {
                                         const game = window.dbService.getGameById(tx.gameId);
                                         const isVoucher = game && game.category === 'voucher';
                                         const label = isVoucher ? 'PEMBAYARAN SUKSES' : 'PESANAN DI PROSES';
                                         statusBadge = `<span class="badge status-success">${label}</span>`;
                                     } else {
                                         statusBadge = '<span class="badge status-failed">PESANAN GAGAL</span>';
                                     }
                                    return `
                                        <tr class="tx-row" data-tx-id="${tx.id}" style="cursor: pointer;" title="Klik untuk melihat detail status & nota">
                                            <td style="font-weight: 700; font-family: monospace;">
                                                <a href="#invoice/${tx.invoiceId}" style="color: var(--secondary);">${tx.invoiceId}</a>
                                            </td>
                                            <td>${txDate}</td>
                                            <td style="font-weight: 600;">${tx.gameName}</td>
                                            <td>${tx.productName}</td>
                                            <td style="font-weight: 800; color: var(--secondary);">${window.formatRupiah(tx.totalAmount)}</td>
                                            <td>${statusBadge}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
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

            <!-- Modal Detail Transaksi -->
            <div class="modal-overlay" id="tx-detail-modal" style="z-index: 1100;">
                <div class="modal-card card-glass" style="max-width: 600px; width: 90%;">
                    <div class="modal-header">
                        <h3 class="gradient-text">Detail Pesanan</h3>
                        <button class="modal-close" id="tx-detail-close">&times;</button>
                    </div>
                    <div class="modal-body" id="tx-detail-body" style="max-height: 65vh; overflow-y: auto; padding-right: 8px;">
                        <!-- Populated dynamically -->
                    </div>
                    <div class="modal-actions" style="justify-content: flex-end; padding-top: 12px; border-top: 1px solid var(--border-color);">
                        <button class="btn-grad" id="tx-detail-ok-btn" style="margin: 0; padding: 10px 24px;">Tutup</button>
                    </div>
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

        // --- Transaction Detail Modal Logic ---
        const txDetailModal = document.getElementById('tx-detail-modal');
        const txDetailClose = document.getElementById('tx-detail-close');
        const txDetailOkBtn = document.getElementById('tx-detail-ok-btn');
        const txDetailBody = document.getElementById('tx-detail-body');

        const closeTxModal = () => {
            if (txDetailModal) txDetailModal.classList.remove('active');
        };

        if (txDetailClose) txDetailClose.addEventListener('click', closeTxModal);
        if (txDetailOkBtn) txDetailOkBtn.addEventListener('click', closeTxModal);
        if (txDetailModal) {
            txDetailModal.addEventListener('click', (e) => {
                if (e.target === txDetailModal) closeTxModal();
            });
        }

        const showTxDetail = (tx) => {
            if (!txDetailModal || !txDetailBody) return;

            const txDate = new Date(tx.createdAt).toLocaleString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
            });

            let statusBadge = '';
            let statusClass = 'status-pending';
            if (tx.status === 'PENDING') {
                statusBadge = '<span class="badge status-pending">PENDING</span>';
                statusClass = 'status-pending';
            } else if (tx.status === 'SUCCESS') {
                const game = window.dbService.getGameById(tx.gameId);
                const isVoucher = game && game.category === 'voucher';
                const label = isVoucher ? 'PEMBAYARAN SUKSES' : 'PESANAN DI PROSES';
                statusBadge = `<span class="badge status-success">${label}</span>`;
                statusClass = 'status-success';
            } else {
                statusBadge = '<span class="badge status-failed">PESANAN GAGAL</span>';
                statusClass = 'status-failed';
            }

            let targetDetails = '';
            if (tx.accountData) {
                targetDetails = Object.entries(tx.accountData)
                    .map(([key, val]) => `<div style="font-size: 13px; color: var(--text-secondary);"><strong style="text-transform: capitalize;">${key}:</strong> ${val}</div>`)
                    .join('');
            }

            txDetailBody.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <!-- Invoice Info -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted);">Invoice ID</div>
                            <div style="font-weight: 800; font-family: monospace; font-size: 16px; color: var(--secondary);">${tx.invoiceId}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-muted); text-align: right;">Status</div>
                            <div style="text-align: right;">${statusBadge}</div>
                        </div>
                    </div>

                    <!-- Order Info -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(255,255,255,0.01); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted);">Layanan</div>
                            <div style="font-weight: 700; font-size: 14px;">${tx.gameName}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted);">Produk</div>
                            <div style="font-weight: 700; font-size: 14px;">${tx.productName}</div>
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Data Akun Tujuan</div>
                            ${targetDetails}
                        </div>
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted);">Metode Pembayaran</div>
                            <div style="font-size: 13px;">${tx.paymentMethodName}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted);">Total Pembayaran</div>
                            <div style="font-weight: 800; color: var(--secondary); font-size: 14px;">${window.formatRupiah(tx.totalAmount)}</div>
                        </div>
                        ${tx.voucherCode ? `
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted);">Kupon Diskon</div>
                            <div style="font-size: 13px; color: var(--success); font-weight: 700;">${tx.voucherCode} (-${window.formatRupiah(tx.discountAmount)})</div>
                        </div>` : ''}
                    </div>

                    <!-- Timeline Status -->
                    <div>
                        <h4 style="color: var(--primary); margin-bottom: 12px; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Log Status Transaksi</h4>
                        <div style="display: flex; flex-direction: column; gap: 16px; border-left: 2px solid var(--border-color); padding-left: 16px; margin-left: 8px;">
                            ${(tx.statusHistory || [
                                { status: 'PENDING', date: tx.createdAt, note: 'Pesanan dibuat. Menunggu pembayaran.' }
                            ]).map(history => {
                                const hDate = new Date(history.date).toLocaleString('id-ID', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                });
                                let dotClass = 'status-pending';
                                if (history.status === 'SUCCESS') dotClass = 'status-success';
                                if (history.status === 'FAILED') dotClass = 'status-failed';
                                return `
                                    <div style="position: relative;">
                                        <div class="timeline-dot ${dotClass}" style="position: absolute; left: -21px; top: 6px; width: 8px; height: 8px; border-radius: 50%;"></div>
                                        <div style="font-size: 11px; color: var(--text-muted);">${hDate}</div>
                                        <div style="font-weight: 700; font-size: 13px; color: var(--text-primary);">
                                            Status: <span class="badge ${dotClass}" style="font-size: 9px; padding: 1px 4px; font-weight: 800;">${history.status}</span>
                                        </div>
                                        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">${history.note || ''}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Purchase Note / Nota Pembelian -->
                    ${tx.purchaseNote ? `
                    <div style="padding: 16px; background: rgba(6, 182, 212, 0.05); border: 1px solid var(--secondary); border-radius: var(--radius-md); margin-top: 8px;">
                        <h4 style="color: var(--secondary); margin-bottom: 8px; font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="file-text" style="width: 16px; height: 16px;"></i>
                            Nota Pembelian / Token / SN
                        </h4>
                        <div style="font-family: monospace; font-size: 14px; color: var(--text-primary); white-space: pre-wrap; word-break: break-all; background: rgba(0,0,0,0.2); padding: 10px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.03);">${tx.purchaseNote}</div>
                    </div>` : ''}
                </div>
            `;
            
            txDetailModal.classList.add('active');
            if (window.lucide) window.lucide.createIcons();
        };

        // --- Theme Toggle Logic inside Settings ---
        const themeBtn = document.getElementById('btn-toggle-theme-settings');
        const themeIcon = document.getElementById('settings-theme-icon');
        const themeText = document.getElementById('settings-theme-text');

        const updateThemeBtnUI = () => {
            if (!themeBtn || !themeIcon || !themeText) return;
            const currentTheme = window.getCurrentTheme();
            if (currentTheme === 'light') {
                themeIcon.setAttribute('data-lucide', 'moon');
                themeText.textContent = 'Ubah ke Mode Gelap';
            } else {
                themeIcon.setAttribute('data-lucide', 'sun');
                themeText.textContent = 'Ubah ke Mode Terang';
            }
            if (window.lucide) window.lucide.createIcons();
        };

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                window.toggleTheme();
            });
        }

        // Listen to theme changed event
        const handleThemeChanged = () => {
            updateThemeBtnUI();
        };
        window.addEventListener('themeChanged', handleThemeChanged);

        // Initial theme button state
        updateThemeBtnUI();

        // --- Transaction History Filtering Logic ---
        const searchInput = document.getElementById('input-search-product');
        const dateInput = document.getElementById('input-filter-date');
        const statusSelect = document.getElementById('select-filter-status');
        const btnReset = document.getElementById('btn-reset-filters');
        const tbody = container.querySelector('tbody');

        const filterAndRenderTransactions = () => {
            if (!tbody) return;

            const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const dateQuery = dateInput ? dateInput.value : ''; // Format: YYYY-MM-DD
            const statusQuery = statusSelect ? statusSelect.value : 'ALL';

            const filteredTx = userTx.filter(tx => {
                // 1. Search Query (Matches product name, invoice ID, or game name)
                if (searchQuery) {
                    const matchProduct = tx.productName && tx.productName.toLowerCase().includes(searchQuery);
                    const matchInvoice = tx.invoiceId && tx.invoiceId.toLowerCase().includes(searchQuery);
                    const matchGame = tx.gameName && tx.gameName.toLowerCase().includes(searchQuery);
                    if (!matchProduct && !matchInvoice && !matchGame) return false;
                }

                // 2. Date Query
                if (dateQuery) {
                    const txDateStr = new Date(tx.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
                    if (txDateStr !== dateQuery) return false;
                }

                // 3. Status Query
                if (statusQuery !== 'ALL') {
                    if (tx.status !== statusQuery) return false;
                }

                return true;
            });

            if (filteredTx.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">
                            Tidak ada transaksi yang cocok dengan filter.
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = filteredTx.map(tx => {
                 const txDate = new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                 let statusBadge = '';
                 if (tx.status === 'PENDING') {
                     statusBadge = '<span class="badge status-pending">PENDING</span>';
                 } else if (tx.status === 'SUCCESS') {
                     const game = window.dbService.getGameById(tx.gameId);
                     const isVoucher = game && game.category === 'voucher';
                     const label = isVoucher ? 'PEMBAYARAN SUKSES' : 'PESANAN DI PROSES';
                     statusBadge = `<span class="badge status-success">${label}</span>`;
                 } else {
                     statusBadge = '<span class="badge status-failed">PESANAN GAGAL</span>';
                 }
                return `
                    <tr class="tx-row" data-tx-id="${tx.id}" style="cursor: pointer;" title="Klik untuk melihat detail status & nota">
                        <td style="font-weight: 700; font-family: monospace;">
                            <a href="#invoice/${tx.invoiceId}" style="color: var(--secondary);">${tx.invoiceId}</a>
                        </td>
                        <td>${txDate}</td>
                        <td style="font-weight: 600;">${tx.gameName}</td>
                        <td>${tx.productName}</td>
                        <td style="font-weight: 800; color: var(--secondary);">${window.formatRupiah(tx.totalAmount)}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            }).join('');

            // Re-attach click listeners
            const txRows = tbody.querySelectorAll('.tx-row');
            txRows.forEach(row => {
                row.addEventListener('click', (e) => {
                    if (e.target.tagName === 'A') return;
                    const txId = row.getAttribute('data-tx-id');
                    const tx = window.dbService.getTransactionById(txId);
                    if (tx) {
                        showTxDetail(tx);
                    }
                });
            });
        };

        // Attach event listeners to filter inputs
        if (searchInput) searchInput.addEventListener('input', filterAndRenderTransactions);
        if (dateInput) dateInput.addEventListener('change', filterAndRenderTransactions);
        if (statusSelect) statusSelect.addEventListener('change', filterAndRenderTransactions);
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (dateInput) dateInput.value = '';
                if (statusSelect) statusSelect.value = 'ALL';
                filterAndRenderTransactions();
            });
        }

        // Run initial render
        filterAndRenderTransactions();

        // Remove window event listener on hashchange to prevent memory leak
        const cleanupSettingsEvents = () => {
            window.removeEventListener('themeChanged', handleThemeChanged);
            window.removeEventListener('hashchange', cleanupSettingsEvents);
        };
        window.addEventListener('hashchange', cleanupSettingsEvents);
    }
};

window.settingsView = settingsView;
