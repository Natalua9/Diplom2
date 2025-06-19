<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('teacher_directions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_teacher')->constrained('users');
            $table->foreignId('id_directions')->constrained('directions');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('teacher_directions');
    }
};
