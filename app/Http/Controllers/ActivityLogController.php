<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(50)->withQueryString();

        return Inertia::render('ActivityLog', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'entity_type'])
        ]);
    }
}
