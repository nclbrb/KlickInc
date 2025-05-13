<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAmountToIssuesTable extends Migration
{
    public function up()
    {
        Schema::table('issues', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->nullable();
        });
    }

    public function down()
    {
        Schema::table('issues', function (Blueprint $table) {
            $table->dropColumn('amount');
        });
    }
}
