<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'role' => 'required|in:student,admin',
            'identifier' => 'required|string',
            'password' => 'required|string',
        ]);

        $role = $request->role;
        $identifier = $request->identifier;
        $password = $request->password;

        $table = $role === 'admin' ? 'librarians' : 'members';
        $idColumn = $role === 'admin' ? 'librarian_id' : 'member_id';

        // Find user by ID or Email
        $user = DB::table($table)
            ->where($idColumn, $identifier)
            ->orWhere('email', $identifier)
            ->first();

        // Check if user exists and password matches
        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Tài khoản hoặc mật khẩu không chính xác.'
            ], 401);
        }

        // Return user info excluding password
        unset($user->password);

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user' => $user,
            'role' => $role
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:members,email',
            'password' => 'required|string|min:6',
            'phone_number' => 'nullable|string|max:15',
        ]);

        $memberId = DB::table('members')->insertGetId([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'join_date' => now()->toDateString(),
        ]);

        $user = DB::table('members')->where('member_id', $memberId)->first();
        unset($user->password);

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user' => $user,
            'role' => 'student'
        ], 201);
    }

    public function getUser(Request $request, $id)
    {
        $role = $request->query('role');
        
        if ($role !== 'student') {
            return response()->json(['message' => 'Không được phép lấy thông tin admin. Chỉ được phép lấy thông tin student (role=student).'], 403);
        }

        $user = DB::table('members')->where('member_id', $id)->first();

        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
        }

        unset($user->password);

        return response()->json([
            'user' => $user,
            'role' => 'student'
        ]);
    }

    public function getAllMembers(Request $request)
    {
        $members = DB::table('members')->get()->map(function($member) {
            unset($member->password);
            return $member;
        });

        return response()->json($members);
    }
}
