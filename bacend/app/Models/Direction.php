<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\TeacherDirection;


class Direction extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'photo',
    ];
    public function teacherDirections() {
        return $this->hasMany(TeacherDirection::class, 'id_directions', 'id');
        // return $this->hasMany(TeacherDirection::class, 'id_directions');
    }
}
