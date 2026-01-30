<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_live_session_participants_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('live_session_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('jitsi_participant_id')->nullable();
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->integer('duration_seconds')->default(0);
            $table->json('metadata')->nullable(); // For storing device info, etc.
            
            $table->timestamps();
            
            $table->unique(['live_session_id', 'user_id']);
            $table->index('jitsi_participant_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('live_session_participants');
    }
};