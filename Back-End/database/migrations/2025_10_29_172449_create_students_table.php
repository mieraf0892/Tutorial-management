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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('father_name');
            $table->integer('age');
            $table->string('parent_email')->nullable();
            $table->enum('sex', ['male', 'female']);
            $table->string('country');
            $table->string('phone_code');
            $table->string('city')->nullable();
            $table->string('subcity')->nullable();
            $table->text('address');
            $table->enum('course_type', ['Programming', 'Language', 'School Grades', 'Entrance Preparation']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
