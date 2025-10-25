// api/download-proxy.js
export default async function handler(req, res) {
  // Hanya izinkan method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Ambil URL dari query parameter
  const { url, filename = 'download' } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Fetch file dari TikTok CDN
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }

    // Get content type dan size
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    
    // Set headers untuk download dengan streaming
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    // STREAMING: Pipe response langsung tanpa buffer
    // Ini bikin download langsung jalan dari 0KB!
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      // Kirim chunk by chunk ke browser
      res.write(Buffer.from(value));
    }
    
    res.end();
    
  } catch (error) {
    console.error('Download error:', error);
    
    // Kalau belum kirim response, kirim error
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Failed to download file',
        message: error.message 
      });
    }
  }
          }
