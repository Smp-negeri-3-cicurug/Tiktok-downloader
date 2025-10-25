// =============================
// TIKTOK DOWNLOADER LOGIC
// =============================
document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        downloadBtn: document.getElementById('downloadBtn'),
        urlInput: document.getElementById('urlInput'),
        loadingSection: document.getElementById('loadingSection'),
        messageSection: document.getElementById('messageSection'),
        messageText: document.getElementById('messageText')
    };

    // Event Listeners
    elements.downloadBtn.addEventListener('click', handleDownload);
    elements.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleDownload();
    });

    // Main Download Handler
    async function handleDownload() {
        const url = elements.urlInput.value.trim();

        // Validation
        if (!url) {
            showMessage('Silakan masukkan link TikTok terlebih dahulu', 'error');
            return;
        }

        if (!isValidUrl(url)) {
            showMessage('Link tidak valid. Pastikan link dari TikTok', 'error');
            return;
        }

        if (!url.includes('tiktok.com')) {
            showMessage('Link harus dari TikTok', 'error');
            return;
        }

        // Reset UI
        hideMessage();
        setLoadingState(true);

        try {
            const encodedUrl = encodeURIComponent(url);
            const apiUrl = `https://api.zenzxz.my.id/api/downloader/tiktok?url=${encodedUrl}`;
            
            console.log('Fetching API:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success && data.data) {
                // Store data in sessionStorage
                sessionStorage.setItem('tiktokData', JSON.stringify(data.data));
                console.log('Data saved to sessionStorage');
                
                // Show success message briefly before redirect
                showMessage('Berhasil! Mengalihkan ke halaman download...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    console.log('Redirecting to result.html');
                    window.location.href = 'result.html';
                }, 1000);
            } else {
                console.error('API Error:', data);
                showMessage(data.error || 'Gagal mengambil data. Pastikan link valid dan coba lagi', 'error');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showMessage('Terjadi kesalahan. Pastikan koneksi internet stabil dan coba lagi', 'error');
        } finally {
            setLoadingState(false);
        }
    }

    // Helper Functions
    function isValidUrl(str) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }

    function setLoadingState(isLoading) {
        elements.loadingSection.style.display = isLoading ? 'block' : 'none';
        elements.downloadBtn.disabled = isLoading;
        
        if (isLoading) {
            elements.downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        } else {
            elements.downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        }
    }

    function showMessage(msg, type = 'info') {
        elements.messageText.textContent = msg;
        elements.messageSection.className = `message-section message-${type}`;
        elements.messageSection.style.display = 'block';
        
        // Trigger animation
        setTimeout(() => {
            elements.messageSection.classList.add('show');
        }, 10);
    }

    function hideMessage() {
        elements.messageSection.classList.remove('show');
        setTimeout(() => {
            elements.messageSection.style.display = 'none';
        }, 300);
    }

    // Auto focus on input
    elements.urlInput.focus();
});