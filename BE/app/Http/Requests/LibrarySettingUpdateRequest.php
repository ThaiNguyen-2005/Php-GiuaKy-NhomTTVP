<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LibrarySettingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'loan_period_days' => ['required', 'integer', 'min:1', 'max:365'],
            'max_active_loans' => ['required', 'integer', 'min:1', 'max:50'],
        ];
    }
}
