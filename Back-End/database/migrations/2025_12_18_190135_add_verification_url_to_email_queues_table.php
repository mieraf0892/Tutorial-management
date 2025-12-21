<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('email_queues', function (Blueprint $table) {
            $table->string('verification_url')->nullable()->after('token');
            // Also add is_verification column if it doesn't exist
            if (!Schema::hasColumn('email_queues', 'is_verification')) {
                $table->boolean('is_verification')->default(false)->after('verification_url');
            }
        });
    }

    public function down()
    {
        Schema::table('email_queues', function (Blueprint $table) {
            $table->dropColumn(['verification_url', 'is_verification']);
        });
    }
};