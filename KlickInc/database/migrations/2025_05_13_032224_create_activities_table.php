<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateActivitiesTable extends Migration
{
    public function up()
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('klick_users')->onDelete('cascade');
            $table->morphs('subject'); // This will create subject_id and subject_type columns
            $table->string('type'); // e.g., 'amount_updated'
            $table->json('changes')->nullable(); // Store old and new values
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('activities');
    }
}
