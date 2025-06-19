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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('token')->nullable();
            $table->string('full_name', 255)->nullable();
            $table->string('phone', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->enum('gender', ['женщина', 'мужчина'])->nullable();
            $table->date('age')->nullable();
            $table->string('photo', 255)->nullable();
            $table->string('password', 255);
            $table->enum('role', ['admin', 'user', 'teacher'])->default('user');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
