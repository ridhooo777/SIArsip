<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('issuance_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('issuance_date', '<=', $request->to_date);
        }

        $documents = $query->orderBy('created_at', 'desc')->get();

        // Calculate category breakdown from the filtered documents
        $categoryBreakdown = [];
        foreach ($documents as $doc) {
            $catName = $doc->category ? $doc->category->name : 'Tanpa Kategori';
            if (!isset($categoryBreakdown[$catName])) {
                $categoryBreakdown[$catName] = 0;
            }
            $categoryBreakdown[$catName]++;
        }

        // Log report generation activity
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'REPORT',
            'entity_type' => 'report',
            'entity_id' => null,
            'details' => "Generate laporan arsip (" . count($documents) . " dokumen)",
            'ip_address' => $request->ip(),
        ]);

        return Inertia::render('Reports', [
            'documents' => $documents,
            'categories' => Category::orderBy('name')->get(),
            'summary' => [
                'totalDocuments' => Document::count(),
                'filteredCount' => count($documents),
                'categoryBreakdown' => $categoryBreakdown,
                'generatedAt' => now()->toISOString(),
            ],
            'filters' => $request->only(['category_id', 'from_date', 'to_date', 'status'])
        ]);
    }
}
