<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_live_sessions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('live_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutorial_id')->constrained()->onDelete('cascade');
            $table->foreignId('lesson_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('tutor_id')->constrained('users')->onDelete('cascade');
            
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('jitsi_room_id')->unique();
            $table->string('room_password')->nullable();
            $table->timestamp('scheduled_for');
            $table->integer('duration_minutes')->default(60);
            $table->integer('max_participants')->default(50);
            $table->enum('status', ['scheduled', 'live', 'ended', 'cancelled'])->default('scheduled');
            
            // Recording info
            $table->string('recording_url')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            
            // Jitsi meeting info
            $table->json('meeting_options')->nullable();
            $table->text('invite_link')->nullable();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['tutorial_id', 'status']);
            $table->index(['tutor_id', 'scheduled_for']);
            $table->index('jitsi_room_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('live_sessions');
    }
};