<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_tutorials_table.php

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
            $table->integer('lessons')->default(0);
            $table->decimal('price', 8, 2)->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tutorials');
    }
};