<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_individual_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateIndividualRequestsTable extends Migration
{
    public function up()
    {
        Schema::create('individual_requests', function (Blueprint $table) {
            $table->id();
            
            // Student who requested
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            
            // Course for individual tutoring
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            
            // Assigned tutor (nullable initially)
            $table->foreignId('tutor_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Request details
            $table->text('special_requirements')->nullable();
            $table->integer('preferred_hours_per_week')->default(2);
            $table->json('preferred_schedule')->nullable(); // Array of preferred days/times
            $table->date('preferred_start_date');
            $table->integer('duration_weeks')->default(4);
            
            // Pricing
            $table->decimal('hourly_rate', 10, 2)->nullable(); // Can override course price_individual
            $table->decimal('total_price', 10, 2)->nullable(); // Calculated: hourly_rate × hours
            
            // Status
            $table->enum('status', [
                'pending',      // Request submitted, waiting for admin/tutor
                'reviewing',    // Admin is reviewing
                'searching',    // Looking for available tutor
                'matched',      // Tutor assigned
                'scheduled',    // Sessions scheduled
                'ongoing',      // Tutorial in progress
                'completed',    // Tutorial completed
                'cancelled',    // Cancelled by student/admin
                'rejected'      // Rejected (no tutor available, etc.)
            ])->default('pending');
            
            // Admin/tutor notes
            $table->text('admin_notes')->nullable();
            $table->text('tutor_notes')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('student_id');
            $table->index('course_id');
            $table->index('tutor_id');
            $table->index('status');
        });
        
        // Individual tutorial sessions table (if needed)
        Schema::create('individual_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('individual_requests')->onDelete('cascade');
            $table->foreignId('tutor_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('scheduled_time');
            $table->integer('duration_minutes')->default(60);
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('individual_sessions');
        Schema::dropIfExists('individual_requests');
    }
}