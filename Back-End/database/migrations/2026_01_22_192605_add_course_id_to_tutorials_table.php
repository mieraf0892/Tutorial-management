<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_course_id_to_tutorials_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCourseIdToTutorialsTable extends Migration
{
    public function up()
    {
        Schema::table('tutorials', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->constrained('courses')->onDelete('set null');
            $table->string('enrollment_code')->nullable()->unique();
            $table->integer('max_capacity')->default(30)->after('enrollment_count');
            $table->string('batch_name')->nullable()->after('title');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('schedule')->nullable();
            
            // Rename enrollment_count to current_enrollment for clarity
            if (Schema::hasColumn('tutorials', 'enrollment_count')) {
                $table->renameColumn('enrollment_count', 'current_enrollment');
            }
        });
    }

    public function down()
    {
        Schema::table('tutorials', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropColumn(['course_id', 'enrollment_code', 'max_capacity', 
                               'batch_name', 'start_date', 'end_date', 'schedule']);
            
            if (Schema::hasColumn('tutorials', 'current_enrollment')) {
                $table->renameColumn('current_enrollment', 'enrollment_count');
            }
        });
    }
}