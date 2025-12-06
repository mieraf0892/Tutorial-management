<?php
// database/migrations/2025_11_07_create_tutorials_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tutorials', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('duration');
            $table->integer('students')->default(0);
            $table->decimal('rating', 3, 1)->default(0);
            $table->enum('level', ['Beginner', 'Intermediate', 'Advanced']);
            $table->string('image');
            $table->text('content')->nullable();
            $table->string('instructor');
            $table->text('instructor_bio')->nullable();
            $table->string('instructor_experience')->nullable();
            $table->integer('lessons')->default(0);
            $table->decimal('price', 8, 2)->default(0);
            $table->boolean('is_published')->default(true);
            $table->json('learning_objectives')->nullable();
            $table->json('includes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tutorials');
    }
};