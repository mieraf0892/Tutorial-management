<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('email_queues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // verification, welcome, approval, rejection, etc.
            $table->string('to');
            $table->string('subject');
            $table->text('content');
            $table->text('token')->nullable(); // for verification tokens
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->timestamps();
            
            $table->index(['type', 'sent_at']);
            $table->index(['user_id', 'type']);
            $table->index(['token']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('email_queue');
    }
};