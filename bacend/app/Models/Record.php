<?php

namespace App\Models;
use App\Models\TeacherDirection;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    protected $table = 'record';

    protected $fillable = [
        'id_user',
        'id_td',
        'id_subscription',
        'date_record',
        'time_record',
        'status',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
    public function td()
    {
        return $this->belongsTo(TeacherDirection::class, 'id_td');
    }
    public function commentary()
    {
        return $this->hasMany(Comment::class, 'id_record');
    }
       // Опционально: связь с абонементом
    public function subscription()
    {
       return $this->belongsTo(Subscription::class, 'id_subscription'); // Предполагая, что есть модель Subscription
    }
}
