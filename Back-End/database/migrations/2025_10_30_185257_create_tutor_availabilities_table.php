<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_tutor_availabilities_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tutor_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained()->onDelete('cascade');
            $table->string('day_of_week'); // Monday, Tuesday, etc.
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tutor_availabilities');
    }
};