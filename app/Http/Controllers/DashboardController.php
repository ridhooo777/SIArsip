<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalDocuments = Document::count();
        $totalCategories = Category::count();
        $activeDocuments = Document::where('status', 'aktif')->count();
        
        $totalStorageBytes = Document::whereNotNull('file_size')->sum('file_size');
        $totalStorageFormatted = $this->formatFileSize($totalStorageBytes);

        $recentDocuments = Document::with('category')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentActivity = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Documents per category
        $categories = Category::withCount('documents')->get();
        $categoryDistribution = $categories->map(function ($cat) {
            return [
                'name' => $cat->name,
                'count' => $cat->documents_count,
            ];
        });

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalDocuments' => $totalDocuments,
                'totalCategories' => $totalCategories,
                'activeDocuments' => $activeDocuments,
                'totalStorageBytes' => $totalStorageBytes,
                'totalStorageFormatted' => $totalStorageFormatted,
            ],
            'recentDocuments' => $recentDocuments,
            'recentActivity' => $recentActivity,
            'categoryDistribution' => $categoryDistribution,
        ]);
    }

    private function formatFileSize($bytes)
    {
        if ($bytes === 0) return '0 Bytes';
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = (int) floor(log($bytes) / log($k));
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }
}
