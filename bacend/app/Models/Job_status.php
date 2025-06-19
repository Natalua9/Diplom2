<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job_status extends Model
{
    use HasFactory;
    protected $table = 'job_status';

    protected $fillable = [
        'status',
    ];
     public function user()
    {
        return $this->hasMany(User::class, 'id_job_status');
    }
}
