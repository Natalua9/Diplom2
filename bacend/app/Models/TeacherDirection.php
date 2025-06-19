<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Timing;
use App\Models\Record;


use App\Models\Direction;


class TeacherDirection extends Model
{
    protected $table = 'teacher_directions';
    
    protected $fillable = ['id_teacher', 'id_directions'];

    public function direction()
    {
        return $this->belongsTo(Direction::class, 'id_directions');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'id_teacher');
    }
    public function timing()
    {
        return $this->hasMany(Timing::class, 'id_teacher');
    }
 
}