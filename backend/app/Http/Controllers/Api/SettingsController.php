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
        return response()->json(User::with('roles')->withTrashed()->get()->map(fn($u)=>array_merge($u->only(['id','name','email','phone','department','designation','status','employee_code','deleted_at']),['role'=>$u->roles->first()?->name??'staff'])));
    }
    public function updateUser(Request $request, $id) {
        $user = User::withTrashed()->findOrFail($id);
        $user->update($request->except(['password','role']));
        if ($request->role) $user->syncRoles([$request->role]);
        if ($request->filled('password')) $user->update(['password'=>\Illuminate\Support\Facades\Hash::make($request->password)]);
        return response()->json(['message'=>'User updated']);
    }
    public function blockUser(Request $request, $id) {
        $user = User::findOrFail($id);
        $user->update(['status'=>$request->status ?? 'inactive']);
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
