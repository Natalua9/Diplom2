<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\TeacherDirection;
use App\Models\Record;
use App\Models\Job_status; // Убедитесь, что модель Job_status импортирована
// use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;


class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'password',
        'phone',
        'gender',
        'age',
        'photo',
        'role',
        'id_job_status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    protected $appends = ['job_status_name']; // Добавляем новое поле
    public function teacherDirections()
    {
        return $this->hasMany(TeacherDirection::class, 'id_teacher');
    }
    public function comments()
    {
        return $this->hasMany(Comment::class, 'id_user');
    }

    public function record()
    {
        return $this->hasMany(Record::class, 'id_user');
    }
    public function jobStatus()
    {
        return $this->belongsTo(Job_status::class, 'id_job_status');
    }
    /**
     * Аксессор для получения имени статуса работы.
     * Атрибут будет называться job_status_name в JSON.
     */
    public function getJobStatusNameAttribute()
    {
        // Проверяем, существует ли связанный статус и у него есть поле 'status'
        if ($this->jobStatus && isset($this->jobStatus->status)) {
            return $this->jobStatus->status;
        }
        return null; // или 'не указан', или другое значение по умолчанию
    }
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}