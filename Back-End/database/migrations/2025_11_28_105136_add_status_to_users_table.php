<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add status column
            $table->enum('status', ['active', 'suspended', 'pending', 'inactive'])
                  ->default('active');
            
            // Add suspension tracking
            $table->timestamp('suspended_at')->nullable();
            
            // Add last login timestamp
            $table->timestamp('last_login_at')->nullable();
            
            // Add profile photo
            $table->string('profile_photo')->nullable();
            
            // Index for better performance
            $table->index('status');
            $table->index(['role', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'suspended_at', 'last_login_at', 'profile_photo']);
            $table->dropIndex(['status']);
            $table->dropIndex(['role', 'status']);
        });
    }
};