<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'reference_number',
        'title',
        'category_id',
        'issuance_date',
        'description',
        'file_url',
        'file_name',
        'file_type',
        'file_size',
        'status',
        'user_id',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
