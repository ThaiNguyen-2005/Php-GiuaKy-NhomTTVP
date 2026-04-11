<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'genre' => ['nullable', 'string', 'max:100'],
            'published_year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'location' => ['nullable', 'string', 'max:100'],
            'cover' => ['nullable', 'url', 'max:2048'],
            'quantity' => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_digital' => ['nullable', 'boolean'],
            'resource_type' => ['nullable', 'string', 'max:50'],
            'file_format' => ['nullable', 'string', Rule::in(['PDF', 'EPUB', 'AUDIO', 'SLIDES'])],
            'file_size' => ['nullable', 'string', 'max:20'],
            'download_count' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
