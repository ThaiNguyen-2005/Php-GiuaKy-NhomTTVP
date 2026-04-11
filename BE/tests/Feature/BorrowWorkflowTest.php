<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Borrowing;
use App\Models\Librarian;
use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BorrowWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_request_borrow_rejects_duplicate_active_request(): void
    {
        $member = Member::query()->findOrFail(1);
        $token = $member->createToken('member-access', ['role:student']);

        $this->withToken($token->plainTextToken)
            ->postJson('/api/requests', ['book_id' => 1])
            ->assertStatus(422)
            ->assertJson([
                'message' => 'Ban da co mot yeu cau hoac phieu muon cho cuon sach nay.',
            ]);
    }

    public function test_request_borrow_rejects_when_active_limit_is_reached(): void
    {
        $member = Member::query()->findOrFail(2);
        $token = $member->createToken('member-limit-access', ['role:student']);

        Book::query()->create([
            'title' => 'Book 6',
            'author' => 'Author 6',
            'genre' => 'Reference',
            'published_year' => 2024,
            'is_available' => true,
            'cover' => null,
            'location' => 'Shelf Z',
            'is_digital' => false,
            'resource_type' => null,
            'file_format' => null,
            'file_size' => null,
            'download_count' => 0,
            'total_quantity' => 1,
            'available_quantity' => 1,
        ]);

        Borrowing::query()->insert([
            [
                'book_id' => 1,
                'member_id' => 2,
                'librarian_id' => null,
                'status' => 'pending',
                'borrow_date' => '2026-04-07',
                'due_date' => null,
                'return_date' => null,
            ],
            [
                'book_id' => 3,
                'member_id' => 2,
                'librarian_id' => null,
                'status' => 'pending',
                'borrow_date' => '2026-04-07',
                'due_date' => null,
                'return_date' => null,
            ],
            [
                'book_id' => 4,
                'member_id' => 2,
                'librarian_id' => null,
                'status' => 'borrowed',
                'borrow_date' => '2026-04-07',
                'due_date' => '2026-04-21',
                'return_date' => null,
            ],
            [
                'book_id' => 5,
                'member_id' => 2,
                'librarian_id' => null,
                'status' => 'borrowed',
                'borrow_date' => '2026-04-07',
                'due_date' => '2026-04-21',
                'return_date' => null,
            ],
        ]);

        $this->withToken($token->plainTextToken)
            ->postJson('/api/requests', ['book_id' => 6])
            ->assertStatus(422)
            ->assertJson([
                'message' => 'Ban da dat gioi han 5 yeu cau dang hoat dong.',
            ]);
    }

    public function test_approve_and_return_update_inventory_transactionally(): void
    {
        $librarian = Librarian::query()->findOrFail(1);
        $token = $librarian->createToken('librarian-access', ['role:admin']);

        $this->withToken($token->plainTextToken)
            ->postJson('/api/requests/2/approve')
            ->assertOk()
            ->assertJsonPath('loan.status', 'borrowed')
            ->assertJsonPath('loan.librarian_id', 1)
            ->assertJsonPath('loan.due_date', today()->addDays(14)->toDateString());

        $this->assertDatabaseHas('books', [
            'book_id' => 2,
            'available_quantity' => 0,
            'is_available' => 0,
        ]);

        $this->withToken($token->plainTextToken)
            ->postJson('/api/requests/2/return')
            ->assertOk()
            ->assertJsonPath('loan.status', 'returned')
            ->assertJsonPath('loan.return_date', today()->toDateString());

        $this->assertDatabaseHas('books', [
            'book_id' => 2,
            'available_quantity' => 1,
            'is_available' => 1,
        ]);
    }
}
