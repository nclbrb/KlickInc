<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Drop the user_id column if it exists
            if (Schema::hasColumn('notifications', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
            
            // Make sure the required columns exist
            if (!Schema::hasColumn('notifications', 'notifiable_id')) {
                $table->unsignedBigInteger('notifiable_id');
            }
            
            if (!Schema::hasColumn('notifications', 'notifiable_type')) {
                $table->string('notifiable_type');
            }
            
            // Add index for better performance
            $table->index(['notifiable_id', 'notifiable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Revert the changes if needed
            if (!Schema::hasColumn('notifications', 'user_id')) {
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            }
            
            // Drop the polymorphic columns if they exist
            if (Schema::hasColumn('notifications', 'notifiable_id')) {
                $table->dropColumn('notifiable_id');
            }
            
            if (Schema::hasColumn('notifications', 'notifiable_type')) {
                $table->dropColumn('notifiable_type');
            }
        });
    }
};
