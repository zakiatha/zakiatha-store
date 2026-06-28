// js/views/admin.js
// Admin View - Implements the full admin dashboard (Statistics, Transaction management, Game/Product CRUD, User Point Management, and Third-Party API Reseller simulator)

const adminView = {
    // Active tab in admin dashboard
    activeTab: 'transactions', // transactions, games, products, payments, users, apiconfig
    selectedGameId: '', // For product management tab
    
    render: function(container) {
        const stats = window.dbService.getStats();
        const transactions = window.dbService.getTransactions();
        const games = window.dbService.getGames(true); // Include inactive
        const paymentMethods = window.dbService.getPaymentMethods(true);
        const users = window.dbService.getUsers();
        const apiConfig = window.dbService.getApiConfig();
        const apiLogs = window.dbService.getApiLogs();
        
        // Ensure selectedGameId has a default if empty
        if (!this.selectedGameId && games.length > 0) {
            this.selectedGameId = games[0].id;
        }
        
        // Render Dashboard Shell
        container.innerHTML = `
            <div class="admin-layout">
                <!-- Navigation Breadcrumb -->
                <div style="display: flex; gap: 8px; font-size: 14px; color: var(--text-secondary);">
                    <a href="#home" style="hover: color(var(--primary));">Home</a>
                    <span>/</span>
                    <span style="color: var(--text-primary); font-weight:600;">Dashboard Admin</span>
                </div>
                
                <!-- Page Title -->
                <div class="panel-header-actions">
                    <h1 class="gradient-text" style="font-size: 32px;">Control Panel Administrator</h1>
                    <span class="badge popular" style="padding: 6px 12px; font-weight: 800; font-size: 12px;">SIMULASI PORTAL DEV</span>
                </div>
                
                <!-- Statistics Grid -->
                <section class="admin-stats-grid">
                    <div class="card-glass admin-stat-card">
                        <div class="admin-stat-label">Total Pendapatan</div>
                        <div class="admin-stat-val">${window.formatRupiah(stats.totalRevenue)}</div>
                    </div>
                    <div class="card-glass admin-stat-card">
                        <div class="admin-stat-label">Transaksi Sukses</div>
                        <div class="admin-stat-val" style="color: var(--success);">${stats.successCount}</div>
                    </div>
                    <div class="card-glass admin-stat-card">
                        <div class="admin-stat-label">Provider API Balance</div>
                        <div class="admin-stat-val" style="color: var(--secondary); font-size: 24px; padding-top: 6px;">${window.formatRupiah(apiConfig.balance)}</div>
                    </div>
                    <div class="card-glass admin-stat-card">
                        <div class="admin-stat-label">Total Game Aktif</div>
                        <div class="admin-stat-val" style="color: var(--warning);">${stats.gamesCount}</div>
                    </div>
                </section>
                
                <!-- Admin Tabs -->
                <section class="card-glass admin-tab-container" style="padding: 0; overflow: hidden;">
                    <div class="admin-tabs">
                        <button class="admin-tab-btn ${this.activeTab === 'transactions' ? 'active' : ''}" data-tab="transactions">Daftar Transaksi</button>
                        <button class="admin-tab-btn ${this.activeTab === 'games' ? 'active' : ''}" data-tab="games">Kelola Game</button>
                        <button class="admin-tab-btn ${this.activeTab === 'products' ? 'active' : ''}" data-tab="products">Kelola Produk</button>
                        <button class="admin-tab-btn ${this.activeTab === 'payments' ? 'active' : ''}" data-tab="payments">Kelola Pembayaran</button>
                        <button class="admin-tab-btn ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">Kelola User & Poin</button>
                        <button class="admin-tab-btn ${this.activeTab === 'apiconfig' ? 'active' : ''}" data-tab="apiconfig">API Reseller 3rd Party</button>
                    </div>
                    
                    <div style="padding: 32px;">
                        <!-- 1. TRANSACTIONS PANEL -->
                        <div class="admin-panel ${this.activeTab === 'transactions' ? 'active' : ''}" id="panel-transactions">
                            <h3 class="panel-title" style="margin-bottom: 20px;">Daftar Riwayat Pemesanan</h3>
                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Invoice</th>
                                            <th>Tanggal</th>
                                            <th>Game/Layanan</th>
                                            <th>Data Akun</th>
                                            <th>Nominal</th>
                                            <th>WhatsApp</th>
                                            <th>Total Bayar</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="admin-tx-table-body">
                                        <!-- Inject transactions -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- 2. GAMES PANEL -->
                        <div class="admin-panel ${this.activeTab === 'games' ? 'active' : ''}" id="panel-games">
                            <div class="panel-header-actions">
                                <h3 class="panel-title">Pengelolaan Katalog Game</h3>
                                <button class="btn-grad" id="btn-admin-add-game" style="padding: 8px 16px; font-size: 13px;">
                                    <i data-lucide="plus" style="width:16px; height:16px; display:inline; vertical-align:middle; margin-right:4px;"></i>
                                    Tambah Game Baru
                                </button>
                            </div>
                            
                            <!-- Add Game Form (Hidden by default) -->
                            <div id="admin-game-form-container" class="card-glass" style="padding: 24px; margin-bottom: 24px; display: none; background: rgba(7, 10, 19, 0.4);">
                                <h4 id="game-form-title" style="margin-bottom: 16px; font-size: 16px;" class="gradient-text">Tambah Game Baru</h4>
                                <form id="admin-game-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <input type="hidden" id="form-game-id">
                                    <div class="form-group">
                                        <label for="form-game-name">Nama Game</label>
                                        <input type="text" id="form-game-name" class="form-input" placeholder="Contoh: Mobile Legends" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="form-game-slug">Slug (URL)</label>
                                        <input type="text" id="form-game-slug" class="form-input" placeholder="Contoh: mobile-legends" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="form-game-category">Kategori</label>
                                        <select id="form-game-category" class="form-input form-select" required>
                                            <option value="mobile">Mobile Games</option>
                                            <option value="pc">PC Games</option>
                                            <option value="voucher">Voucher</option>
                                            <option value="pulsa">Isi Pulsa</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="form-game-banner">URL Gambar Banner</label>
                                        <input type="text" id="form-game-banner" class="form-input" placeholder="https://images.unsplash.com/..." required>
                                    </div>
                                    <div class="form-group" style="grid-column: span 2;">
                                        <label for="form-game-desc">Deskripsi Singkat</label>
                                        <textarea id="form-game-desc" class="form-input" style="min-height: 80px; resize: vertical;" placeholder="Deskripsi untuk petunjuk top-up..." required></textarea>
                                    </div>
                                    <div class="form-group" style="grid-column: span 2;">
                                        <label>Konfigurasi Input Data Akun (JSON Format)</label>
                                        <textarea id="form-game-fields" class="form-input" style="min-height: 80px; font-family: monospace;" required>[{"id":"userId","label":"Player ID","placeholder":"Masukkan Player ID","type":"text","required":true}]</textarea>
                                    </div>
                                    
                                    <div style="grid-column: span 2; display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
                                        <button type="button" class="btn-action-small" id="btn-game-form-cancel" style="padding: 10px 20px;">Batal</button>
                                        <button type="submit" class="btn-grad" style="padding: 10px 20px; box-shadow: none;">Simpan Game</button>
                                    </div>
                                </form>
                            </div>
                            
                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Logo/Banner</th>
                                            <th>Nama Game</th>
                                            <th>Category</th>
                                            <th>Slug</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="admin-games-table-body">
                                        <!-- Inject games list -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- 3. PRODUCTS PANEL -->
                        <div class="admin-panel ${this.activeTab === 'products' ? 'active' : ''}" id="panel-products">
                            <div class="panel-header-actions">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <h3 class="panel-title">Kelola Nominal Produk</h3>
                                    <select id="admin-product-game-selector" class="form-input form-select" style="max-width: 220px; padding: 8px 16px;">
                                        <!-- Game options inject here -->
                                    </select>
                                </div>
                                <button class="btn-grad" id="btn-admin-add-product" style="padding: 8px 16px; font-size: 13px;">
                                    <i data-lucide="plus" style="width:16px; height:16px; display:inline; vertical-align:middle; margin-right:4px;"></i>
                                    Tambah Nominal Baru
                                </button>
                            </div>
                            
                            <!-- Add Product Form (Hidden by default) -->
                            <div id="admin-product-form-container" class="card-glass" style="padding: 24px; margin-bottom: 24px; display: none; background: rgba(7, 10, 19, 0.4);">
                                <h4 id="product-form-title" style="margin-bottom: 16px; font-size: 16px;" class="gradient-text">Tambah Nominal Baru</h4>
                                <form id="admin-product-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <input type="hidden" id="form-product-id">
                                    <div class="form-group">
                                        <label for="form-product-name">Nama Nominal (Contoh: 86 Diamonds)</label>
                                        <input type="text" id="form-product-name" class="form-input" placeholder="Masukkan nama nominal" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="form-product-price">Harga Jual (Rupiah)</label>
                                        <input type="number" id="form-product-price" class="form-input" placeholder="Contoh: 20000" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="form-product-sku">Kode Unik Digiflazz (SKU)</label>
                                        <input type="text" id="form-product-sku" class="form-input sku-input" placeholder="Contoh: ml86, spay50" required>
                                    </div>
                                    <div class="form-group" style="grid-column: span 2; display: flex; align-items: center; gap: 10px;">
                                        <label class="toggle-switch">
                                            <input type="checkbox" id="form-product-popular">
                                            <span class="slider-switch"></span>
                                        </label>
                                        <span style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">Tampilkan Badge "Populer"</span>
                                    </div>
                                    
                                    <div style="grid-column: span 2; display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
                                        <button type="button" class="btn-action-small" id="btn-product-form-cancel" style="padding: 10px 20px;">Batal</button>
                                        <button type="submit" class="btn-grad" style="padding: 10px 20px; box-shadow: none;">Simpan Produk</button>
                                    </div>
                                </form>
                            </div>
                            
                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nama Nominal</th>
                                            <th>Kode SKU</th>
                                            <th>Harga Coreng (Diskon)</th>
                                            <th>Harga Jual</th>
                                            <th>Badge Populer</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="admin-products-table-body">
                                        <!-- Inject products list -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- 4. PAYMENTS PANEL -->
                        <div class="admin-panel ${this.activeTab === 'payments' ? 'active' : ''}" id="panel-payments">
                            <h3 class="panel-title" style="margin-bottom: 20px;">Pengaturan Metode Pembayaran</h3>
                            
                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Kode</th>
                                            <th>Nama Metode</th>
                                            <th>Tipe</th>
                                            <th>Biaya Admin</th>
                                            <th>Informasi / Keterangan</th>
                                            <th>Status Aktif</th>
                                        </tr>
                                    </thead>
                                    <tbody id="admin-payments-table-body">
                                        <!-- Inject payment methods -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 5. USERS PANEL (NEW) -->
                        <div class="admin-panel ${this.activeTab === 'users' ? 'active' : ''}" id="panel-users">
                            <h3 class="panel-title" style="margin-bottom: 20px;">Daftar Akun & Loyalitas Poin</h3>
                            <div class="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Gmail</th>
                                            <th>No HP</th>
                                            <th>Role</th>
                                            <th>Saldo Poin</th>
                                            <th>Aksi Kelola Poin</th>
                                        </tr>
                                    </thead>
                                    <tbody id="admin-users-table-body">
                                        <!-- Inject users list -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 6. THIRD-PARTY API CONFIG PANEL (NEW) -->
                        <div class="admin-panel ${this.activeTab === 'apiconfig' ? 'active' : ''}" id="panel-apiconfig">
                            <h3 class="panel-title" style="margin-bottom: 8px;">Pengaturan API Integrasi Pihak Ketiga</h3>
                            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">
                                Konfigurasi gateway supplier digital otomatis Anda (Digiflazz, VIP Reseller, Apigames). Seluruh transaksi sukses akan memotong saldo API supplier secara otomatis.
                            </p>

                            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px;">
                                <!-- Settings Form -->
                                <div class="card-glass" style="padding: 24px; height: fit-content; background: rgba(7, 10, 19, 0.3);">
                                    <h4 style="margin-bottom: 16px; font-size:15px; color: var(--secondary); font-weight:700;">Konfigurasi Endpoint API</h4>
                                    <form id="api-config-form" style="display: flex; flex-direction: column; gap: 16px;">
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label for="api-provider-name">Nama Provider</label>
                                            <input type="text" id="api-provider-name" class="form-input" value="${apiConfig.providerName || ''}" required>
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label for="api-url">Base URL API</label>
                                            <input type="text" id="api-url" class="form-input" value="${apiConfig.apiUrl || ''}" required>
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label for="api-username">Username Digiflazz</label>
                                            <input type="text" id="api-username" class="form-input" value="${apiConfig.username || ''}" placeholder="Masukkan Username Digiflazz" required>
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label for="api-key">API Key</label>
                                            <input type="text" id="api-key" class="form-input" value="${apiConfig.apiKey || ''}" placeholder="Masukkan API Key" required>
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label for="api-webhook">Webhook URL (Callback)</label>
                                            <input type="text" id="api-webhook" class="form-input" value="${apiConfig.webhookUrl || ''}" placeholder="Masukkan Webhook Callback URL">
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0; display: flex; align-items: center; gap: 10px;">
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="api-testmode" ${apiConfig.isTestMode ? 'checked' : ''}>
                                                <span class="slider-switch"></span>
                                            </label>
                                            <span style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">Simulasi Sandbox / Test Mode</span>
                                        </div>
                                        <div class="form-group" style="margin-bottom: 0;">
                                            <label>Status Provider</label>
                                            <div style="display: flex; align-items: center; gap: 8px; font-size:13px; color: var(--success); font-weight:700;">
                                                <span style="width: 8px; height: 8px; background: var(--success); border-radius:50%; box-shadow: 0 0 8px var(--success);"></span>
                                                <span>ONLINE / TERKONEKSI</span>
                                            </div>
                                        </div>

                                        <div style="display: flex; gap: 12px; margin-top: 10px;">
                                            <button type="submit" class="btn-grad" style="flex: 1; padding: 12px; box-shadow: none;">Simpan API Config</button>
                                        </div>
                                    </form>
                                    
                                    <div style="border-top: 1px solid var(--border-color); margin-top: 24px; padding-top: 20px; display: flex; flex-direction: column; gap: 12px;">
                                        <h4 style="font-size: 14px; font-weight:700;">Penyelarasan Data Produk</h4>
                                        <p style="font-size: 12px; color: var(--text-secondary);">Ambil katalog produk nominal terbaru langsung dari server Supplier API.</p>
                                        <button class="btn-grad" id="btn-sync-api-products" style="background: var(--secondary); padding: 12px;">
                                            <i data-lucide="refresh-cw" style="width:16px; height:16px; display:inline; vertical-align:middle; margin-right:4px;"></i>
                                            <span>Sinkronisasi Produk (Sync API)</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- API Logs Terminal Console -->
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <h4 style="font-size:15px; font-weight:700; color: #10b981; display:flex; align-items:center; gap:6px;">
                                            <i data-lucide="terminal" style="width:18px; height:18px;"></i>
                                            <span>API HTTP Live Logger Terminal</span>
                                        </h4>
                                        <button class="btn-action-small" id="btn-clear-api-logs" style="border-color: rgba(16, 185, 129, 0.3); color: #10b981;">Hapus Log</button>
                                    </div>

                                    <div class="api-logs-terminal" id="api-logs-container">
                                        <!-- Logs printed here -->
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        `;

        // Load specific DOM containers
        const txTableBody = document.getElementById('admin-tx-table-body');
        const gamesTableBody = document.getElementById('admin-games-table-body');
        const productsTableBody = document.getElementById('admin-products-table-body');
        const paymentsTableBody = document.getElementById('admin-payments-table-body');
        const usersTableBody = document.getElementById('admin-users-table-body');
        const productGameSelector = document.getElementById('admin-product-game-selector');
        const apiLogsContainer = document.getElementById('api-logs-container');
        
        // ----------------------------------------------------
        // PANEL RENDER FUNCTIONS
        // ----------------------------------------------------
        
        // 1. Render Transactions Table
        const drawTransactions = () => {
            if (transactions.length === 0) {
                txTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 30px;">Belum ada transaksi simulasi yang tercatat.</td></tr>`;
                return;
            }
            
            txTableBody.innerHTML = transactions.map(tx => {
                let statusBadge = '';
                if (tx.status === 'PENDING') {
                    statusBadge = '<span class="badge status-pending">PENDING</span>';
                } else if (tx.status === 'SUCCESS') {
                    statusBadge = '<span class="badge status-success">SUCCESS</span>';
                } else {
                    statusBadge = '<span class="badge status-failed">FAILED</span>';
                }
                
                const targetStr = Object.values(tx.accountData).join(' / ');
                const txDate = new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                
                const actionsHtml = tx.status === 'PENDING' ? `
                    <div class="admin-action-buttons">
                        <button class="btn-action-small success btn-tx-approve" data-invoice-id="${tx.invoiceId}" title="Setujui Pembayaran">
                            <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                        </button>
                        <button class="btn-action-small failed btn-tx-reject" data-invoice-id="${tx.invoiceId}" title="Batalkan Transaksi">
                            <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                ` : `<span style="font-size: 11px; color: var(--text-muted);">Selesai</span>`;
                
                return `
                    <tr>
                        <td style="font-weight: 700; font-family: monospace;"><a href="#invoice/${tx.invoiceId}" style="color: var(--secondary);">${tx.invoiceId}</a></td>
                        <td>${txDate}</td>
                        <td style="font-weight: 600;">${tx.gameName}</td>
                        <td><span style="font-family: monospace;">${targetStr}</span></td>
                        <td>${tx.productName}</td>
                        <td>${tx.whatsapp}</td>
                        <td style="font-weight: 800; color: var(--secondary);">${window.formatRupiah(tx.totalAmount)}</td>
                        <td>${statusBadge}</td>
                        <td>${actionsHtml}</td>
                    </tr>
                `;
            }).join('');
            
            // Bind approve/reject events
            document.querySelectorAll('.btn-tx-approve').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-invoice-id');
                    window.dbService.updateTransactionStatus(id, 'SUCCESS');
                    this.render(container); // Re-render admin to update stats and api balance
                });
            });
            
            document.querySelectorAll('.btn-tx-reject').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-invoice-id');
                    window.dbService.updateTransactionStatus(id, 'FAILED');
                    this.render(container);
                });
            });
        };
        
        // 2. Render Games Table
        const drawGames = () => {
            gamesTableBody.innerHTML = games.map(g => {
                return `
                    <tr>
                        <td>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size:10px; border: 1px solid var(--border-color); color: var(--primary);">
                                    ${g.name.substring(0,2)}
                                </div>
                            </div>
                        </td>
                        <td style="font-weight: 700;">${g.name}</td>
                        <td style="text-transform: uppercase; font-size: 11px; color: var(--secondary); font-weight:700;">${g.category}</td>
                        <td style="font-family: monospace;">#game/${g.slug}</td>
                        <td>
                            <label class="toggle-switch">
                                <input type="checkbox" class="game-status-toggle" data-game-id="${g.id}" ${g.isActive ? 'checked' : ''}>
                                <span class="slider-switch"></span>
                            </label>
                        </td>
                        <td>
                            <div class="admin-action-buttons">
                                <button class="btn-action-small btn-game-edit" data-game-id="${g.id}">
                                    <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                                </button>
                                <button class="btn-action-small danger btn-game-delete" data-game-id="${g.id}">
                                    <i data-lucide="trash" style="width: 14px; height: 14px;"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
            // Toggle active status
            document.querySelectorAll('.game-status-toggle').forEach(chk => {
                chk.addEventListener('change', () => {
                    const gameId = chk.getAttribute('data-game-id');
                    const targetGame = games.find(g => g.id === gameId);
                    if (targetGame) {
                        targetGame.isActive = chk.checked;
                        window.dbService.saveGame(targetGame);
                    }
                });
            });
            
            // Delete game
            document.querySelectorAll('.btn-game-delete').forEach(btn => {
                btn.addEventListener('click', () => {
                    const gameId = btn.getAttribute('data-game-id');
                    if (confirm("Apakah Anda yakin ingin menghapus game ini beserta seluruh nominal produknya?")) {
                        window.dbService.deleteGame(gameId);
                        this.render(container);
                    }
                });
            });
            
            // Edit game
            document.querySelectorAll('.btn-game-edit').forEach(btn => {
                btn.addEventListener('click', () => {
                    const gameId = btn.getAttribute('data-game-id');
                    const g = games.find(item => item.id === gameId);
                    
                    if (g) {
                        document.getElementById('form-game-id').value = g.id;
                        document.getElementById('form-game-name').value = g.name;
                        document.getElementById('form-game-slug').value = g.slug;
                        document.getElementById('form-game-category').value = g.category;
                        document.getElementById('form-game-banner').value = g.banner;
                        document.getElementById('form-game-desc').value = g.description;
                        document.getElementById('form-game-fields').value = JSON.stringify(g.fields);
                        
                        document.getElementById('game-form-title').textContent = `Edit Game: ${g.name}`;
                        document.getElementById('admin-game-form-container').style.display = 'block';
                        document.getElementById('admin-game-form-container').scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        };
        
        // 3. Render Products (Nominals) Table & Selector
        const drawProducts = () => {
            productGameSelector.innerHTML = games.map(g => `<option value="${g.id}" ${g.id === this.selectedGameId ? 'selected' : ''}>${g.name}</option>`).join('');
            
            const gameProducts = window.dbService.getProducts(this.selectedGameId, true); // Include inactive
            
            if (gameProducts.length === 0) {
                productsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">Belum ada nominal produk untuk game ini. Silakan buat baru!</td></tr>`;
                return;
            }
            
            productsTableBody.innerHTML = gameProducts.map(p => {
                return `
                    <tr>
                        <td style="font-weight: 700; font-size: 15px;">${p.name}</td>
                        <td><code style="background: rgba(6, 182, 212, 0.1); color: var(--secondary); padding: 4px 8px; border-radius: 4px; font-weight: 700;">${p.buyer_sku_code || '-'}</code></td>
                        <td style="text-decoration: line-through; color: var(--text-muted);">${window.formatRupiah(p.originalPrice)}</td>
                        <td style="font-weight: 800; color: var(--secondary); font-size: 15px;">${window.formatRupiah(p.price)}</td>
                        <td>
                            <span class="badge ${p.isPopular ? 'popular' : 'status-failed'}" style="font-size: 9px; padding: 2px 6px;">
                                ${p.isPopular ? 'POPULER' : 'BIASA'}
                            </span>
                        </td>
                        <td>
                            <label class="toggle-switch">
                                <input type="checkbox" class="product-status-toggle" data-product-id="${p.id}" ${p.isActive ? 'checked' : ''}>
                                <span class="slider-switch"></span>
                            </label>
                        </td>
                        <td>
                            <div class="admin-action-buttons">
                                <button class="btn-action-small btn-product-edit" data-product-id="${p.id}">
                                    <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                                </button>
                                <button class="btn-action-small danger btn-product-delete" data-product-id="${p.id}">
                                    <i data-lucide="trash" style="width: 14px; height: 14px;"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
            // Toggle product status
            document.querySelectorAll('.product-status-toggle').forEach(chk => {
                chk.addEventListener('change', () => {
                    const prodId = chk.getAttribute('data-product-id');
                    const list = window.dbService.getProducts(this.selectedGameId, true);
                    const prod = list.find(p => p.id === prodId);
                    if (prod) {
                        prod.isActive = chk.checked;
                        window.dbService.saveProduct(prod);
                    }
                });
            });
            
            // Delete product
            document.querySelectorAll('.btn-product-delete').forEach(btn => {
                btn.addEventListener('click', () => {
                    const prodId = btn.getAttribute('data-product-id');
                    if (confirm("Apakah Anda yakin ingin menghapus nominal produk ini?")) {
                        window.dbService.deleteProduct(prodId);
                        drawProducts();
                    }
                });
            });
            
            // Edit product
            document.querySelectorAll('.btn-product-edit').forEach(btn => {
                btn.addEventListener('click', () => {
                    const prodId = btn.getAttribute('data-product-id');
                    const list = window.dbService.getProducts(this.selectedGameId, true);
                    const p = list.find(item => item.id === prodId);
                    
                    if (p) {
                        document.getElementById('form-product-id').value = p.id;
                        document.getElementById('form-product-name').value = p.name;
                        document.getElementById('form-product-price').value = p.price;
                        document.getElementById('form-product-sku').value = p.buyer_sku_code || '';
                        document.getElementById('form-product-popular').checked = p.isPopular;
                        
                        document.getElementById('product-form-title').textContent = `Edit Nominal: ${p.name}`;
                        document.getElementById('admin-product-form-container').style.display = 'block';
                        document.getElementById('admin-product-form-container').scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });

            if (window.lucide) {
                window.lucide.createIcons();
            }
        };
        
        // 4. Render Payments Table
        const drawPayments = () => {
            paymentsTableBody.innerHTML = paymentMethods.map(pm => {
                const feeText = pm.feeType === 'percent' ? `${pm.feeValue}%` : window.formatRupiah(pm.feeValue);
                
                return `
                    <tr>
                        <td style="font-weight: 700; font-family: monospace;">${pm.code}</td>
                        <td style="font-weight: 600;">${pm.name}</td>
                        <td style="text-transform: uppercase; font-size: 11px; color: var(--secondary);">${pm.type}</td>
                        <td style="font-weight: 700; color: var(--warning);">${feeText} Admin</td>
                        <td style="font-size: 12px; color: var(--text-secondary);">${pm.info}</td>
                        <td>
                            <label class="toggle-switch">
                                <input type="checkbox" class="pm-status-toggle" data-pm-id="${pm.id}" ${pm.isActive ? 'checked' : ''}>
                                <span class="slider-switch"></span>
                            </label>
                        </td>
                    </tr>
                `;
            }).join('');
            
            // Toggle payment active
            document.querySelectorAll('.pm-status-toggle').forEach(chk => {
                chk.addEventListener('change', () => {
                    const pmId = chk.getAttribute('data-pm-id');
                    const pm = paymentMethods.find(p => p.id === pmId);
                    if (pm) {
                        pm.isActive = chk.checked;
                        window.dbService.savePaymentMethod(pm);
                    }
                });
            });
        };

        // 5. Render Users Table
        const drawUsers = () => {
            if (users.length === 0) {
                usersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 30px;">Belum ada user yang terdaftar.</td></tr>`;
                return;
            }

            usersTableBody.innerHTML = users.map(u => {
                return `
                    <tr>
                        <td style="font-weight: 700; color: var(--primary);">${u.username}</td>
                        <td>${u.gmail}</td>
                        <td>${u.phone || '-'}</td>
                        <td>
                            <span class="badge ${u.role === 'admin' ? 'popular' : 'status-success'}" style="font-size:9px;">
                                ${u.role.toUpperCase()}
                            </span>
                        </td>
                        <td style="font-weight: 800; color: var(--success); font-family: monospace;">${u.points.toLocaleString('id-ID')} Pts</td>
                        <td>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn-action-small success btn-user-add-points" data-username="${u.username}" title="Berikan +1.000 Poin">
                                    +1k Pts
                                </button>
                                <button class="btn-action-small danger btn-user-deduct-points" data-username="${u.username}" title="Potong -1.000 Poin">
                                    -1k Pts
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind User points manipulation events
            document.querySelectorAll('.btn-user-add-points').forEach(btn => {
                btn.addEventListener('click', () => {
                    const uname = btn.getAttribute('data-username');
                    window.dbService.updateUserPoints(uname, 1000);
                    this.render(container); // Re-render to refresh list
                });
            });

            document.querySelectorAll('.btn-user-deduct-points').forEach(btn => {
                btn.addEventListener('click', () => {
                    const uname = btn.getAttribute('data-username');
                    window.dbService.updateUserPoints(uname, -1000);
                    this.render(container);
                });
            });
        };

        // 6. Render Third-Party API Logs in Terminal
        const drawApiLogs = () => {
            if (!apiLogsContainer) return;
            
            if (apiLogs.length === 0) {
                apiLogsContainer.innerHTML = `
                    <div style="color: #049669; padding: 20px; text-align: center;">
                        -- Terminal Empty. Waiting for reseller topup calls --
                    </div>
                `;
                return;
            }

            apiLogsContainer.innerHTML = apiLogs.map(log => {
                const dateStr = new Date(log.timestamp).toLocaleTimeString('id-ID');
                
                return `
                    <div class="api-log-entry">
                        <div class="api-log-header">
                            <span class="api-log-tag">${log.action}</span>
                            <span class="api-log-timestamp">${dateStr}</span>
                        </div>
                        <div class="api-log-body">
                            <div class="api-log-req">
                                <div class="api-log-title">HTTP POST Request JSON</div>
                                <div>${log.request}</div>
                            </div>
                            <div class="api-log-resp">
                                <div class="api-log-title">HTTP Response JSON</div>
                                <div>${log.response}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        };
        
        // ----------------------------------------------------
        // EXECUTE INITIAL DRAWS
        // ----------------------------------------------------
        drawTransactions();
        drawGames();
        drawProducts();
        drawPayments();
        drawUsers();
        drawApiLogs();
        
        // ----------------------------------------------------
        // EVENT HANDLERS & LISTENERS
        // ----------------------------------------------------
        
        // Tab switching
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                this.activeTab = btn.getAttribute('data-tab');
                
                const targetPanel = document.getElementById(`panel-${this.activeTab}`);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });
        
        // Game Selector in Products Tab
        productGameSelector.addEventListener('change', (e) => {
            this.selectedGameId = e.target.value;
            drawProducts();
        });
        
        // --- GAME CRUD FORM HANDLERS ---
        const addGameBtn = document.getElementById('btn-admin-add-game');
        const gameFormContainer = document.getElementById('admin-game-form-container');
        const gameForm = document.getElementById('admin-game-form');
        const gameFormCancel = document.getElementById('btn-game-form-cancel');
        
        addGameBtn.addEventListener('click', () => {
            gameForm.reset();
            document.getElementById('form-game-id').value = '';
            document.getElementById('form-game-fields').value = '[{"id":"userId","label":"Player ID","placeholder":"Masukkan Player ID","type":"text","required":true}]';
            document.getElementById('game-form-title').textContent = 'Tambah Game Baru';
            
            gameFormContainer.style.display = gameFormContainer.style.display === 'none' ? 'block' : 'none';
        });
        
        gameFormCancel.addEventListener('click', () => {
            gameFormContainer.style.display = 'none';
        });
        
        gameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let parsedFields = [];
            try {
                parsedFields = JSON.parse(document.getElementById('form-game-fields').value);
            } catch(err) {
                alert("Format JSON Input Data Akun tidak valid! Silakan periksa tanda kurung dan koma.");
                return;
            }
            
            const gameData = {
                id: document.getElementById('form-game-id').value || undefined,
                name: document.getElementById('form-game-name').value.trim(),
                slug: document.getElementById('form-game-slug').value.trim().toLowerCase(),
                category: document.getElementById('form-game-category').value,
                banner: document.getElementById('form-game-banner').value.trim(),
                description: document.getElementById('form-game-desc').value.trim(),
                fields: parsedFields
            };
            
            window.dbService.saveGame(gameData);
            gameFormContainer.style.display = 'none';
            this.render(container); 
        });
        
        // --- PRODUCT CRUD FORM HANDLERS ---
        const addProductBtn = document.getElementById('btn-admin-add-product');
        const productFormContainer = document.getElementById('admin-product-form-container');
        const productForm = document.getElementById('admin-product-form');
        const productFormCancel = document.getElementById('btn-product-form-cancel');
        
        addProductBtn.addEventListener('click', () => {
            productForm.reset();
            document.getElementById('form-product-id').value = '';
            document.getElementById('product-form-title').textContent = 'Tambah Nominal Baru';
            
            productFormContainer.style.display = productFormContainer.style.display === 'none' ? 'block' : 'none';
        });
        
        productFormCancel.addEventListener('click', () => {
            productFormContainer.style.display = 'none';
        });
        
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const productData = {
                id: document.getElementById('form-product-id').value || undefined,
                gameId: this.selectedGameId,
                name: document.getElementById('form-product-name').value.trim(),
                price: parseInt(document.getElementById('form-product-price').value),
                buyer_sku_code: document.getElementById('form-product-sku').value.trim(),
                isPopular: document.getElementById('form-product-popular').checked
            };
            
            const result = window.dbService.saveProduct(productData);
            if (result && result.success === false) {
                alert(result.message);
                return;
            }
            productFormContainer.style.display = 'none';
            drawProducts();
        });

        // --- THIRD-PARTY API HANDLERS ---
        const apiConfigForm = document.getElementById('api-config-form');
        const btnSyncProducts = document.getElementById('btn-sync-api-products');
        const btnClearApiLogs = document.getElementById('btn-clear-api-logs');

        apiConfigForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const url = document.getElementById('api-url').value.trim();
            const key = document.getElementById('api-key').value.trim();
            const username = document.getElementById('api-username').value.trim();
            const webhook = document.getElementById('api-webhook').value.trim();
            const isTest = document.getElementById('api-testmode').checked;
            const provider = document.getElementById('api-provider-name').value.trim();

            window.dbService.saveApiConfig({
                apiUrl: url,
                apiKey: key,
                username: username,
                webhookUrl: webhook,
                isTestMode: isTest,
                providerName: provider
            });

            alert('Konfigurasi API Pihak Ketiga berhasil disimpan!');
            this.render(container);
        });

        // Simulasi Sinkronisasi API dengan Loading interaktif
        btnSyncProducts.addEventListener('click', () => {
            btnSyncProducts.setAttribute('disabled', 'true');
            const spanText = btnSyncProducts.querySelector('span');
            const originalText = spanText.textContent;
            
            spanText.textContent = 'Menghubungkan ke API Provider...';

            setTimeout(() => {
                spanText.textContent = 'Mendownload Pricelist Produk...';
                
                setTimeout(() => {
                    const added = window.dbService.syncThirdPartyProducts();
                    alert(`Sinkronisasi Berhasil!\nBerhasil mengimpor ${added} produk baru langsung dari Supplier API.`);
                    
                    btnSyncProducts.removeAttribute('disabled');
                    spanText.textContent = originalText;
                    
                    this.render(container); // Re-render dashboard
                }, 1000);
            }, 800);
        });

        btnClearApiLogs.addEventListener('click', () => {
            window.dbService.clearApiLogs();
            drawApiLogs();
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};

window.adminView = adminView;
