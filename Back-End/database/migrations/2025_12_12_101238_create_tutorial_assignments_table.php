<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tutorial_assignments', function (Blueprint $table) {
            $table->id();
            
            // Tutorial being assigned
            $table->foreignId('tutorial_id')
                  ->constrained('tutorials')
                  ->onDelete('cascade');
            
            // Tutor who is assigned
            $table->foreignId('tutor_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            // Admin who made the assignment
            $table->foreignId('assigned_by_admin_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            
            // Assignment status
            $table->enum('status', ['pending', 'accepted', 'rejected'])
                  ->default('pending');
            
            // Timestamps for acceptance/rejection
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            
            $table->timestamps();
            
            // A tutor can only be assigned once to a tutorial
            $table->unique(['tutorial_id', 'tutor_id']);
        });
        
        // Add indexes for performance
        Schema::table('tutorial_assignments', function (Blueprint $table) {
            $table->index(['tutor_id', 'status']);
            $table->index(['tutorial_id', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('tutorial_assignments');
    }
};