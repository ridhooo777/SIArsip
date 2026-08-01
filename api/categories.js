import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: 'Nama kategori wajib diisi' });
      
      const { data, error } = await supabase
        .from('categories')
        .insert({ name, description })
        .select()
        .single();
      if (error) throw error;
      
      // Log activity
      await logActivity(req, 'CREATE', 'category', data.id, `Membuat kategori: ${name}`);
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, name, description } = req.body;
      if (!id || !name) return res.status(400).json({ error: 'ID dan nama kategori wajib diisi' });
      
      const { data, error } = await supabase
        .from('categories')
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      await logActivity(req, 'UPDATE', 'category', id, `Memperbarui kategori: ${name}`);
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID kategori wajib diisi' });
      
      // Check if category has documents
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);
      
      if (count > 0) {
        return res.status(400).json({ error: 'Tidak dapat menghapus kategori yang masih memiliki dokumen' });
      }
      
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      
      await logActivity(req, 'DELETE', 'category', id, `Menghapus kategori ID: ${id}`);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Categories API error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function logActivity(req, action, entityType, entityId, details) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    });
  } catch (e) {
    console.error('Logging error:', e);
  }
}