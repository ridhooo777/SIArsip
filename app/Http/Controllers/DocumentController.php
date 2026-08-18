<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        // Auto-update expired documents
        Document::where('status', 'aktif')
            ->whereNotNull('expired_at')
            ->where('expired_at', '<', now()->toDateString())
            ->update(['status' => 'non-aktif']);

        $query = Document::with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            $status = $request->status;
            if ($status === 'nonaktif') {
                $status = 'non-aktif';
            }
            $query->where('status', $status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('from_date')) {
            $query->whereDate('issuance_date', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('issuance_date', '<=', $request->to_date);
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        return Inertia::render('Documents', [
            'documents' => $query->get(),
            'categories' => Category::orderBy('name')->get(),
            'filters' => $request->only(['category_id', 'status', 'search', 'from_date', 'to_date', 'sort_by', 'sort_order'])
        ]);
    }

    public function create()
    {
        return Inertia::render('AddDocument', [
            'categories' => Category::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'reference_number' => 'nullable|string|max:255',
            'issuance_date' => 'nullable|date',
            'expired_at' => 'nullable|date',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,zip,rar|max:20480', // Max 20MB
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $fileType = $file->getClientMimeType();

        // Store file in storage/app/public/archives
        $path = $file->store('archives', 'public');
        $fileUrl = Storage::disk('public')->url($path);

        $status = 'aktif';
        if ($request->filled('expired_at')) {
            $today = now()->toDateString();
            if ($today > $request->expired_at) {
                $status = 'non-aktif';
            }
        }

        $document = Document::create([
            'reference_number' => $request->reference_number,
            'title' => $request->title,
            'category_id' => $request->category_id,
            'issuance_date' => $request->issuance_date ?? now()->toDateString(),
            'expired_at' => $request->expired_at,
            'description' => $request->description,
            'file_url' => $fileUrl,
            'file_name' => $originalName,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'status' => $status,
            'user_id' => $request->user()->id,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'CREATE',
            'entity_type' => 'document',
            'entity_id' => $document->id,
            'details' => "Mengarsipkan dokumen: {$document->title}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('documents.index');
    }

    public function update(Request $request, Document $document)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'reference_number' => 'nullable|string|max:255',
            'issuance_date' => 'nullable|date',
            'expired_at' => 'nullable|date',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string|in:aktif,non-aktif,ditangguhkan',
        ]);

        $document->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'UPDATE',
            'entity_type' => 'document',
            'entity_id' => $document->id,
            'details' => "Memperbarui dokumen: {$document->title}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back();
    }

    public function destroy(Request $request, Document $document)
    {
        $docTitle = $document->title;
        $docId = $document->id;

        // Delete file from disk if it exists
        if ($document->file_url) {
            $relativePath = str_replace(Storage::disk('public')->url(''), '', $document->file_url);
            Storage::disk('public')->delete($relativePath);
        }

        $document->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'DELETE',
            'entity_type' => 'document',
            'entity_id' => $docId,
            'details' => "Menghapus dokumen: {$docTitle}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back();
    }

    public function download(Document $document)
    {
        if (!$document->file_url) {
            abort(404, 'File tidak ditemukan.');
        }

        $relativePath = str_replace(Storage::disk('public')->url(''), '', $document->file_url);
        
        if (!Storage::disk('public')->exists($relativePath)) {
            abort(404, 'File fisik tidak ditemukan di server.');
        }

        return Storage::disk('public')->download($relativePath, $document->file_name);
    }
}
