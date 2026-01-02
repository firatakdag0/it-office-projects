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
        Schema::table('jobs', function (Blueprint $table) {
            // Add region_id if it doesn't exist (safety check not strictly needed if we know it's missing, but good practice)
            if (!Schema::hasColumn('jobs', 'region_id')) {
                $table->foreignId('region_id')->nullable()->after('assigned_user_id')->constrained('regions')->onDelete('set null');
            }

            // Add title if it doesn't exist
            if (!Schema::hasColumn('jobs', 'title')) {
                $table->string('title')->nullable()->after('customer_id');
            }

            // Add location fields
            if (!Schema::hasColumn('jobs', 'location_address')) {
                $table->string('location_address')->nullable()->after('contact_phone');
            }

            if (!Schema::hasColumn('jobs', 'latitude')) {
                $table->decimal('latitude', 10, 8)->nullable()->after('location_address');
            }

            if (!Schema::hasColumn('jobs', 'longitude')) {
                $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropForeign(['region_id']);
            $table->dropColumn(['region_id', 'title', 'location_address', 'latitude', 'longitude']);
        });
    }
};
