<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::query()->orderBy('book_id');
        $search = $request->string('query')->trim()->value();

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', '%'.$search.'%')
                    ->orWhere('author', 'like', '%'.$search.'%')
                    ->orWhere('genre', 'like', '%'.$search.'%');
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $this->validateBook($request);
        $quantity = max(1, (int) ($validated['quantity'] ?? 1));

        $book = Book::query()->create([
            'title' => $validated['title'],
            'author' => $validated['author'],
            'genre' => $validated['genre'] ?? null,
            'published_year' => $validated['published_year'] ?? null,
            'location' => $validated['location'] ?? null,
            'cover' => $validated['cover'] ?? null,
            'is_digital' => (bool) ($validated['is_digital'] ?? false),
            'resource_type' => $validated['resource_type'] ?? null,
            'file_format' => $validated['file_format'] ?? null,
            'file_size' => $validated['file_size'] ?? null,
            'download_count' => (int) ($validated['download_count'] ?? 0),
            'total_quantity' => $quantity,
            'available_quantity' => $quantity,
            'is_available' => $quantity > 0,
        ]);

        return response()->json($book, 201);
    }

    public function update(Request $request, Book $book)
    {
        $validated = $this->validateBook($request);
        $checkedOut = max(0, $book->total_quantity - $book->available_quantity);
        $nextQuantity = isset($validated['quantity']) ? max(1, (int) $validated['quantity']) : $book->total_quantity;

        if ($nextQuantity < $checkedOut) {
            return response()->json([
                'message' => 'So luong moi khong the nho hon so sach dang duoc muon.',
            ], 422);
        }

        $book->fill([
            'title' => $validated['title'],
            'author' => $validated['author'],
            'genre' => $validated['genre'] ?? null,
            'published_year' => $validated['published_year'] ?? null,
            'location' => $validated['location'] ?? null,
            'cover' => $validated['cover'] ?? null,
            'is_digital' => (bool) ($validated['is_digital'] ?? $book->is_digital),
            'resource_type' => $validated['resource_type'] ?? null,
            'file_format' => $validated['file_format'] ?? null,
            'file_size' => $validated['file_size'] ?? null,
            'download_count' => (int) ($validated['download_count'] ?? $book->download_count),
        ]);
        $book->total_quantity = $nextQuantity;
        $book->available_quantity = max(0, $nextQuantity - $checkedOut);
        $book->is_available = $book->available_quantity > 0;
        $book->save();

        return response()->json($book->fresh());
    }

    public function destroy(Book $book)
    {
        $hasActiveBorrowing = $book->borrowings()
            ->whereIn('status', ['pending', 'borrowed'])
            ->exists();

        if ($hasActiveBorrowing) {
            return response()->json([
                'message' => 'Khong the xoa sach dang co phieu muon hoac yeu cau cho xu ly.',
            ], 422);
        }

        $book->delete();

        return response()->json([
            'message' => 'Xoa sach thanh cong.',
        ]);
    }

    public function getDigitalDocuments()
    {
        $documents = Book::query()
            ->where('is_digital', true)
            ->orWhereNotNull('file_format')
            ->orderByDesc('download_count')
            ->get()
            ->map(function (Book $book) {
                $format = strtoupper($book->file_format ?: 'PDF');

                return [
                    'id' => $book->book_id,
                    'title' => $book->title,
                    'author' => $book->author,
                    'type' => $book->resource_type ?: ($book->genre ?: 'Tai lieu'),
                    'format' => $format,
                    'size' => $book->file_size ?: 'N/A',
                    'color' => match ($format) {
                        'PDF' => 'bg-red-500',
                        'EPUB' => 'bg-blue-500',
                        'AUDIO' => 'bg-purple-500',
                        'SLIDES' => 'bg-orange-500',
                        default => 'bg-primary',
                    },
                    'cover' => $book->cover,
                    'downloads' => $book->download_count,
                ];
            });

        return response()->json($documents);
    }

    private function validateBook(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'genre' => 'nullable|string|max:100',
            'published_year' => 'nullable|integer|min:1900|max:2100',
            'location' => 'nullable|string|max:100',
            'cover' => 'nullable|url|max:2048',
            'quantity' => 'nullable|integer|min:1|max:999',
            'is_digital' => 'nullable|boolean',
            'resource_type' => 'nullable|string|max:50',
            'file_format' => ['nullable', 'string', Rule::in(['PDF', 'EPUB', 'AUDIO', 'SLIDES'])],
            'file_size' => 'nullable|string|max:20',
            'download_count' => 'nullable|integer|min:0',
        ]);
    }
}
