import supabase from './db-client.js';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { fileName, fileBase64, contentType } = req.body;

    if (!fileName || !fileBase64 || !contentType) {
      return res.status(400).json({ error: 'Data file tidak lengkap' });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({ 
        error: 'Tipe file tidak didukung. Gunakan PDF, JPG, PNG, GIF, atau WebP.' 
      });
    }

    // Decode base64 and check size
    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ error: 'Ukuran file maksimal 5MB' });
    }

    // Generate unique filename to prevent collisions
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = fileName.split('.').pop();
    const safeFileName = `${timestamp}_${randomStr}.${extension}`;
    const filePath = `documents/${safeFileName}`;

    // Upload to secure storage bucket
    const { data, error } = await supabase.storage
      .from('archives')
      .upload(filePath, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return res.status(500).json({ error: 'Gagal mengupload file ke penyimpanan' });
    }

    // Get public URL (but access is controlled via RLS)
    const { data: urlData } = supabase.storage
      .from('archives')
      .getPublicUrl(filePath);

    // Log activity
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      let userId = null;
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      }
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: 'UPLOAD',
        entity_type: 'file',
        entity_id: null,
        details: `Upload file: ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)`,
        ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      });
    } catch (e) {
      console.error('Logging error:', e);
    }

    return res.status(200).json({
      url: urlData.publicUrl,
      filePath,
      fileName: safeFileName,
      fileSize: buffer.length,
      fileType: contentType,
    });
  } catch (err) {
    console.error('Upload API error:', err);
    res.status(500).json({ error: err.message });
  }
}