<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSocialMobsTable extends Migration
{
    public function up()
    {
        Schema::create('social_mobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained()->cascadeOnDelete();
            $table->string('topic');
            $table->string('location');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time')->default(config('socialMob.default_end_time'));
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('social_mobs');
    }
}
