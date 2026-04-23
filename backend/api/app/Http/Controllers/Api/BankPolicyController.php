<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BankPolicyController extends Controller
{
    public function index(Request $request)
    {
        $query = BankPolicy::query();
        
        if ($cat = $request->input('category')) {
            $query->where('category', $cat);
        }
        
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'short_code' => 'nullable|string',
            'logo_code' => 'required|string',
            'brand_color' => 'required|string',
            'bg_color' => 'nullable|string',
            'bank_type' => 'required|string',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'policy_url' => 'nullable|url',
            'hl_interest_rate' => 'nullable|string',
            'hl_max_amount' => 'nullable|string',
            'hl_max_tenure' => 'nullable|string',
            'hl_ltv' => 'nullable|string',
            'bl_interest_rate' => 'nullable|string',
            'bl_max_amount' => 'nullable|string',
            'bl_max_tenure' => 'nullable|string',
            'pl_interest_rate' => 'nullable|string',
            'pl_max_amount' => 'nullable|string',
            'pl_max_tenure' => 'nullable|string',
            'cibil_min' => 'nullable|integer',
            'min_income' => 'nullable|string',
            'age_range' => 'nullable|string',
            'processing_fee' => 'nullable|string',
            'prepayment_clause' => 'nullable|string',
            'highlight' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $policy = BankPolicy::create($data);
        return response()->json($policy, 201);
    }

    public function update(Request $request, BankPolicy $bankPolicy)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'short_code' => 'nullable|string',
            'logo_code' => 'sometimes|required|string',
            'brand_color' => 'sometimes|required|string',
            'bg_color' => 'nullable|string',
            'bank_type' => 'sometimes|required|string',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'policy_url' => 'nullable|url',
            'hl_interest_rate' => 'nullable|string',
            'hl_max_amount' => 'nullable|string',
            'hl_max_tenure' => 'nullable|string',
            'hl_ltv' => 'nullable|string',
            'bl_interest_rate' => 'nullable|string',
            'bl_max_amount' => 'nullable|string',
            'bl_max_tenure' => 'nullable|string',
            'pl_interest_rate' => 'nullable|string',
            'pl_max_amount' => 'nullable|string',
            'pl_max_tenure' => 'nullable|string',
            'cibil_min' => 'nullable|integer',
            'min_income' => 'nullable|string',
            'age_range' => 'nullable|string',
            'processing_fee' => 'nullable|string',
            'prepayment_clause' => 'nullable|string',
            'highlight' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $bankPolicy->update($data);
        return response()->json($bankPolicy);
    }

    public function destroy(BankPolicy $bankPolicy)
    {
        $bankPolicy->delete();
        return response()->json(null, 204);
    }
}
