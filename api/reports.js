import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { category_id, from_date, to_date, status } = req.query;

    let query = supabase
      .from('documents')
      .select(`*, categories(name)`)
      .order('created_at', { ascending: false });

    if (category_id) query = query.eq('category_id', parseInt(category_id));
    if (status) query = query.eq('status', status);
    if (from_date) query = query.gte('created_at', from_date);
    if (to_date) query = query.lte('created_at', to_date);

    const { data: documents, error } = await query;
    if (error) throw error;

    // Get summary stats
    const { count: totalDocs } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    const { data: categories } = await supabase
      .from('categories')
      .select('name');

    // Category breakdown
    const categoryBreakdown = {};
    documents.forEach(doc => {
      const catName = doc.categories?.name || 'Tanpa Kategori';
      categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + 1;
    });

    // Log report generation
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      let userId = null;
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      }
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: 'REPORT',
        entity_type: 'report',
        entity_id: null,
        details: `Generate laporan arsip (${documents.length} dokumen)`,
        ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      });
    } catch (e) {
      console.error('Logging error:', e);
    }

    return res.status(200).json({
      documents,
      summary: {
        totalDocuments: totalDocs,
        filteredCount: documents.length,
        categoryBreakdown,
        generatedAt: new Date().toISOString(),
        filters: { category_id, from_date, to_date, status },
      },
    });
  } catch (err) {
    console.error('Reports API error:', err);
    res.status(500).json({ error: err.message });
  }
}