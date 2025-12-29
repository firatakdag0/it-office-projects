<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type', // individual, corporate
        'full_company_name',
        'tax_number',
        'tax_office',
        'iban',
        'region',
        'region_id',
        'phone',
        'email',
        'address',
        'maps_link',
        'latitude',
        'longitude',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(CustomerContact::class);
    }
}