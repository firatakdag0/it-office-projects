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
            $table->foreignId('authorized_person_id')->nullable()->after('customer_id')->constrained('customer_contacts')->nullOnDelete();
            $table->string('contact_name')->nullable()->after('authorized_person_id');
            $table->string('contact_phone')->nullable()->after('contact_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropForeign(['authorized_person_id']);
            $table->dropColumn(['authorized_person_id', 'contact_name', 'contact_phone']);
        });
    }
};
