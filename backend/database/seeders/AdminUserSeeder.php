<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Check if admin exists
        if (!User::where('email', 'admin@admin.com')->exists()) {
            User::create([
                'name' => 'Yonetici',
                'email' => 'admin@admin.com',
                'password' => Hash::make('password'),
                'role' => 'manager',
            ]);
            $this->command->info('Yonetici kullanicisi olusturuldu: admin@admin.com / password');
        } else {
            $this->command->info('Yonetici kullanicisi zaten mevcut.');
        }

        // Create a field staff for testing
        if (!User::where('email', 'personel@saha.com')->exists()) {
            User::create([
                'name' => 'Saha Personeli',
                'email' => 'personel@saha.com',
                'password' => Hash::make('password'),
                'role' => 'field_staff',
            ]);
            $this->command->info('Saha personeli olusturuldu: personel@saha.com / password');
        }
    }
}
