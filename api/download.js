import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // Verify authentication - only logged-in users can download
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Login diperlukan untuk mengakses file' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(403).json({ error: 'Forbidden - Akses ditolak' });
    }

    const { filePath, documentId } = req.query;

    if (!filePath && !documentId) {
      return res.status(400).json({ error: 'File path atau document ID diperlukan' });
    }

    let targetPath = filePath;
    
    // If documentId provided, look up the file path from database
    if (documentId && !targetPath) {
      const { data: doc, error } = await supabase
        .from('documents')
        .select('file_url, file_name, title')
        .eq('id', documentId)
        .single();
      
      if (error || !doc) {
        return res.status(404).json({ error: 'Dokumen tidak ditemukan' });
      }
      
      // Extract path from URL
      targetPath = extractFilePath(doc.file_url);
    }

    if (!targetPath) {
      return res.status(400).json({ error: 'Path file tidak valid' });
    }

    // Download file from secure storage
    const { data, error } = await supabase.storage
      .from('archives')
      .download(targetPath);

    if (error) {
      console.error('Download error:', error);
      return res.status(404).json({ error: 'File tidak ditemukan atau telah dihapus' });
    }

    // Log the download activity
    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'DOWNLOAD',
        entity_type: 'document',
        entity_id: documentId ? parseInt(documentId) : null,
        details: `Mengunduh file: ${targetPath}`,
        ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      });
    } catch (e) {
      console.error('Logging error:', e);
    }

    // Determine content type
    const ext = targetPath.split('.').pop().toLowerCase();
    const contentTypes = {
      pdf: 'application/pdf',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };

    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${targetPath.split('/').pop()}"`);
    return res.status(200).send(Buffer.from(await data.arrayBuffer()));
  } catch (err) {
    console.error('Download API error:', err);
    res.status(500).json({ error: err.message });
  }
}

function extractFilePath(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/archives\/(.+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}