<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'assigned_user_id',
        'type',
        'description',
        'status',
        'scheduled_at',
        'completed_at',
        'price',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function logs()
    {
        return $this->hasMany(JobLog::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function attachments()
    {
        return $this->hasMany(JobAttachment::class);
    }
}
