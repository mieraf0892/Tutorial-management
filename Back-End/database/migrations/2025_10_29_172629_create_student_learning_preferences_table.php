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
        Schema::create('student_learning_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->enum('learning_mode', ['Online', 'Home to Home'])->nullable();
            $table->enum('learning_preference', ['Individual', 'Group']);
            $table->json('study_days');
            $table->enum('hours_per_day', ['1', '2', '3', '4']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_learning_preferences');
    }
};
