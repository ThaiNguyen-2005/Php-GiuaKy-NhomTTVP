<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Librarian extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'librarians';

    protected $primaryKey = 'librarian_id';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'password',
        'hire_date',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
            'password' => 'hashed',
        ];
    }

    public function processedBorrowings(): HasMany
    {
        return $this->hasMany(Borrowing::class, 'librarian_id', 'librarian_id');
    }

    public function getRoleName(): string
    {
        return 'admin';
    }
}
