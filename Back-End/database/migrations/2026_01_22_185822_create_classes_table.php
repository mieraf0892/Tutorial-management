<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_classes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClassesTable extends Migration
{
    public function up()
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            
            // Basic info
            $table->string('title');
            $table->text('description')->nullable();
            
            // Relationships
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('tutor_id')->constrained('users')->onDelete('cascade');
            
            // Class-specific details (can override course defaults)
            $table->string('batch_name')->nullable(); // e.g., "Jan 2025 Batch"
            $table->string('enrollment_code')->unique();
            $table->integer('max_capacity')->default(30);
            $table->integer('current_enrollment')->default(0);
            
            // Schedule
            $table->string('schedule')->nullable(); // e.g., "Mon, Wed, Fri 6-7 PM"
            $table->date('start_date');
            $table->date('end_date');
            
            // Pricing (can override course price)
            $table->decimal('price', 10, 2)->nullable();
            
            // Status
            $table->enum('status', [
                'draft',
                'upcoming', 
                'ongoing',
                'completed',
                'cancelled'
            ])->default('draft');
            
            // Additional info
            $table->string('level')->default('Beginner'); // Beginner, Intermediate, Advanced
            $table->json('learning_objectives')->nullable();
            $table->json('includes')->nullable();
            $table->string('image_url')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('course_id');
            $table->index('tutor_id');
            $table->index('status');
            $table->index('enrollment_code');
        });
    }

    public function down()
    {
        Schema::dropIfExists('classes');
    }
}