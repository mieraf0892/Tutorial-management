<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateConversationsTable extends Migration
{
    public function up()
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_one')->index();
            $table->unsignedBigInteger('user_two')->index();
            $table->unsignedBigInteger('last_message_id')->nullable()->index();
            $table->timestamps();

            // Optionally add foreign keys if you want referential integrity:
            // $table->foreign('user_one')->references('id')->on('users')->onDelete('cascade');
            // $table->foreign('user_two')->references('id')->on('users')->onDelete('cascade');
            // $table->foreign('last_message_id')->references('id')->on('messages')->onDelete('set null');

            // Prevent duplicate conversation rows (user_one + user_two pair)
            $table->unique(['user_one', 'user_two']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('conversations');
    }
}
