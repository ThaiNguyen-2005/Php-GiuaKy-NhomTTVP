<?php

namespace App\Http\Controllers;

use App\Models\Librarian;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'role' => 'required|in:student,admin',
            'identifier' => 'required|string',
            'password' => 'required|string',
        ]);

        $role = $request->string('role')->value();
        $identifier = $request->string('identifier')->trim()->value();
        $password = $request->string('password')->value();

        $user = $role === 'admin'
            ? Librarian::query()
                ->where('librarian_id', $identifier)
                ->orWhere('email', $identifier)
                ->first()
            : Member::query()
                ->where('member_id', $identifier)
                ->orWhere('email', $identifier)
                ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Tai khoan hoac mat khau khong chinh xac.',
            ], 401);
        }

        $token = $user->createToken($user->getRoleName().'-session', ['role:'.$user->getRoleName()])->plainTextToken;

        return response()->json([
            'message' => 'Dang nhap thanh cong',
            'user' => $user,
            'role' => $user->getRoleName(),
            'token' => $token,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:members,email',
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'phone_number' => 'nullable|string|max:15',
        ]);

        $user = Member::query()->create([
            'name' => $request->string('name')->value(),
            'email' => $request->string('email')->value(),
            'phone_number' => $request->string('phone_number')->value() ?: null,
            'password' => $request->string('password')->value(),
            'join_date' => now()->toDateString(),
        ]);

        $token = $user->createToken('student-session', ['role:student'])->plainTextToken;

        return response()->json([
            'message' => 'Dang ky thanh cong',
            'user' => $user,
            'role' => 'student',
            'token' => $token,
        ], 201);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => $user,
            'role' => method_exists($user, 'getRoleName') ? $user->getRoleName() : null,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $table = $user instanceof Librarian ? 'librarians' : 'members';

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique($table, 'email')->ignore($user->getKey(), $user->getKeyName()),
            ],
            'phone_number' => 'nullable|string|max:15',
            'current_password' => 'nullable|string',
            'password' => ['nullable', 'confirmed', Password::min(8)->letters()->numbers()],
        ]);

        if (! empty($validated['password'])) {
            if (empty($validated['current_password']) || ! Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Mat khau hien tai khong dung.'], 422);
            }

            $user->password = $validated['password'];
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'] ?? null;
        $user->phone_number = $validated['phone_number'] ?? null;
        $user->save();

        return response()->json([
            'message' => 'Cap nhat ho so thanh cong.',
            'user' => $user->fresh(),
            'role' => $user->getRoleName(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Dang xuat thanh cong.',
        ]);
    }

    public function getAllMembers()
    {
        $members = Member::query()
            ->orderBy('member_id')
            ->get(['member_id', 'name', 'email', 'phone_number', 'join_date']);

        return response()->json($members);
    }
}
