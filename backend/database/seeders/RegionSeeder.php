<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Region::create(['name' => 'Bölge 1', 'description' => 'Ataşehir, Ümraniye vb.']);
        \App\Models\Region::create(['name' => 'Bölge 2', 'description' => 'Kadıköy, Maltepe vb.']);
        \App\Models\Region::create(['name' => 'Bölge 3', 'description' => 'Pendik, Tuzla vb.']);
    }
}
