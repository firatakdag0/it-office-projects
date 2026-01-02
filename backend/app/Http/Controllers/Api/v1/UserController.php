<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * List users based on role.
     */
    /**
     * List users based on role.
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'manager') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'manager') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'nullable|string|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:manager,field_staff',
            'phone' => 'nullable|string|max:20',
            'blood_group' => 'nullable|string|max:10',
            'driver_license' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'permissions' => 'nullable|array',
            'bank_name' => 'nullable|string|max:100',
            'iban' => 'nullable|string|max:34',
            'start_date' => 'nullable|date',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'blood_group' => $request->blood_group,
            'driver_license' => $request->driver_license,
            'department' => $request->department,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'address' => $request->address,
            'permissions' => $request->permissions,
            'bank_name' => $request->bank_name,
            'iban' => $request->iban,
            'start_date' => $request->start_date,
        ]);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        if ($request->user()->role !== 'manager') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'username' => 'nullable|string|max:255|unique:users,username,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:manager,field_staff',
            'phone' => 'nullable|string|max:20',
            'blood_group' => 'nullable|string|max:10',
            'driver_license' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'permissions' => 'nullable|array',
            'bank_name' => 'nullable|string|max:100',
            'iban' => 'nullable|string|max:34',
            'start_date' => 'nullable|date',
        ]);

        $userData = $request->only([
            'name',
            'email',
            'username',
            'role',
            'phone',
            'blood_group',
            'driver_license',
            'department',
            'emergency_contact_name',
            'emergency_contact_phone',
            'address',
            'permissions',
            'bank_name',
            'iban',
            'start_date'
        ]);

        if ($request->filled('password')) {
            $userData['password'] = bcrypt($request->password);
        }

        $user->update($userData);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        // Don't delete self
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Kendinizi silemezsiniz.'], 400);
        }

        $user->delete();
        return response()->json(['message' => 'Personel başarıyla silindi.']);
    }

    public function updatePermissions(Request $request, User $user)
    {
        if ($request->user()->role !== 'manager') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string'
        ]);

        $user->update(['permissions' => $request->permissions]);

        return response()->json($user);
    }
}
