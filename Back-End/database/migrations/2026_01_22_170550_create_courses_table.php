<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_courses_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCoursesTable extends Migration
{
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            
            // Category - only 4 fixed values
            $table->enum('category', [
                'programming',
                'school-grades', 
                'languages',
                'entrance-exams'
            ]);
            
            // Optional subcategory (e.g., "Python" under "Programming")
            $table->string('subcategory')->nullable();
            
            // Duration in hours
            $table->integer('duration_hours')->default(10);
            
            // Pricing (we'll expand this later)
            $table->decimal('price_group', 10, 2)->nullable();
            $table->decimal('price_individual', 10, 2)->nullable();
            
            // Status control
            $table->boolean('is_active')->default(true);
            
            // Curriculum (we'll store as JSON for now)
            $table->json('curriculum')->nullable();
            
            // Learning outcomes
            $table->json('learning_outcomes')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for faster queries
            $table->index('category');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('courses');
    }
}