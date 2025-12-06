<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_attendances_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('tutorial_id')->constrained()->onDelete('cascade');
            $table->foreignId('tutorial_session_id')->nullable()->constrained()->onDelete('cascade');
            $table->dateTime('session_date');
            $table->enum('status', ['present', 'absent', 'late', 'excused'])->default('present');
            $table->integer('duration_minutes')->default(0);
            $table->text('instructor_notes')->nullable();
            $table->string('session_type')->default('regular');
            $table->timestamps();

            // One attendance record per student per session
            $table->unique(['user_id', 'tutorial_session_id']);
            
            $table->index(['user_id', 'tutorial_id']);
            $table->index(['user_id', 'session_date']); // Fixed: array syntax
            $table->index(['tutorial_id', 'session_date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('attendances');
    }
};