<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\BankPolicy;
use Illuminate\Http\Request;

class BankPolicyController extends Controller {
    public function index() { 
        return response()->json([
            'success' => true,
            'data' => BankPolicy::where('is_active',true)->get()
        ]); 
    }
    public function show($id) { return response()->json(BankPolicy::findOrFail($id)); }
    public function store(Request $request) {
        $data = $request->validate(['bank_name'=>'required','bank_code'=>'required|unique:bank_policies']);
        $policy = BankPolicy::create($request->all());
        
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'created_bank_policy',
            'model_type' => 'BankPolicy',
            'model_id' => $policy->id,
            'new_values' => $policy->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($policy, 201);
    }
    public function update(Request $request, $id) {
        $policy = BankPolicy::findOrFail($id);
        $oldValues = $policy->toArray();
        $policy->update($request->all());
        
        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'updated_bank_policy',
            'model_type' => 'BankPolicy',
            'model_id' => $policy->id,
            'old_values' => $oldValues,
            'new_values' => $policy->fresh()->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json($policy->fresh());
    }
    public function destroy(Request $request, $id) {
        $policy = BankPolicy::findOrFail($id);
        $oldValues = $policy->toArray();
        $policy->delete();

        \App\Models\AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'deleted_bank_policy',
            'model_type' => 'BankPolicy',
            'model_id' => $id,
            'old_values' => $oldValues,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message'=>'Deleted']);
    }
}
