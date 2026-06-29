// js/views/invoice.js
// Invoice View - Displays transaction invoice, countdown timer, copyable codes, payment simulator, and points details

const invoiceView = {
    // Helper to generate a mockup QRIS SVG
    getQrisSvg: function() {
        return `
            <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- QR Border -->
                <rect x="2" y="2" width="96" height="96" rx="6" stroke="#000000" stroke-width="3"/>
                <!-- QR Code mock shapes -->
                <!-- Top-Left Finder Pattern -->
                <rect x="10" y="10" width="24" height="24" rx="2" fill="#000000"/>
                <rect x="15" y="15" width="14" height="14" rx="1" fill="#FFFFFF"/>
                <rect x="18" y="18" width="8" height="8" fill="#000000"/>
                
                <!-- Top-Right Finder Pattern -->
                <rect x="66" y="10" width="24" height="24" rx="2" fill="#000000"/>
                <rect x="71" y="15" width="14" height="14" rx="1" fill="#FFFFFF"/>
                <rect x="74" y="18" width="8" height="8" fill="#000000"/>
                
                <!-- Bottom-Left Finder Pattern -->
                <rect x="10" y="66" width="24" height="24" rx="2" fill="#000000"/>
                <rect x="15" y="71" width="14" height="14" rx="1" fill="#FFFFFF"/>
                <rect x="18" y="74" width="8" height="8" fill="#000000"/>
                
                <!-- Center QRIS text logo -->
                <rect x="38" y="38" width="24" height="24" rx="4" fill="#8b5cf6"/>
                <text x="50" y="52" font-family="'Outfit', sans-serif" font-size="7" font-weight="900" fill="#FFFFFF" text-anchor="middle">QRIS</text>
                
                <!-- Random mock QR pixels -->
                <rect x="40" y="12" width="6" height="6" fill="#000000"/>
                <rect x="52" y="16" width="6" height="6" fill="#000000"/>
                <rect x="44" y="26" width="10" height="6" fill="#000000"/>
                
                <rect x="12" y="42" width="6" height="10" fill="#000000"/>
                <rect x="22" y="50" width="8" height="6" fill="#000000"/>
                
                <rect x="42" y="68" width="8" height="8" fill="#000000"/>
                <rect x="52" y="78" width="10" height="6" fill="#000000"/>
                
                <rect x="74" y="42" width="12" height="6" fill="#000000"/>
                <rect x="68" y="52" width="6" height="10" fill="#000000"/>
                <rect x="78" y="72" width="8" height="8" fill="#000000"/>
            </svg>
        `;
    },

    // Render function
    render: function(container, params) {
        const invoiceId = params.invoiceId;
        const tx = window.dbService.getTransactionById(invoiceId);
        let timerInterval = null;
        
        if (!tx) {
            container.innerHTML = `
                <div class="card-glass" style="padding: 48px; text-align: center; max-width: 500px; margin: 40px auto;">
                    <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: var(--danger); margin-bottom: 16px;"></i>
                    <h3 style="margin-bottom: 8px;">Invoice Tidak Ditemukan</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">Maaf, data transaksi dengan ID <strong>${invoiceId}</strong> tidak ditemukan di sistem kami.</p>
                    <a href="#home" class="btn-grad">Kembali ke Home</a>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        // Format account target display string
        let accountTargetStr = '';
        if (tx.gameId === 'g-mlbb') {
            accountTargetStr = `${tx.accountData.userId} (${tx.accountData.zoneId})`;
        } else if (tx.gameId === 'g-genshin') {
            accountTargetStr = `${tx.accountData.userId} [Server: ${tx.accountData.server}]`;
        } else {
            accountTargetStr = Object.values(tx.accountData).join(' / ');
        }

        // Fetch game category
        const game = window.dbService.getGameById(tx.gameId);
        const isVoucherProduct = game && game.category === 'voucher';

        // Contextual HTML based on Status
        let statusTitle = '';
        let statusClass = '';
        let statusIcon = '';
        
        if (tx.status === 'PENDING') {
            statusTitle = 'Menunggu Pembayaran';
            statusClass = 'pending';
            statusIcon = 'clock';
        } else if (tx.status === 'SUCCESS') {
            statusTitle = isVoucherProduct ? 'Pembayaran Sukses' : 'Pesanan di Proses';
            statusClass = 'success';
            statusIcon = 'check-circle';
        } else {
            statusTitle = 'Pesanan Gagal';
            statusClass = 'failed';
            statusIcon = 'x-circle';
        }

        // Generate instructions HTML based on payment type
        let instructionsHtml = '';
        if (tx.status === 'PENDING') {
            if (tx.paymentMethodType === 'qris') {
                instructionsHtml = `
                    <div class="card-glass payment-instructions-box">
                        <h3 style="font-size: 16px; font-weight: 800;">Scan Kode QRIS di Bawah</h3>
                        <div class="qris-code-container">
                            ${this.getQrisSvg()}
                        </div>
                        <p style="font-size: 12px; color: var(--text-secondary); max-width: 320px; line-height: 1.5;">
                            Buka aplikasi DANA, OVO, GoPay, LinkAja, ShopeePay, atau Mobile Banking Anda, pilih menu scan/pay, lalu arahkan kamera ke kode QRIS di atas.
                        </p>
                    </div>
                `;
            } else if (tx.paymentMethodType === 'va') {
                const prefix = tx.paymentMethodCode === 'BCA_VA' ? '88068' : tx.paymentMethodCode === 'MANDIRI_VA' ? '89022' : '88102';
                const vaNumber = prefix + (tx.whatsapp || '081234567890').substring(2);
                
                instructionsHtml = `
                    <div class="card-glass payment-instructions-box">
                        <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 4px;">Transfer ke Virtual Account</h3>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">Salin nomor Virtual Account di bawah ini:</p>
                        
                        <div class="va-copy-box">
                            <div class="va-number" id="va-number-text">${vaNumber}</div>
                            <button class="btn-copy" id="btn-copy-va">
                                <i data-lucide="copy" style="width: 14px; height: 14px; display: inline; margin-right: 4px; vertical-align: middle;"></i>
                                <span>Salin</span>
                            </button>
                        </div>
                        
                        <div style="text-align: left; width: 100%; font-size: 12px; color: var(--text-secondary); margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                            <p><strong>Cara Pembayaran:</strong></p>
                            <p>1. Masuk ke M-Banking atau ATM pilihan Anda.</p>
                            <p>2. Pilih menu <strong>Transfer</strong> > <strong>Virtual Account</strong>.</p>
                            <p>3. Masukkan nomor VA di atas lalu klik Lanjut.</p>
                            <p>4. Pastikan nominal transfer sesuai dengan total tagihan Anda.</p>
                        </div>
                    </div>
                `;
            } else if (tx.paymentMethodType === 'retail') {
                const paymentCode = 'ZK-' + Math.floor(100000000 + Math.random() * 900000000);
                instructionsHtml = `
                    <div class="card-glass payment-instructions-box">
                        <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 4px;">Tunjukkan Kode Bayar di Kasir</h3>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">Sebutkan kode pembayaran ini ke kasir merchant:</p>
                        
                        <div class="va-copy-box">
                            <div class="va-number" id="retail-code-text" style="letter-spacing: 2px;">${paymentCode}</div>
                            <button class="btn-copy" id="btn-copy-retail">
                                <i data-lucide="copy" style="width: 14px; height: 14px; display: inline; margin-right: 4px; vertical-align: middle;"></i>
                                <span>Salin</span>
                            </button>
                        </div>
                        
                        <div style="text-align: left; width: 100%; font-size: 12px; color: var(--text-secondary); margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                            <p><strong>Cara Pembayaran:</strong></p>
                            <p>1. Datangi kasir <strong>${tx.paymentMethodName}</strong> terdekat.</p>
                            <p>2. Sampaikan bahwa Anda ingin melakukan pembayaran belanja online atau top-up.</p>
                            <p>3. Tunjukkan kode pembayaran di atas ke kasir.</p>
                            <p>4. Bayar sesuai jumlah yang ditagihkan oleh kasir.</p>
                        </div>
                    </div>
                `;
            }
        } else if (tx.status === 'SUCCESS') {
            if (isVoucherProduct) {
                const snCode = `${tx.gameId.substring(2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(100000 + Math.random() * 900000)}`;
                instructionsHtml = `
                    <div class="card-glass payment-instructions-box" style="border-color: var(--success); background: rgba(16, 185, 129, 0.02);">
                        <i data-lucide="check-circle" style="width: 48px; height: 48px; color: var(--success); filter: drop-shadow(0 0 8px var(--success-glow));"></i>
                        <h3 style="font-size: 18px; font-weight: 800; color: var(--success);">Pembayaran Sukses!</h3>
                        <p style="font-size: 13px; color: var(--text-secondary); max-width: 420px;">
                            Pembayaran telah berhasil diverifikasi oleh sistem. Kode voucher belanja Anda telah terbit di bawah ini.
                        </p>
                        <div style="background: rgba(16, 185, 129, 0.1); padding: 12px 24px; border-radius: var(--radius-sm); border: 1px solid rgba(16, 185, 129, 0.2); font-family: monospace; font-size: 14px; font-weight: 700; color: var(--success); width: 100%; max-width: 400px; text-align: center;">
                            KODE VOUCHER / SN: ${snCode}
                        </div>
                        <a href="#home" class="btn-grad" style="padding: 10px 24px; font-size: 14px; margin-top: 8px;">
                            <i data-lucide="home" style="width: 16px; height: 16px;"></i>
                            <span>Belanja Lagi</span>
                        </a>
                    </div>
                `;
            } else {
                instructionsHtml = `
                    <div class="card-glass payment-instructions-box" style="border-color: var(--success); background: rgba(16, 185, 129, 0.02);">
                        <i data-lucide="check-circle" style="width: 48px; height: 48px; color: var(--success); filter: drop-shadow(0 0 8px var(--success-glow));"></i>
                        <h3 style="font-size: 18px; font-weight: 800; color: var(--success);">Pesanan di Proses!</h3>
                        <p style="font-size: 13px; color: var(--text-secondary); max-width: 420px;">
                            Pembayaran telah berhasil diverifikasi oleh sistem. Pesanan top-up game Anda sedang dalam proses pengisian. Silakan cek akun Anda dalam beberapa saat.
                        </p>
                        <a href="#home" class="btn-grad" style="padding: 10px 24px; font-size: 14px; margin-top: 8px;">
                            <i data-lucide="home" style="width: 16px; height: 16px;"></i>
                            <span>Belanja Lagi</span>
                        </a>
                    </div>
                `;
            }
        } else {
            instructionsHtml = `
                <div class="card-glass payment-instructions-box" style="border-color: var(--danger); background: rgba(239, 68, 68, 0.02);">
                    <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: var(--danger);"></i>
                    <h3 style="font-size: 18px; font-weight: 800; color: var(--danger);">Pesanan Gagal</h3>
                    <p style="font-size: 13px; color: var(--text-secondary); max-width: 400px;">
                        Batas waktu pembayaran untuk transaksi ini telah habis atau dibatalkan oleh sistem. Poin belanja yang digunakan telah dikembalikan ke saldo Anda (jika ada).
                    </p>
                    <a href="#home" class="btn-grad" style="padding: 10px 24px; font-size: 14px; margin-top: 8px;">
                        <i data-lucide="rotate-ccw" style="width: 16px; height: 16px;"></i>
                        <span>Buat Pesanan Baru</span>
                    </a>
                </div>
            `;
        }

        // Render main markup
        container.innerHTML = `
            <div class="invoice-layout">
                <!-- Navigation Breadcrumb -->
                <div style="display: flex; gap: 8px; font-size: 14px; color: var(--text-secondary);">
                    <a href="#home" style="hover: color(var(--primary));">Home</a>
                    <span>/</span>
                    <span>Invoice</span>
                    <span>/</span>
                    <span style="color: var(--text-primary); font-weight:600;">${tx.invoiceId}</span>
                </div>
                
                <!-- Status Banner -->
                <div class="invoice-status-banner ${statusClass}">
                    <i data-lucide="${statusIcon}" style="width: 36px; height: 36px;"></i>
                    <div class="invoice-status-title">${statusTitle}</div>
                    
                    ${tx.status === 'PENDING' ? `
                        <div style="font-size: 13px; color: var(--text-secondary);">Batas Waktu Pembayaran Anda:</div>
                        <div class="invoice-timer" id="invoice-countdown-timer">00:00:00</div>
                    ` : ''}
                </div>
                
                <!-- Instructions / Result Screen -->
                ${instructionsHtml}
                
                <!-- Details Invoice Table -->
                <div class="card-glass invoice-details">
                    <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;" class="gradient-text">
                        Rincian Transaksi
                    </h3>
                    
                    <div class="invoice-row">
                        <div style="color: var(--text-secondary);">No. Invoice</div>
                        <div style="font-weight: 700; font-family: monospace;">${tx.invoiceId}</div>
                    </div>
                    <div class="invoice-row">
                        <div style="color: var(--text-secondary);">Tanggal Pemesanan</div>
                        <div>${new Date(tx.createdAt).toLocaleString('id-ID')}</div>
                    </div>
                    <div class="invoice-row">
                        <div style="color: var(--text-secondary);">Kategori Game/Layanan</div>
                        <div style="font-weight: 600;">${tx.gameName}</div>
                    </div>
                    <div class="invoice-row">
                        <div style="color: var(--text-secondary);">Data Target</div>
                        <div style="font-weight: 700; color: var(--primary);">${accountTargetStr}</div>
                    </div>
                    <div class="invoice-row">
                        <div style="color: var(--text-secondary);">Nominal Item</div>
                        <div style="font-weight: 600;">${tx.productName}</div>
                    </div>
                    <div class="invoice-row">
                        <div style="color: var(--text-secondary);">Metode Pembayaran</div>
                        <div>${tx.paymentMethodName}</div>
                    </div>
                    <div class="invoice-row">
                        <div style="color: var(--text-secondary);">No WhatsApp Anda</div>
                        <div>${tx.whatsapp}</div>
                    </div>
                    
                    <div class="invoice-row" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
                        <div style="color: var(--text-secondary);">Harga Produk</div>
                        <div>${window.formatRupiah(tx.basePrice)}</div>
                    </div>
                    <div class="invoice-row">
                        <div style="color: var(--text-secondary);">Biaya Layanan/Admin</div>
                        <div>${window.formatRupiah(tx.adminFee)}</div>
                    </div>
                    ${tx.pointsUsed > 0 ? `
                    <div class="invoice-row" style="color: var(--success); font-weight: 600;">
                        <div>Potongan Poin Belanja</div>
                        <div>- ${window.formatRupiah(tx.pointsUsed)}</div>
                    </div>` : ''}
                    
                    <div class="invoice-row-total">
                        <div>Total Tagihan</div>
                        <div style="font-size: 22px;">${window.formatRupiah(tx.totalAmount)}</div>
                    </div>

                    ${tx.username && tx.pointsEarned > 0 ? `
                    <div class="invoice-row" style="border-top: 1px solid var(--border-color); color: var(--secondary); font-weight: 700; padding-top: 12px;">
                        <div>Cashback Poin Didapat (5% Sukses)</div>
                        <div>+ ${tx.pointsEarned.toLocaleString('id-ID')} Pts</div>
                    </div>` : ''}
                </div>
                
                <!-- DEVELOPER / SIMULATOR CONTROL PANEL -->
                <div class="simulation-panel">
                    <div class="simulation-panel-title">
                        <i data-lucide="sliders" style="width:16px; height:16px; display:inline; vertical-align:middle; margin-right:4px;"></i>
                        <span>Payment Gateway Simulator (Third-Party API Hook)</span>
                    </div>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; max-width: 500px; margin-left: auto; margin-right: auto;">
                        Mensimulasikan respons callback status transaksi sukses/gagal dari server Reseller API provider digital. Aksi ini secara otomatis memperbarui saldo poin user.
                    </p>
                    
                    <div class="simulation-buttons">
                        <button class="btn-sim success" id="btn-sim-pay-success">
                            <i data-lucide="check" style="width:16px; height:16px; display:inline; vertical-align:middle; margin-right:4px;"></i>
                            Simulasikan Bayar Sukses
                        </button>
                        <button class="btn-sim failed" id="btn-sim-pay-failed">
                            <i data-lucide="x" style="width:16px; height:16px; display:inline; vertical-align:middle; margin-right:4px;"></i>
                            Simulasikan Bayar Gagal
                        </button>
                    </div>
                </div>
                
            </div>
        `;

        // ----------------------------------------------------
        // 1. COUNTDOWN TIMER JAVASCRIPT
        // ----------------------------------------------------
        if (tx.status === 'PENDING') {
            const timerEl = document.getElementById('invoice-countdown-timer');
            const expiresAtTime = new Date(tx.expiresAt).getTime();
            
            const updateTimer = () => {
                const now = new Date().getTime();
                const distance = expiresAtTime - now;
                
                if (distance < 0) {
                    clearInterval(timerInterval);
                    window.dbService.updateTransactionStatus(tx.invoiceId, 'FAILED');
                    this.render(container, params);
                    return;
                }
                
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                const hrsStr = String(hours).padStart(2, '0');
                const minsStr = String(minutes).padStart(2, '0');
                const secsStr = String(seconds).padStart(2, '0');
                
                if (timerEl) {
                    timerEl.innerHTML = `${hrsStr}:${minsStr}:${secsStr}`;
                }
            };
            
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
        }

        // ----------------------------------------------------
        // 2. COPY TO CLIPBOARD HANDLERS
        // ----------------------------------------------------
        const copyToClipboard = (text, btnElement) => {
            navigator.clipboard.writeText(text).then(() => {
                const span = btnElement.querySelector('span');
                
                const originalText = span.textContent;
                span.textContent = 'Tersalin!';
                btnElement.style.background = 'var(--success)';
                
                setTimeout(() => {
                    span.textContent = originalText;
                    btnElement.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('Gagal menyalin: ', err);
            });
        };

        const btnCopyVa = document.getElementById('btn-copy-va');
        if (btnCopyVa) {
            btnCopyVa.addEventListener('click', () => {
                const vaNum = document.getElementById('va-number-text').textContent;
                copyToClipboard(vaNum, btnCopyVa);
            });
        }

        const btnCopyRetail = document.getElementById('btn-copy-retail');
        if (btnCopyRetail) {
            btnCopyRetail.addEventListener('click', () => {
                const code = document.getElementById('retail-code-text').textContent;
                copyToClipboard(code, btnCopyRetail);
            });
        }

        // ----------------------------------------------------
        // 3. SIMULATOR BUTTON HANDLERS
        // ----------------------------------------------------
        document.getElementById('btn-sim-pay-success').addEventListener('click', () => {
            if (timerInterval) clearInterval(timerInterval);
            window.dbService.updateTransactionStatus(tx.invoiceId, 'SUCCESS');
            this.render(container, params);
        });

        document.getElementById('btn-sim-pay-failed').addEventListener('click', () => {
            if (timerInterval) clearInterval(timerInterval);
            window.dbService.updateTransactionStatus(tx.invoiceId, 'FAILED');
            this.render(container, params);
        });

        const clearTimerOnHashChange = () => {
            if (timerInterval) clearInterval(timerInterval);
            window.removeEventListener('hashchange', clearTimerOnHashChange);
        };
        window.addEventListener('hashchange', clearTimerOnHashChange);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
};

window.invoiceView = invoiceView;
