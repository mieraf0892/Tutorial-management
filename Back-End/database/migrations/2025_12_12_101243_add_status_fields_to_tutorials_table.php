<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tutorials', function (Blueprint $table) {
            // Who created this tutorial? Admin or tutor?
            $table->enum('created_by_role', ['admin', 'tutor'])
                  ->default('tutor')
                  ->after('tutor_id');
            
            // If created by admin, which admin?
            $table->foreignId('admin_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null')
                  ->after('created_by_role');
            
            // Tutorial workflow status
            $table->enum('status', [
                'draft',           // Just created, not ready
                'pending_approval', // Submitted for admin approval
                'approved',        // Admin approved, ready for content
                'published',       // Live and visible to students
                'archived'         // No longer active
            ])->default('draft')->after('is_published');
            
            // When and who approved/published
            $table->foreignId('approved_by_admin_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null')
                  ->after('status');
                  
            $table->timestamp('approved_at')->nullable()->after('approved_by_admin_id');
            
            // For rejected tutorials
            $table->text('rejection_reason')->nullable()->after('approved_at');
        });
    }

    public function down()
    {
        Schema::table('tutorials', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['admin_id']);
            $table->dropForeign(['approved_by_admin_id']);
            
            // Drop columns
            $table->dropColumn([
                'created_by_role',
                'admin_id',
                'status',
                'approved_by_admin_id',
                'approved_at',
                'rejection_reason'
            ]);
        });
    }
};