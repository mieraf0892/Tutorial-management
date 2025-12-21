<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tutorials', function (Blueprint $table) {
            // Rename 'students' column to 'enrollment_count'
            $table->renameColumn('students', 'enrollment_count');
        });
    }

    public function down()
    {
        Schema::table('tutorials', function (Blueprint $table) {
            $table->renameColumn('enrollment_count', 'students');
        });
    }
};