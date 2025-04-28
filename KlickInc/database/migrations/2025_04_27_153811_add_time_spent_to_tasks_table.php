<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::table('tasks', function (Blueprint $table) {
        $table->integer('time_spent')->nullable();  // Add the time_spent column
    });
}

public function down()
{
    Schema::table('tasks', function (Blueprint $table) {
        $table->dropColumn('time_spent');  // Drop the time_spent column if rolling back
    });
}

};
