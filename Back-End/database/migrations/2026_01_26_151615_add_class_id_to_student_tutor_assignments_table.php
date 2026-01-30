<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('student_tutor_assignments', function (Blueprint $table) {
            $table->foreignId('class_id')
                  ->nullable()
                  ->constrained('classes')
                  ->onDelete('set null')
                  ->after('student_id');
        });
    }

    public function down()
    {
        Schema::table('student_tutor_assignments', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
            $table->dropColumn('class_id');
        });
    }
};