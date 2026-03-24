<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | AuthController
    |--------------------------------------------------------------------------
    |
    | Handles Sanctum token-based authentication for the CRM.
    |
    | Flow:
    |   1. React POSTs { email, password } to POST /api/auth/login
    |   2. We validate credentials and issue a Sanctum personal access token
    |   3. Frontend stores the token (sessionStorage) and attaches it as
    |      Authorization: Bearer {token} on every subsequent request
    |   4. On logout, only the current token is deleted (not all sessions)
    |
    | The user object returned on login is shaped to replace the prototype's
    | DEMO_USERS object, giving React everything it needs to build the sidebar,
    | scope the UI, and populate the assign-to dropdown (_staffIdMap).
    |
    */

    /**
     * POST /api/auth/login
     *
     * Replaces the prototype's doLogin() DEMO_USERS dict lookup.
     *
     * Request body:
     *   { "email": "priya@easyfinancewale.in", "password": "mgr123" }
     *
     * Success (200):
     *   { "success": true, "token": "1|abc123...", "user": { ...profile } }
     *
     * Failure (422):
     *   { "message": "Invalid credentials.", "errors": { "email": [...] } }
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'string'], // Re-using 'email' field for simplicity or rename to 'login'
            'password' => ['required', 'string'],
            'role'     => ['required', 'string'],
        ]);

        $login = $request->email;
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $user = User::where($field, $login)->first();

        if (! $user || ! Hash::check($request->password, $user->password) || $user->role !== $request->role) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials or role mismatch.'],
            ]);
        }

        // Block deactivated accounts — mirrors the prototype's role mismatch guard
        if ($user->status === 'Inactive') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Contact your administrator.',
            ], 403);
        }

        // Single-session enforcement: revoke all old tokens before issuing a new one.
        // This prevents token accumulation and mirrors the single-tab prototype model.
        $user->tokens()->delete();

        // Token name encodes the role for audit log readability
        $token = $user->createToken("crm-{$user->role}-session")->plainTextToken;

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ]);
    }

    /**
     * POST /api/auth/logout
     *
     * Revokes only the token used for this request (not all tokens).
     * The prototype calls fetch('/api/auth/logout') fire-and-forget on logout.
     *
     * Requires: Authorization: Bearer {token}
     * Response (200): { "success": true, "message": "Logged out successfully." }
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * GET /api/auth/me
     *
     * Returns the authenticated user's full profile without re-authenticating.
     * Called by the React app on page refresh to restore session state from
     * a token stored in sessionStorage.
     *
     * Requires: Authorization: Bearer {token}
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user'    => $this->formatUser($request->user()->load('franchise')),
        ]);
    }

    /**
     * POST /api/settings/profile
     *
     * Updates the authenticated user's profile names, phone, and password.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'phone'    => ['required', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $user->name = $validated['name'];
        $user->phone = $validated['phone'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user'    => $this->formatUser($user),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Builds the standardised user payload returned by login() and me().
     *
     * Designed to replace the prototype's combined DEMO_USERS + ALL_STAFF shape:
     *
     *   Prototype: { name, role, initials, dept, teamMembers[], franchiseCode }
     *   This API:  { id, name, role, initials, department, team_members[], ... }
     *
     * team_members is eagerly loaded for admin/manager so the React app can:
     *   - Build the "Assign To" dropdown without a second API call
     *   - Populate _staffIdMap (name → id) used by addLead()
     */
    private function formatUser(User $user): array
    {
        // Load team members for roles that manage people.
        // Staff and DSA get an empty array — they have no direct reports.
        $teamMembers = [];
        if (in_array($user->role, ['admin', 'manager'])) {
            $teamMembers = $user->teamMembers()
                               ->active()
                               ->orderBy('name')
                               ->get(['id', 'name', 'role', 'department', 'emp_code'])
                               ->toArray();
        }

        return [
            'id'             => $user->id,
            'emp_code'       => $user->emp_code,       // 'EF-002'
            'name'           => $user->name,
            'email'          => $user->email,
            'role'           => $user->role,            // 'admin'|'manager'|'staff'|'dsa'
            'department'     => $user->department,      // 'Home Loans'
            'phone'          => $user->phone,
            'status'         => $user->status,
            'joining_date'   => $user->joining_date?->toDateString(),
            'initials'       => $user->initials,        // accessor: 'PS'
            'team_leader_id' => $user->team_leader_id,
            'team_members'   => $teamMembers,           // [] for staff / dsa
            'franchise_id'   => $user->franchise_id,   // null for internal staff
            'franchise'      => $user->franchise ? [
                'id'   => $user->franchise->id,
                'name' => $user->franchise->name,
                'code' => $user->franchise->code,      // 'EFW-MUM01'
            ] : null,
        ];
    }
}
