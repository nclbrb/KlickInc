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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->comment('Uploader ID')->constrained('klick_users')->onDelete('cascade');
            $table->morphs('fileable'); // This will create fileable_id (unsignedBigInteger) and fileable_type (string)
            $table->string('original_filename');
            $table->string('stored_filename')->comment('Path relative to the disk root');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->comment('File size in bytes');
            $table->string('disk')->comment('Filesystem disk used for storage');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};