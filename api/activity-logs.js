import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { action, entity_type, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('activity_logs')
      .select(`*, users(email, raw_user_meta_data)`)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (action) query = query.eq('action', action);
    if (entity_type) query = query.eq('entity_type', entity_type);

    const { data, error, count } = await query;
    if (error) throw error;

    // Get total count
    const { count: totalCount } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({
      logs: data,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (err) {
    console.error('Activity Logs API error:', err);
    res.status(500).json({ error: err.message });
  }
}