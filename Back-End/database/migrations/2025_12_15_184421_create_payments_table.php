<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Use 'table' here, NOT 'create'
        Schema::table('payments', function (Blueprint $table) {
            // Adding the missing course_id column
            $table->unsignedBigInteger('course_id')->nullable()->after('user_id');
            
            // Add the foreign key to link it to your courses table
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');
        });
    }
};