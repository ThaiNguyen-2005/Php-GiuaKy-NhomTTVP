<?php
function testApi($method, $url, $data = null) {
    echo "Testing $method $url\n";
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => $method,
            'content' => $data ? json_encode($data) : null,
            'ignore_errors' => true,
        ]
    ];
    $context  = stream_context_create($options);
    $result = file_get_contents("http://127.0.0.1:8000" . $url, false, $context);
    echo $result . "\n\n";
    return json_decode($result, true);
}

// 1. Register User
$res = testApi('POST', '/api/register', [
    'name' => 'API Test User',
    'email' => 'api_test_' . time() . '@example.com',
    'password' => '123456',
    'phone_number' => '123456789'
]);
$memberId = $res['user']['member_id'] ?? null;

// 2. Add Book
$res = testApi('POST', '/api/admin/books', [
    'title' => 'Test Book ' . time(),
    'author' => 'Author Test',
    'genre' => 'Testing',
    'published_year' => 2026
]);
$bookId = $res['book']['book_id'] ?? null;

// 3. Search Book
testApi('GET', '/api/books/search?query=Testing');

// 4. Request Borrow
if ($memberId && $bookId) {
    $res = testApi('POST', '/api/borrow/request', [
        'member_id' => $memberId,
        'book_id' => $bookId
    ]);
    $loanId = $res['loan']['loan_id'] ?? null;

    if ($loanId) {
        // We know we need a librarian ID. Let's see if 1 exists or create one.
        // Assuming librarian_id 1 exists (from previous tests or seed). 
        // If not, this might fail, but it tests the validation.
        testApi('PUT', "/api/admin/borrow/$loanId/approve", [
            'librarian_id' => 1
        ]);

        testApi('PUT', "/api/admin/borrow/$loanId/return", [
            'librarian_id' => 1
        ]);
    }
}

// 5. Delete Book
if ($bookId) {
    testApi('DELETE', "/api/admin/books/$bookId");
}
