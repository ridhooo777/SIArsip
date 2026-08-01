import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { category_id, search, status, from_date, to_date, sort_by = 'created_at', sort_order = 'desc' } = req.query;
      
      let query = supabase
        .from('documents')
        .select(`*, categories(name)`)
        .order(sort_by, { ascending: sort_order === 'asc' });
      
      if (category_id) query = query.eq('category_id', parseInt(category_id));
      if (status) query = query.eq('status', status);
      if (search) {
        query = query.or(`reference_number.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (from_date) query = query.gte('issuance_date', from_date);
      if (to_date) query = query.lte('issuance_date', to_date);
      
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { reference_number, title, category_id, issuance_date, description, file_url, file_name, file_type, file_size, status } = req.body;
      
      if (!title || !category_id) {
        return res.status(400).json({ error: 'Judul dan kategori dokumen wajib diisi' });
      }
      
      // Get user ID from token
      let userId = null;
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      }
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          reference_number,
          title,
          category_id: parseInt(category_id),
          issuance_date: issuance_date || new Date().toISOString().split('T')[0],
          description,
          file_url,
          file_name,
          file_type,
          file_size,
          status: status || 'aktif',
          user_id: userId,
        })
        .select()
        .single();
      if (error) throw error;
      
      await logActivity(req, 'CREATE', 'document', data.id, `Mengarsipkan dokumen: ${title}`);
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, reference_number, title, category_id, issuance_date, description, status } = req.body;
      if (!id) return res.status(400).json({ error: 'ID dokumen wajib diisi' });
      
      const updateData = { updated_at: new Date().toISOString() };
      if (reference_number !== undefined) updateData.reference_number = reference_number;
      if (title !== undefined) updateData.title = title;
      if (category_id !== undefined) updateData.category_id = parseInt(category_id);
      if (issuance_date !== undefined) updateData.issuance_date = issuance_date;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      
      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      await logActivity(req, 'UPDATE', 'document', id, `Memperbarui dokumen: ${data.title}`);
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID dokumen wajib diisi' });
      
      // Get doc info before delete for logging
      const { data: doc } = await supabase.from('documents').select('title, file_url').eq('id', id).single();
      
      // Delete file from storage if exists
      if (doc?.file_url) {
        const filePath = fileUrlToPath(doc.file_url);
        if (filePath) {
          await supabase.storage.from('archives').remove([filePath]);
        }
      }
      
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      
      await logActivity(req, 'DELETE', 'document', id, `Mhapus dokumen: ${doc?.title}`);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Documents API error:', err);
    res.status(500).json({ error: err.message });
  }
}

function fileUrlToPath(url) {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/archives\/(.+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
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