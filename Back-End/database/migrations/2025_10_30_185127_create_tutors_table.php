<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_tutors_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tutors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('phone')->nullable();
            $table->integer('age');
            $table->enum('sex', ['male', 'female']);
            $table->string('country');
            $table->string('phone_code');
            $table->string('city')->nullable();
            $table->string('subcity')->nullable();
            $table->text('address');
            $table->text('bio')->nullable();
            $table->string('qualification');
            $table->integer('experience_years');
            $table->decimal('hourly_rate', 8, 2)->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tutors');
    }
};