<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\MemberIndexRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\AuthenticatedUserResource;
use App\Http\Resources\MemberResource;
use App\Models\Librarian;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $validated = $request->validated();
        $role = $validated['role'];
        $identifier = trim($validated['identifier']);
        $password = $validated['password'];

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
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $token = $user->createToken($user->getRoleName().'-session', ['role:'.$user->getRoleName()])->plainTextToken;

        return response()->json([
            'message' => 'Dang nhap thanh cong',
            'user' => AuthenticatedUserResource::make($user),
            'role' => $user->getRoleName(),
            'token' => $token,
        ]);
    }

    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = Member::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'password' => $validated['password'],
            'join_date' => now()->toDateString(),
        ]);

        $token = $user->createToken('student-session', ['role:student'])->plainTextToken;

        return response()->json([
            'message' => 'Dang ky thanh cong',
            'user' => AuthenticatedUserResource::make($user),
            'role' => 'student',
            'token' => $token,
        ], 201);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => AuthenticatedUserResource::make($user),
            'role' => method_exists($user, 'getRoleName') ? $user->getRoleName() : null,
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        if (! empty($validated['password'])) {
            if (empty($validated['current_password']) || ! Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Mat khau hien tai khong dung.'], 422);
            }

            $user->password = $validated['password'];
        }

        $user->name = $validated['name'];

        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
        }

        if (array_key_exists('phone_number', $validated)) {
            $user->phone_number = $validated['phone_number'];
        }

        $user->save();

        return response()->json([
            'message' => 'Cap nhat ho so thanh cong.',
            'user' => AuthenticatedUserResource::make($user->fresh()),
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

    public function getAllMembers(MemberIndexRequest $request)
    {
        $validated = $request->validated();
        $query = Member::query()->orderBy('member_id');
        $search = trim((string) ($validated['query'] ?? ''));

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone_number', 'like', '%'.$search.'%');
            });
        }

        $members = $query->paginate($validated['limit'] ?? 15, ['*'], 'page', $validated['page'] ?? 1)
            ->withQueryString();

        return MemberResource::collection($members);
    }
}
