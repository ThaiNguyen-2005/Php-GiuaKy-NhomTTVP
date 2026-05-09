<?php

namespace Tests\Feature;

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class DigitalDocumentAccessTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_digital_document_payload_includes_signed_access_links(): void
    {
        $response = $this->getJson('/api/digital-documents')
            ->assertOk();

        $payload = $response->json();
        $document = $payload['data'][0] ?? $payload[0] ?? null;

        $this->assertIsArray($document);
        $this->assertNotEmpty($document['open_url']);
        $this->assertNotEmpty($document['download_url']);
        $this->assertArrayHasKey('has_attached_file', $document);
    }

    public function test_signed_digital_document_route_serves_preview_and_updates_count(): void
    {
        $book = Book::query()->where('is_digital', true)->firstOrFail();
        $initialDownloads = $book->download_count;
        $url = URL::temporarySignedRoute(
            'digital-documents.download',
            now()->addMinutes(30),
            ['book' => $book->book_id, 'disposition' => 'inline'],
        );

        $this->get($url)
            ->assertOk()
            ->assertSee('Digital resource preview');

        $this->assertDatabaseHas('books', [
            'book_id' => $book->book_id,
            'download_count' => $initialDownloads + 1,
        ]);
    }
}
