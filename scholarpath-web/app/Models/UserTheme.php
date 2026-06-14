<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTheme extends Model
{
    protected $connection = 'sqlite';
    protected $fillable = ['user_id', 'theme'];
}
