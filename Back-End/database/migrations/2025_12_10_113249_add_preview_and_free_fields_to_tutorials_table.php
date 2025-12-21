<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('tutorials', function (Blueprint $table) {
        $table->boolean('is_free')->default(false);
        $table->boolean('has_preview')->default(true);
        $table->text('short_description')->nullable();
        $table->text('preview_description')->nullable();
        $table->integer('preview_lessons_count')->default(2);
        $table->string('preview_video_url')->nullable();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tutorials', function (Blueprint $table) {
            //
        });
    }
};
