<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ActivityLog;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Categories', [
            'categories' => Category::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'CREATE',
            'entity_type' => 'category',
            'entity_id' => $category->id,
            'details' => "Membuat kategori: {$category->name}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back();
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category->update($validated);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'UPDATE',
            'entity_type' => 'category',
            'entity_id' => $category->id,
            'details' => "Memperbarui kategori: {$category->name}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back();
    }

    public function destroy(Request $request, Category $category)
    {
        // Check if category has documents
        if ($category->documents()->count() > 0) {
            return redirect()->back()->withErrors([
                'error' => 'Tidak dapat menghapus kategori yang masih memiliki dokumen.'
            ]);
        }

        $categoryName = $category->name;
        $categoryId = $category->id;
        $category->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'DELETE',
            'entity_type' => 'category',
            'entity_id' => $categoryId,
            'details' => "Menghapus kategori: {$categoryName}",
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back();
    }
}
