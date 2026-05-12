<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LibrarySetting extends Model
{
    public const DEFAULT_LOAN_PERIOD_DAYS = 14;
    public const DEFAULT_MAX_ACTIVE_LOANS = 5;

    protected $table = 'library_settings';

    protected $fillable = [
        'loan_period_days',
        'max_active_loans',
    ];

    protected function casts(): array
    {
        return [
            'loan_period_days' => 'integer',
            'max_active_loans' => 'integer',
        ];
    }

    public static function singleton(): self
    {
        return self::query()->firstOrCreate(
            ['id' => 1],
            [
                'loan_period_days' => self::DEFAULT_LOAN_PERIOD_DAYS,
                'max_active_loans' => self::DEFAULT_MAX_ACTIVE_LOANS,
            ]
        );
    }
}
