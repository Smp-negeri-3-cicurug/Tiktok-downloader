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

    // Get content type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Convert response to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Set headers untuk download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Length', buffer.length);
    
    // Send buffer
    return res.send(buffer);
    
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ 
      error: 'Failed to download file',
      message: error.message 
    });
  }
      }
