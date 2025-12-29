<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobAttachment extends Model
{
    use HasFactory;

    protected $fillable = ['job_id', 'file_path', 'file_name', 'file_type'];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
