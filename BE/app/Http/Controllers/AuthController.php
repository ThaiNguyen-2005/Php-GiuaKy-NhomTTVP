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
}
