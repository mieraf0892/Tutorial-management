<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_tutor_subjects_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tutor_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained()->onDelete('cascade');
            $table->string('subject_name'); // e.g., 'Math', 'Physics', 'Programming'
            $table->string('specialization')->nullable(); // e.g., 'Web Development', 'AI'
            $table->enum('level', ['beginner', 'intermediate', 'advanced']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tutor_subjects');
    }
};