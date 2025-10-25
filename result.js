// =============================
// RESULT PAGE LOGIC - WITH PROXY
// =============================
const data = JSON.parse(sessionStorage.getItem('tiktokData'));
const videoInfoCard = document.getElementById('videoInfoCard');
const downloadSection = document.getElementById('downloadSection');
const musicSection = document.getElementById('musicSection');
const errorSection = document.getElementById('errorSection');

// Format numbers
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Universal download function - menggunakan Vercel API
function downloadFile(url, filename) {
    showNotification('Download dimulai! Cek browser download manager', 'success');
    
    // Encode URL untuk query parameter
    const encodedUrl = encodeURIComponent(url);
    const encodedFilename = encodeURIComponent(filename);
    
    // Buat proxy URL untuk Vercel
    const proxyUrl = `/api/download-proxy?url=${encodedUrl}&filename=${encodedFilename}`;
    
    // Langsung trigger download browser
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to download video
function downloadVideo(url, filename, event) {
    downloadFile(url, filename);
}

// Function to download audio
function downloadAudio(url, filename, event) {
    downloadFile(url, filename);
}

// Function to download single image
function downloadSingleImage(url, index, event) {
    const filename = `tiktok-foto-${index}.jpg`;
    showNotification(`Download foto ${index} dimulai!`, 'success');
    downloadFile(url, filename);
}

// Function to download all images
function downloadAllImages(event) {
    if (!data || !data.images) return;
    
    showNotification(`Mendownload ${data.images.length} foto...`, 'info');
    
    data.images.forEach((img, index) => {
        setTimeout(() => {
            downloadFile(img, `tiktok-foto-${index + 1}.jpg`);
        }, index * 500); // Delay 500ms per image
    });
    
    setTimeout(() => {
        showNotification('Semua download dimulai!', 'success');
    }, data.images.length * 500);
}

// Check if data exists
if (!data) {
    errorSection.style.display = 'block';
} else {
    // Check if it's images or video
    const isImages = data.images && data.images.length > 0;

    // Display video/image info
    videoInfoCard.innerHTML = `
        <div class="video-header">
            <img src="${data.cover}" alt="Thumbnail" class="video-thumbnail" onerror="this.src='https://via.placeholder.com/90'">
            <div class="video-details">
                <h2 class="video-title">${data.title}</h2>
                <div class="video-meta">
                    ${isImages ? `<span><i class="fas fa-images"></i> ${data.images.length} Foto</span>` : `<span><i class="fas fa-clock"></i> ${data.duration}s</span>`}
                    <span><i class="fas fa-calendar"></i> ${formatDate(data.create_time)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${data.region}</span>
                </div>
            </div>
        </div>

        <div class="author-info">
            <img src="${data.author.avatar}" alt="${data.author.nickname}" class="author-avatar" onerror="this.src='https://via.placeholder.com/40'">
            <div class="author-details">
                <h3>${data.author.nickname}</h3>
                <p>@${data.author.unique_id}</p>
            </div>
        </div>

        <div class="video-stats">
            <div class="stat-item">
                <i class="fas fa-play"></i>
                <span class="stat-value">${formatNumber(data.play_count)}</span>
                <span class="stat-label">Views</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-heart"></i>
                <span class="stat-value">${formatNumber(data.digg_count)}</span>
                <span class="stat-label">Likes</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-comment"></i>
                <span class="stat-value">${formatNumber(data.comment_count)}</span>
                <span class="stat-label">Comments</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-share"></i>
                <span class="stat-value">${formatNumber(data.share_count)}</span>
                <span class="stat-label">Shares</span>
            </div>
        </div>
    `;

    // Display download options based on content type
    if (isImages) {
        // Display image gallery
        downloadSection.innerHTML = `
            <h2 class="section-title">
                <i class="fas fa-images"></i>
                Download Foto (${data.images.length} Foto)
            </h2>
            <div class="image-gallery">
                ${data.images.map((img, index) => `
                    <div class="image-item">
                        <img src="${img}" alt="Foto ${index + 1}" loading="lazy" decoding="async" onclick="downloadSingleImage('${img}', ${index + 1}, event)" style="cursor: pointer;" title="Klik untuk download">
                        <div class="image-overlay">
                            <button onclick="downloadSingleImage('${img}', ${index + 1}, event)" class="image-download-btn" title="Download foto">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                        <div class="image-number">${index + 1}</div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-download-all" onclick="downloadAllImages(event)">
                <i class="fas fa-download"></i> Download Semua Foto
            </button>
        `;
    } else {
        // Display video download options
        downloadSection.innerHTML = `
            <h2 class="section-title">
                <i class="fas fa-download"></i>
                Pilih Kualitas Download
            </h2>
            <div class="download-options">
                <div class="download-card">
                    <div class="download-info">
                        <div class="download-type">
                            <i class="fas fa-video"></i>
                            Video HD
                            <span class="quality-badge">HD</span>
                        </div>
                        <div class="download-desc">Tanpa watermark • ${formatFileSize(data.hd_size)}</div>
                    </div>
                    <button onclick="downloadVideo('${data.hdplay}', 'tiktok-hd.mp4', event)" class="download-btn">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>

                <div class="download-card">
                    <div class="download-info">
                        <div class="download-type">
                            <i class="fas fa-video"></i>
                            Video Standard
                            <span class="quality-badge">No WM</span>
                        </div>
                        <div class="download-desc">Tanpa watermark • ${formatFileSize(data.size)}</div>
                    </div>
                    <button onclick="downloadVideo('${data.play}', 'tiktok-nowm.mp4', event)" class="download-btn">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>

                <div class="download-card">
                    <div class="download-info">
                        <div class="download-type">
                            <i class="fas fa-video"></i>
                            Video Watermark
                        </div>
                        <div class="download-desc">Dengan watermark • ${formatFileSize(data.wm_size)}</div>
                    </div>
                    <button onclick="downloadVideo('${data.wmplay}', 'tiktok-wm.mp4', event)" class="download-btn">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    }

    // Display music section if available
    if (data.music_info) {
        musicSection.style.display = 'block';
        musicSection.innerHTML = `
            <h2 class="section-title">
                <i class="fas fa-music"></i>
                Download Audio
            </h2>
            <div class="music-card">
                <img src="${data.music_info.cover}" alt="Music Cover" class="music-cover" onerror="this.src='https://via.placeholder.com/60'">
                <div class="music-info">
                    <h3>${data.music_info.title}</h3>
                    <p><i class="fas fa-user"></i> ${data.music_info.author}</p>
                </div>
                <button onclick="downloadAudio('${data.music_info.play}', 'tiktok-audio.mp3', event)" class="music-download-btn">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
    }
}
