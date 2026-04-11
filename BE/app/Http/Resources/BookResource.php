<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'book_id' => $this->book_id,
            'title' => $this->title,
            'author' => $this->author,
            'genre' => $this->genre,
            'published_year' => $this->published_year,
            'cover' => $this->cover,
            'location' => $this->location,
            'is_digital' => (bool) $this->is_digital,
            'resource_type' => $this->resource_type,
            'file_format' => $this->file_format,
            'file_size' => $this->file_size,
            'download_count' => $this->download_count,
            'total_quantity' => $this->total_quantity,
            'available_quantity' => $this->available_quantity,
            'is_available' => (bool) $this->is_available,
        ];
    }
}
