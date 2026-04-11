<?php

namespace App\Http\Controllers;

use App\Http\Requests\BookIndexRequest;
use App\Http\Requests\BookUpsertRequest;
use App\Http\Resources\BookResource;
use App\Http\Resources\DigitalDocumentResource;
use App\Models\Book;

class BookController extends Controller
{
    public function index(BookIndexRequest $request)
    {
        $validated = $request->validated();
        $query = Book::query()->orderBy('book_id');
        $search = trim((string) ($validated['query'] ?? ''));

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', '%'.$search.'%')
                    ->orWhere('author', 'like', '%'.$search.'%')
                    ->orWhere('genre', 'like', '%'.$search.'%');
            });
        }

        if (array_key_exists('genre', $validated) && $validated['genre'] !== null) {
            $query->where('genre', $validated['genre']);
        }

        if (array_key_exists('is_available', $validated) && $validated['is_available'] !== null) {
            $query->where('is_available', (bool) $validated['is_available']);
        }

        if (array_key_exists('is_digital', $validated) && $validated['is_digital'] !== null) {
            $query->where('is_digital', (bool) $validated['is_digital']);
        }

        if (array_key_exists('resource_type', $validated) && $validated['resource_type'] !== null) {
            $query->where('resource_type', $validated['resource_type']);
        }

        $books = $query->paginate($validated['limit'] ?? 15, ['*'], 'page', $validated['page'] ?? 1)
            ->withQueryString();

        return BookResource::collection($books);
    }

    public function store(BookUpsertRequest $request)
    {
        $validated = $request->validated();
        $quantity = array_key_exists('quantity', $validated) ? (int) $validated['quantity'] : 1;

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

        return response()->json(new BookResource($book), 201);
    }

    public function update(BookUpsertRequest $request, Book $book)
    {
        $validated = $request->validated();
        $checkedOut = max(0, $book->total_quantity - $book->available_quantity);
        $nextQuantity = array_key_exists('quantity', $validated) ? (int) $validated['quantity'] : $book->total_quantity;

        if ($nextQuantity < $checkedOut) {
            return response()->json([
                'message' => 'So luong moi khong the nho hon so sach dang duoc muon.',
            ], 422);
        }

        $book->fill([
            'title' => $validated['title'],
            'author' => $validated['author'],
            'genre' => array_key_exists('genre', $validated) ? $validated['genre'] : $book->genre,
            'published_year' => array_key_exists('published_year', $validated) ? $validated['published_year'] : $book->published_year,
            'location' => array_key_exists('location', $validated) ? $validated['location'] : $book->location,
            'cover' => array_key_exists('cover', $validated) ? $validated['cover'] : $book->cover,
            'is_digital' => (bool) ($validated['is_digital'] ?? $book->is_digital),
            'resource_type' => array_key_exists('resource_type', $validated) ? $validated['resource_type'] : $book->resource_type,
            'file_format' => array_key_exists('file_format', $validated) ? $validated['file_format'] : $book->file_format,
            'file_size' => array_key_exists('file_size', $validated) ? $validated['file_size'] : $book->file_size,
            'download_count' => (int) ($validated['download_count'] ?? $book->download_count),
        ]);
        $book->total_quantity = $nextQuantity;
        $book->available_quantity = max(0, $nextQuantity - $checkedOut);
        $book->is_available = $book->available_quantity > 0;
        $book->save();

        return response()->json(new BookResource($book->fresh()));
    }

    public function destroy(Book $book)
    {
        $hasAnyBorrowing = $book->borrowings()->exists();

        if ($hasAnyBorrowing) {
            return response()->json([
                'message' => 'Khong the xoa sach da co lich su muon.',
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
            ->get();

        return DigitalDocumentResource::collection($documents);
    }
}
