<?php
// database/migrations/2024_01_01_000003_create_template_usage_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('template_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('announcement_templates')->onDelete('cascade');
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('used_at');
            $table->timestamps();
            
            $table->unique(['template_id', 'admin_id', 'used_at']);
            $table->index(['admin_id', 'used_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('template_usage');
    }
};