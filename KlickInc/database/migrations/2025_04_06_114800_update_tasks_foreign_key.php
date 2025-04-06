<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Drop the existing foreign key
            $table->dropForeign(['assigned_to']);
            
            // Add the new foreign key referencing klick_users
            $table->foreign('assigned_to')
                  ->references('id')
                  ->on('klick_users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Drop the new foreign key
            $table->dropForeign(['assigned_to']);
            
            // Restore the original foreign key
            $table->foreign('assigned_to')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }
};
