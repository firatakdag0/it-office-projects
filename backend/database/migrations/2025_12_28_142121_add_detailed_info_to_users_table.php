<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('blood_group')->nullable()->after('phone');
            $table->string('driver_license')->nullable()->after('blood_group');
            $table->string('department')->nullable()->after('driver_license');
            $table->string('emergency_contact_name')->nullable()->after('department');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            $table->text('address')->nullable()->after('emergency_contact_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'blood_group',
                'driver_license',
                'department',
                'emergency_contact_name',
                'emergency_contact_phone',
                'address'
            ]);
        });
    }
};
