<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('field_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('description', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
        Schema::create('fields', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('field_categories')->onDelete('cascade');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('location', 100);
            $table->decimal('price_per_hour', 10, 2);
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->timestamps();
        });
        Schema::create('field_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('field_id')->constrained('fields')->onDelete('cascade');
            $table->text('image_url');
            $table->boolean('is_primary')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });
        Schema::create('field_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('field_id')->constrained('fields')->onDelete('cascade');
            $table->tinyInteger('day_of_week')->comment('0=Sunday, 1=Monday, ..., 6=Saturday');
            $table->time('open_time');
            $table->time('close_time');
            $table->boolean('is_open')->default(true);
        });
        Schema::create('field_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('field_id')->constrained('fields')->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['available', 'booked', 'locked'])->default('available');
            $table->uuid('booking_id')->nullable()->comment('diisi oleh booking-service');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('field_categories');
        Schema::dropIfExists('fields');
        Schema::dropIfExists('field_images');
        Schema::dropIfExists('field_schedules');
        Schema::dropIfExists('field_slots');
    }
};
