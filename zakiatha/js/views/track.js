// js/views/track.js
// Track View - Handles searching and displaying transaction history based on Invoice ID or WhatsApp

const trackView = {
    render: function(container) {
        container.innerHTML = `
            <div class="track-layout">
                <!-- Navigation Breadcrumb -->
                <div style="display: flex; gap: 8px; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">
                    <a href="#home" style="hover: color(var(--primary));">Home</a>
                    <span>/</span>
                    <span style="color: var(--text-primary); font-weight:600;">Lacak Pesanan</span>
                </div>
                
                <!-- Search Card -->
                <div class="card-glass track-form-card">
                    <i data-lucide="search" style="width: 48px; height: 48px; color: var(--primary); margin: 0 auto 16px auto; filter: drop-shadow(0 0 10px var(--primary-glow));"></i>
                    <h2>Lacak Pesanan Anda</h2>
                    <p>Masukkan Nomor Invoice (contoh: INV-20260627-1234) atau Nomor WhatsApp Anda untuk melacak status transaksi secara real-time.</p>
                    
                    <div class="track-input-group">
                        <input type="text" id="track-search-input" class="form-input" placeholder="Masukkan No. Invoice / No. WhatsApp..." style="border-radius: var(--radius-sm);">
                        <button id="btn-track-search" class="btn-grad" style="padding: 12px 24px; border-radius: var(--radius-sm); white-space: nowrap;">
                            <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
                            <span>Cari</span>
                        </button>
                    </div>
                </div>
                
                <!-- Results Container -->
                <div id="track-results-container" style="display: none;">
                    <h3 class="track-results-title gradient-text" id="track-results-title">Riwayat Transaksi</h3>
                    <div class="track-list" id="track-history-list">
                        <!-- History items will inject here -->
                    </div>
                </div>
            </div>
        `;

        const searchInput = document.getElementById('track-search-input');
        const searchBtn = document.getElementById('btn-track-search');
        const resultsContainer = document.getElementById('track-results-container');
        const resultsTitle = document.getElementById('track-results-title');
        const historyList = document.getElementById('track-history-list');

        // Search action
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (!query) return;

            const results = window.dbService.searchTransactions(query);
            resultsContainer.style.display = 'block';

            if (results.length === 0) {
                resultsTitle.textContent = 'Transaksi Tidak Ditemukan';
                historyList.innerHTML = `
                    <div class="card-glass" style="padding: 32px; text-align: center; color: var(--text-secondary);">
                        <i data-lucide="frown" style="width: 36px; height: 36px; margin-bottom: 12px; color: var(--text-muted);"></i>
                        <p>Maaf, tidak ada catatan transaksi untuk "${query}".</p>
                    </div>
                `;
            } else {
                resultsTitle.textContent = `Ditemukan ${results.length} Transaksi`;
                historyList.innerHTML = results.map(tx => {
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

                    // Format date
                    const txDate = new Date(tx.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    return `
                        <div class="card-glass track-item" data-invoice-id="${tx.invoiceId}" style="cursor: pointer; position: relative;">
                            <div class="track-item-left">
                                <div class="track-item-inv" style="display: flex; align-items: center; gap: 8px;">
                                    <span>${tx.invoiceId}</span>
                                    <button class="btn-copy-inv" data-inv="${tx.invoiceId}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px 6px; border-radius: 4px;" title="Salin No. Invoice">
                                        <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
                                    </button>
                                </div>
                                <div class="track-item-meta">${tx.gameName} &bull; ${tx.productName}</div>
                                <div class="track-item-meta" style="font-size: 11px;">${txDate}</div>
                            </div>
                            <div class="track-item-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                                <div class="track-item-amount">${window.formatRupiah(tx.totalAmount)}</div>
                                <div>${statusBadge}</div>
                                <a href="https://wa.me/6281234567890?text=Halo%20Admin%20ZakiTopup,%20saya%20butuh%20bantuan%20terkait%20pesanan%20dengan%20Invoice:%20${tx.invoiceId}" target="_blank" rel="noopener noreferrer" class="btn-cs-link" onclick="event.stopPropagation();" style="font-size: 11px; color: #22c55e; text-decoration: none; display: flex; align-items: center; gap: 4px; font-weight: 600; margin-top: 4px;">
                                    <i data-lucide="message-circle" style="width: 13px; height: 13px;"></i>
                                    <span>Bantuan CS</span>
                                </a>
                            </div>
                        </div>
                    `;
                }).join('');

                // Add click listener to copy buttons
                document.querySelectorAll('.btn-copy-inv').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const inv = btn.getAttribute('data-inv');
                        if (navigator.clipboard) {
                            navigator.clipboard.writeText(inv);
                            btn.style.color = 'var(--success)';
                            setTimeout(() => { btn.style.color = 'var(--text-muted)'; }, 1500);
                        }
                    });
                });

                // Add click listener to history items
                document.querySelectorAll('.track-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const invId = item.getAttribute('data-invoice-id');
                        window.location.hash = `#invoice/${invId}`;
                    });
                });
            }

            // Refresh icons in dynamic content
            if (window.lucide) {
                window.lucide.createIcons();
            }
        };

        // Click event
        searchBtn.addEventListener('click', performSearch);

        // Enter key press event
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Set initial Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};

window.trackView = trackView;
