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

        const texts = {
            breadcrumb: "Pengaturan Akun",
            title: "Pengaturan Akun",
            profile_title: "Profil Saya",
            security_title: "Keamanan & Kata Sandi",
            theme_title: "Tampilan & Tema",
            tx_history_title: "Riwayat Pesanan Saya",
            edit_profile: "Edit Profil",
            theme_desc: "Pilih tema tampilan website yang nyaman untuk mata Anda. Mode Gelap atau Terang dapat diubah kapan saja.",
            theme_btn_light: "Ubah ke Mode Terang",
            theme_btn_dark: "Ubah ke Mode Gelap",
            logout_btn: "Keluar Akun",
            points_title: "Poin Saya",
            points_desc: "Setiap transaksi sukses memberikan cashback <strong style=\"color: var(--success);\">1%</strong> dalam bentuk poin. Poin dapat digunakan sebagai diskon pada transaksi berikutnya.",
            points_balance: "Saldo Poin",
            summary_title: "Ringkasan Transaksi",
            summary_total: "Total Transaksi",
            summary_success: "Sukses",
            summary_spent: "Total Belanja",
            summary_track: "Lacak Semua Transaksi",
            tx_col_inv: "Invoice ID",
            tx_col_date: "Tanggal",
            tx_col_game: "Game",
            tx_col_product: "Produk",
            tx_col_price: "Total Bayar",
            tx_col_status: "Status",
            filter_search_label: "Cari Layanan / Produk",
            filter_search_placeholder: "Cari game, nominal, atau no. invoice...",
            filter_start_date: "Mulai Tanggal",
            filter_end_date: "Sampai Tanggal",
            filter_status_label: "Status Transaksi",
            filter_status_all: "Semua Status",
            filter_status_pending: "Sedang Diproses (PENDING)",
            filter_status_success: "Berhasil / Selesai (SUCCESS)",
            filter_status_failed: "Pesanan Gagal (FAILED)",
            filter_reset: "Reset",
            no_orders: "Belum ada riwayat pesanan."
        };

        container.innerHTML = `
            <div class="settings-layout">
                <!-- Breadcrumb -->
                <div style="display: flex; gap: 8px; font-size: 14px; color: var(--text-secondary);">
                    <a href="#home" style="hover: color(var(--primary));">Home</a>
                    <span>/</span>
                    <span style="color: var(--text-primary); font-weight:600;">${texts.breadcrumb}</span>
                </div>

                <!-- Header -->
                <div class="settings-header">
                    <i data-lucide="settings" style="width: 32px; height: 32px; color: var(--primary);"></i>
                    <h1 class="gradient-text">${texts.title}</h1>
                </div>

                <!-- Profile Section -->
                <div class="card-glass settings-section">
                    <div class="settings-section-title">
                        <i data-lucide="user" style="width: 20px; height: 20px; color: var(--primary);"></i>
                        ${texts.profile_title}
                    </div>

                    <div class="settings-info-row">
                        <span class="settings-info-label">Username</span>
                        <span class="settings-info-value">${window.sanitizeHTML(user.username)}</span>
                    </div>
                    <div class="settings-info-row">
                        <span class="settings-info-label">Email</span>
                        <span class="settings-info-value">${window.sanitizeHTML(user.gmail)}</span>
                    </div>
                    <div class="settings-info-row">
                        <span class="settings-info-label">No. Handphone</span>
                        <span class="settings-info-value">${window.sanitizeHTML(user.phone || '-')}</span>
                    </div>
                    <div class="settings-info-row">
                        <span class="settings-info-label">Role</span>
                        <span class="settings-info-value">
                            <span class="badge ${user.role === 'admin' ? 'popular' : 'status-success'}" style="font-size: 10px;">${user.role.toUpperCase()}</span>
                        </span>
                    </div>

                    <div style="margin-top: 20px; display: flex; gap: 12px;">
                        <button class="btn-grad" style="flex: 1; padding: 12px; margin: 0;" id="btn-edit-profile">
                            <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
                            <span>${texts.edit_profile}</span>
                        </button>
                        <button class="btn-action-small danger" style="flex: 1; padding: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0; font-size: 14px;" id="btn-logout-settings">
                            <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
                            <span>${texts.logout_btn}</span>
                        </button>
                    </div>
                </div>

                <!-- Edit Profile Form (hidden by default) -->
                <div class="card-glass settings-section" id="edit-profile-section" style="display: none;">
                    <div class="settings-section-title">
                        <i data-lucide="edit" style="width: 20px; height: 20px; color: var(--secondary);"></i>
                        ${texts.edit_profile}
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

                <!-- Points Section (Compact Bar) -->
                <div class="card-glass settings-section">
                    <div class="settings-points-bar">
                        <div class="pts-left">
                            <div class="pts-icon">
                                <i data-lucide="coins" style="width: 20px; height: 20px;"></i>
                            </div>
                            <div>
                                <div class="pts-label">${texts.points_title}</div>
                                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 1px;">Cashback 1% tiap transaksi</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <span class="pts-value">${user.points.toLocaleString('id-ID')}</span>
                            <span class="pts-unit">Pts</span>
                        </div>
                    </div>
                </div>

                <!-- Transaction Summary (Compact Stats Row) -->
                <div class="card-glass settings-section">
                    <div class="settings-section-title">
                        <i data-lucide="receipt" style="width: 18px; height: 18px; color: var(--secondary);"></i>
                        ${texts.summary_title}
                    </div>
                    <div class="settings-stats-row">
                        <div class="stat-cell">
                            <div class="stat-num" style="color: var(--secondary);">${userTx.length}</div>
                            <div class="stat-lbl">${texts.summary_total}</div>
                        </div>
                        <div class="stat-cell">
                            <div class="stat-num" style="color: var(--success);">${successTx.length}</div>
                            <div class="stat-lbl">${texts.summary_success}</div>
                        </div>
                        <div class="stat-cell">
                            <div class="stat-num" style="color: var(--text-primary); font-size: 16px;">${window.formatRupiah(totalSpent)}</div>
                            <div class="stat-lbl">${texts.summary_spent}</div>
                        </div>
                    </div>
                </div>

                <!-- Order History Section -->
                <div class="card-glass settings-section" style="grid-column: 1 / -1; width: 100%;">
                    <div class="settings-section-title" style="justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="history" style="width: 18px; height: 18px; color: var(--primary);"></i>
                            ${texts.tx_history_title}
                        </div>
                        <button class="filter-toggle-btn" id="btn-toggle-filter" style="width: auto; padding: 6px 14px; font-size: 12px; border-radius: var(--radius-sm);">
                            <i data-lucide="filter" style="width: 14px; height: 14px; margin-right: 4px;"></i>
                            <span>Filter Pesanan</span>
                            <i data-lucide="chevron-down" class="chevron-icon" style="width: 14px; height: 14px; margin-left: 4px;"></i>
                        </button>
                    </div>
                    
                    <!-- Filter & Search Bar (Collapsible) -->
                    <div class="filter-collapsible" id="filter-collapsible-wrapper">
                        <div class="filter-bar" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; background: rgba(255, 255, 255, 0.01); border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-md); margin-top: 8px;">
                            <div class="form-group" style="margin-bottom: 0; flex: 2; min-width: 200px;">
                                <label style="font-size: 10px; margin-bottom: 4px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${texts.filter_search_label}</label>
                                <div style="position: relative;">
                                    <input type="text" id="input-search-product" class="form-input" placeholder="${texts.filter_search_placeholder}" style="padding-left: 34px; height: 38px; font-size: 12px;">
                                    <i data-lucide="search" style="position: absolute; left: 10px; top: 11px; width: 15px; height: 15px; color: var(--text-muted);"></i>
                                </div>
                            </div>
                            <div class="form-group" style="margin-bottom: 0; flex: 1; min-width: 120px;">
                                <label style="font-size: 10px; margin-bottom: 4px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${texts.filter_start_date}</label>
                                <input type="date" id="input-filter-start-date" class="form-input" style="height: 38px; font-size: 12px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 0; flex: 1; min-width: 120px;">
                                <label style="font-size: 10px; margin-bottom: 4px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${texts.filter_end_date}</label>
                                <input type="date" id="input-filter-end-date" class="form-input" style="height: 38px; font-size: 12px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 0; flex: 1; min-width: 140px;">
                                <label style="font-size: 10px; margin-bottom: 4px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${texts.filter_status_label}</label>
                                <div style="position: relative;">
                                    <select id="select-filter-status" class="form-input form-select" style="height: 38px; font-size: 12px; padding-right: 28px;">
                                        <option value="ALL">${texts.filter_status_all}</option>
                                        <option value="PENDING">${texts.filter_status_pending}</option>
                                        <option value="SUCCESS">${texts.filter_status_success}</option>
                                        <option value="FAILED">${texts.filter_status_failed}</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display: flex; align-items: flex-end;">
                                <button id="btn-reset-filters" class="btn-grad" style="height: 38px; padding: 0 16px; margin: 0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                                    <i data-lucide="rotate-ccw" style="width: 13px; height: 13px;"></i>
                                    <span>${texts.filter_reset}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>${texts.tx_col_inv}</th>
                                    <th>${texts.tx_col_date}</th>
                                    <th>${texts.tx_col_game}</th>
                                    <th>${texts.tx_col_product}</th>
                                    <th>${texts.tx_col_price}</th>
                                    <th>${texts.tx_col_status}</th>
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

        // Logout Button
        const logoutBtn = document.getElementById('btn-logout-settings');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('topup_store_session');
                if (window.refreshAuthHeader) window.refreshAuthHeader();
                window.location.hash = '#home';
            });
        }

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

        // Collapsible Filter Toggle Logic
        const filterToggleBtn = document.getElementById('btn-toggle-filter');
        const filterWrapper = document.getElementById('filter-collapsible-wrapper');
        if (filterToggleBtn && filterWrapper) {
            filterToggleBtn.addEventListener('click', () => {
                filterToggleBtn.classList.toggle('open');
                filterWrapper.classList.toggle('open');
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

            let targetDetails = '';
            if (tx.accountData) {
                targetDetails = Object.entries(tx.accountData)
                    .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
                    .join(' | ');
            }

            txDetailBody.innerHTML = `
                <div class="invoice-mini">
                    <div class="invoice-mini-header">
                        <div class="inv-brand">
                            <i data-lucide="zap" class="inv-logo" style="width: 20px; height: 20px;"></i>
                            <span>ZakiTopup Invoice</span>
                        </div>
                        <div class="inv-number">${tx.invoiceId}</div>
                    </div>
                    
                    <div class="invoice-mini-body">
                        <div class="invoice-mini-row">
                            <span class="inv-label">Status Pesanan</span>
                            <span class="inv-value">${statusBadge}</span>
                        </div>
                        <div class="invoice-mini-row">
                            <span class="inv-label">Waktu Transaksi</span>
                            <span class="inv-value">${txDate}</span>
                        </div>
                        <div class="invoice-mini-row">
                            <span class="inv-label">Layanan / Game</span>
                            <span class="inv-value">${window.sanitizeHTML(tx.gameName)}</span>
                        </div>
                        <div class="invoice-mini-row">
                            <span class="inv-label">Item / Produk</span>
                            <span class="inv-value">${window.sanitizeHTML(tx.productName)}</span>
                        </div>
                        <div class="invoice-mini-row">
                            <span class="inv-label">Tujuan / Akun</span>
                            <span class="inv-value" style="font-family: monospace;">${window.sanitizeHTML(targetDetails || '-')}</span>
                        </div>
                        <div class="invoice-mini-row">
                            <span class="inv-label">Metode Pembayaran</span>
                            <span class="inv-value">${window.sanitizeHTML(tx.paymentMethodName || '-')}</span>
                        </div>
                        ${tx.voucherCode ? `
                        <div class="invoice-mini-row">
                            <span class="inv-label">Voucher Diskon</span>
                            <span class="inv-value" style="color: var(--success);">${window.sanitizeHTML(tx.voucherCode)} (-${window.formatRupiah(tx.discountAmount)})</span>
                        </div>` : ''}
                        
                        <div class="invoice-mini-row total-row">
                            <span class="inv-label">Total Pembayaran</span>
                            <span class="inv-value">${window.formatRupiah(tx.totalAmount)}</span>
                        </div>

                        ${tx.purchaseNote ? `
                        <div style="margin-top: 14px; padding: 12px; background: rgba(6, 182, 212, 0.05); border: 1px solid var(--secondary); border-radius: var(--radius-sm);">
                            <div style="font-size: 11px; color: var(--secondary); font-weight: 800; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                                <i data-lucide="key" style="width: 14px; height: 14px;"></i>
                                Nota Pembelian / SN / Token
                            </div>
                            <div style="font-family: monospace; font-size: 13px; color: var(--text-primary); white-space: pre-wrap; word-break: break-all;">${window.sanitizeHTML(tx.purchaseNote)}</div>
                        </div>` : ''}
                    </div>

                    <div class="invoice-mini-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                        <span>Simpan invoice ini sebagai bukti transaksi resmi.</span>
                        <a href="#invoice/${tx.invoiceId}" class="btn-grad" style="padding: 6px 14px; font-size: 11px; border-radius: var(--radius-sm); text-decoration: none; white-space: nowrap; margin: 0;">
                            <span>Buka Halaman Invoice</span>
                            <i data-lucide="external-link" style="width: 12px; height: 12px; margin-left: 4px;"></i>
                        </a>
                    </div>
                </div>
            `;
            
            txDetailModal.classList.add('active');
            if (window.lucide) window.lucide.createIcons();
        };

        // --- Transaction History Filtering Logic ---
        const searchInput = document.getElementById('input-search-product');
        const startDateInput = document.getElementById('input-filter-start-date');
        const endDateInput = document.getElementById('input-filter-end-date');
        const statusSelect = document.getElementById('select-filter-status');
        const btnReset = document.getElementById('btn-reset-filters');
        const tbody = container.querySelector('tbody');

        const filterAndRenderTransactions = () => {
            if (!tbody) return;

            const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const startDateVal = startDateInput ? startDateInput.value : ''; // Format: YYYY-MM-DD
            const endDateVal = endDateInput ? endDateInput.value : ''; // Format: YYYY-MM-DD
            const statusQuery = statusSelect ? statusSelect.value : 'ALL';

            const filteredTx = userTx.filter(tx => {
                // 1. Search Query (Matches product name, invoice ID, or game name)
                if (searchQuery) {
                    const matchProduct = tx.productName && tx.productName.toLowerCase().includes(searchQuery);
                    const matchInvoice = tx.invoiceId && tx.invoiceId.toLowerCase().includes(searchQuery);
                    const matchGame = tx.gameName && tx.gameName.toLowerCase().includes(searchQuery);
                    if (!matchProduct && !matchInvoice && !matchGame) return false;
                }

                // 2. Custom Date Range Query
                if (startDateVal || endDateVal) {
                    const txDate = new Date(tx.createdAt);
                    // Reset time to midnight for date-only comparison
                    const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()).getTime();
                    
                    if (startDateVal) {
                        const start = new Date(startDateVal);
                        const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
                        if (txDateOnly < startOnly) return false;
                    }
                    
                    if (endDateVal) {
                        const end = new Date(endDateVal);
                        const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
                        if (txDateOnly > endOnly) return false;
                    }
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
        if (startDateInput) startDateInput.addEventListener('change', filterAndRenderTransactions);
        if (endDateInput) endDateInput.addEventListener('change', filterAndRenderTransactions);
        if (statusSelect) statusSelect.addEventListener('change', filterAndRenderTransactions);
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (startDateInput) startDateInput.value = '';
                if (endDateInput) endDateInput.value = '';
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
