<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('student_tutor_assignments', function (Blueprint $table) {
            $table->id();
            
            // Course reference
            $table->foreignId('course_id')
                  ->constrained()
                  ->onDelete('cascade');
            
            // Tutor reference (user with tutor role)
            $table->foreignId('tutor_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            // Student reference (user with student role)
            $table->foreignId('student_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            // Assignment details
            $table->enum('status', ['active', 'completed', 'cancelled'])
                  ->default('active');
            
            $table->date('start_date')->default(now());
            $table->date('end_date')->nullable();
            $table->integer('weekly_hours')->default(2);
            
            // Prevent duplicate assignments
            $table->unique(['course_id', 'tutor_id', 'student_id']);
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('student_tutor_assignments');
    }
};