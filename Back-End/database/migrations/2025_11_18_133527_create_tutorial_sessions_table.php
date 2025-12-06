<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_tutorial_sessions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tutorial_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutorial_id')->constrained()->onDelete('cascade');
            $table->foreignId('tutor_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->string('meeting_link')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');
            $table->string('session_type')->default('regular');
            $table->integer('duration_minutes')->default(60);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tutorial_id', 'start_time']);
            $table->index(['tutor_id', 'start_time']);
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tutorial_sessions');
    }
};