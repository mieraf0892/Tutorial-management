<?php
// database/migrations/2024_01_01_000001_create_announcements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('target_type', ['all', 'roles', 'specific', 'filtered'])->default('all');
            $table->json('target_roles')->nullable(); // ['student', 'tutor']
            $table->json('target_users')->nullable(); // [1, 2, 3]
            $table->json('target_filters')->nullable(); // {status: 'active', join_date_after: '2024-01-01'}
            $table->timestamp('send_at')->nullable();
            $table->boolean('is_sent')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->integer('estimated_recipients')->default(0);
            $table->integer('actual_recipients')->nullable();
            $table->timestamps();
            
            $table->index(['is_sent', 'send_at']);
            $table->index(['admin_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('announcements');
    }
};