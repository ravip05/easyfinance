<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use App\Models\Department;
use App\Models\PipelineStage;
use App\Models\AuditLog;
use App\Models\CommissionSlab;
use Illuminate\Http\Request;

class SettingsController extends Controller {
    public function publicSettings() {
        return response()->json(Setting::whereIn('key', ['company_name', 'company_logo', 'cibil_link_1', 'cibil_link_2'])->pluck('value','key'));
    }
    public function index() {
        return response()->json(Setting::all()->pluck('value','key'));
    }
    public function update(Request $request) {
        foreach ($request->all() as $key => $value) {
            Setting::set($key, $value);
        }
        return response()->json(['message'=>'Settings saved']);
    }
    public function users(Request $request) {
        return response()->json(User::withTrashed()->get()->map(fn(User $u) => [
            'id' => $u->id,
            'emp_code' => $u->emp_code,
            'name' => $u->name,
            'email' => $u->email,
            'phone' => $u->phone,
            'role' => $u->role,
            'department' => $u->department,
            'status' => $u->status,
            'deleted_at' => $u->deleted_at,
            'initials' => $u->initials
        ]));
    }
    public function createUser(Request $request) {
        $validated = $request->validate([
            'name' => 'required', 'email' => 'required|email|unique:users',
            'phone' => 'required', 'role' => 'required', 'department' => 'nullable'
        ]);
        
        // Auto-emp_code sequence
        $allCodes = User::where('emp_code', 'like', 'EF-%')->pluck('emp_code');
        $nextNum = $allCodes->filter(fn($c) => preg_match('/^EF-\d+$/', $c))
                            ->map(fn($c) => (int) substr($c, 3))
                            ->max() + 1 ?: 1;
        $validated['emp_code'] = 'EF-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);
        $validated['password'] = \Illuminate\Support\Facades\Hash::make($request->phone);
        $validated['status'] = 'Active';

        $user = User::create($validated);
        try {
            if ($validated['role']) {
                $user->syncRoles([$validated['role']]);
            }
        } catch (\Exception $e) {
            \Log::error("Failed to sync role for new user: " . $e->getMessage());
        }
        
        return response()->json(['message'=>'User created successfully', 'user'=>$user]);
    }
    public function deleteUser($id) {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message'=>'User deleted']);
    }

    public function restoreUser($id) {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();
        return response()->json(['message'=>'User restored']);
    }

    public function updateUser(Request $request, $id) {
        $user = User::withTrashed()->findOrFail($id);
        
        $data = $request->except(['password', 'role']);
        if ($request->role) {
            $data['role'] = $request->role;
            try {
                $user->syncRoles([$request->role]);
            } catch (\Exception $e) {
                \Log::error("Failed to sync role for user {$id}: " . $e->getMessage());
            }
        }
        
        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);
        return response()->json(['message'=>'User updated']);
    }

    public function blockUser(Request $request, $id) {
        $user = User::withTrashed()->findOrFail($id);
        $user->update(['status' => $request->status ?? 'Inactive']);
        return response()->json(['message'=>'User status updated']);
    }
    public function departments() { return response()->json(Department::with('head:id,name')->get()); }
    public function addDepartment(Request $request) {
        $dept = Department::create($request->validate(['name'=>'required|unique:departments']));
        return response()->json($dept,201);
    }
    public function deleteDepartment($id) { Department::findOrFail($id)->delete(); return response()->json(['message'=>'Deleted']); }
    public function pipelineStages() { return response()->json(PipelineStage::orderBy('sort_order')->get()); }
    public function updatePipelineStages(Request $request) {
        foreach ($request->stages ?? [] as $i => $s) {
            PipelineStage::updateOrCreate(['id'=>$s['id']??0],['name'=>$s['name'],'color'=>$s['color']??'#2563eb','sort_order'=>$i+1,'is_active'=>$s['is_active']??true]);
        }
        return response()->json(['message'=>'Stages updated']);
    }
    public function auditLog() { return response()->json(AuditLog::with('user:id,name')->latest('created_at')->limit(100)->get()); }
    public function commissionSlabs() { return response()->json(CommissionSlab::all()); }
}
