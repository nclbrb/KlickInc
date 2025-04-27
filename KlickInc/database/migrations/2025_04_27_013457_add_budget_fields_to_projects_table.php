<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBudgetFieldsToProjectsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->decimal('budget', 15, 2)->nullable()->after('status');
            $table->decimal('actual_expenditure', 15, 2)->default(0)->after('budget');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('budget');
            $table->dropColumn('actual_expenditure');
        });
    }
}
