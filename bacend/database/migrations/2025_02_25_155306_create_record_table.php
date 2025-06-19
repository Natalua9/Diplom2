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
        Schema::create('record', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_user')->constrained('users');
            $table->foreignId('id_td')->constrained('timings');
            $table->date('date_record');
            $table->time('time_record');
            $table->enum('status', ['новая', 'проведена', 'отменена'])->default('новая');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('record');
    }
};
