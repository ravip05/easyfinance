<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\BankPolicy;
use Illuminate\Http\Request;

class BankPolicyController extends Controller {
    public function index()   { return response()->json(BankPolicy::where('is_active',true)->get()); }
    public function show($id) { return response()->json(BankPolicy::findOrFail($id)); }
    public function store(Request $request) {
        $data = $request->validate(['bank_name'=>'required','bank_code'=>'required|unique:bank_policies']);
        return response()->json(BankPolicy::create($request->all()),201);
    }
    public function update(Request $request, $id) {
        $policy = BankPolicy::findOrFail($id);
        $policy->update($request->all());
        return response()->json($policy->fresh());
    }
    public function destroy($id) {
        BankPolicy::findOrFail($id)->delete();
        return response()->json(['message'=>'Deleted']);
    }
}
