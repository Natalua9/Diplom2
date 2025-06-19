<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\TeacherDirection;

class Timing extends Model
{
    use HasFactory;
    protected $fillable = [
        'date',
        'time',
        'id_teacher',
    ];

    public function timingTeacher()
    {
        return $this->belongsTo(TeacherDirection::class, 'id_teacher');
    }
}
