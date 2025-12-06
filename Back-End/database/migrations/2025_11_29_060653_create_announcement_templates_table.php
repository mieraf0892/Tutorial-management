<?php
// database/migrations/2024_01_01_000002_create_announcement_templates_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('announcement_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('title');
            $table->text('message');
            $table->enum('suggested_target_type', ['all', 'roles', 'specific', 'filtered'])->default('all');
            $table->enum('suggested_priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->integer('usage_count')->default(0);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['created_by', 'usage_count']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('announcement_templates');
    }
};