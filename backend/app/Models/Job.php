<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'authorized_person_id',
        'contact_name',
        'contact_phone',
        'assigned_user_id',
        'region_id',
        'title',
        'location_address',
        'maps_url',
        'latitude',
        'longitude',
        'type',
        'description',
        'materials',
        'status',
        'priority',
        'start_date',
        'due_date',
        'completed_at',
        'price'
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function authorizedPerson(): BelongsTo
    {
        return $this->belongsTo(CustomerContact::class, 'authorized_person_id');
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
