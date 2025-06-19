<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;
      protected $table = 'subscription';
      protected $fillable = [
        'id_user',
        'id_direction',
        'count_lessons',
        'status',
        'expires_at',
    ];

    /**
     * Получить пользователя, которому принадлежит абонемент.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    /**
     * Получить направление, к которому относится абонемент.
     */
    public function direction()
    {
        return $this->belongsTo(Direction::class, 'id_direction');
    }
}
