import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // Run all queries in parallel for performance
    const [
      docsResult,
      catsResult,
      activeDocsResult,
      recentDocsResult,
      recentLogsResult,
      monthlyStats,
    ] = await Promise.all([
      // Total documents
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      
      // Total categories
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      
      // Active documents
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'aktif'),
      
      // Recent 5 documents
      supabase
        .from('documents')
        .select(`*, categories(name)`)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent 10 activity logs
      supabase
        .from('activity_logs')
        .select(`*, users(email)`)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Documents per category
      supabase
        .from('categories')
        .select('name, documents(count)'),
    ]);

    // Calculate storage info
    const { data: allDocs } = await supabase
      .from('documents')
      .select('file_size')
      .not('file_size', 'is', null);
    
    const totalSizeBytes = allDocs?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;

    return res.status(200).json({
      stats: {
        totalDocuments: docsResult.count || 0,
        totalCategories: catsResult.count || 0,
        activeDocuments: activeDocsResult.count || 0,
        totalStorageBytes: totalSizeBytes,
        totalStorageFormatted: formatFileSize(totalSizeBytes),
      },
      recentDocuments: recentDocsResult.data || [],
      recentActivity: recentLogsResult.data || [],
      categoryDistribution: (monthlyStats.data || []).map(cat => ({
        name: cat.name,
        count: cat.documents?.length || 0,
      })),
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    res.status(500).json({ error: err.message });
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}