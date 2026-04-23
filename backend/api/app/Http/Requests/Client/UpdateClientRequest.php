<?php

namespace App\Http\Requests\Client;

use App\Models\Client;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    /**
     * All roles that can reach PUT/PATCH /api/clients/{client} are allowed.
     * Field-level access control is enforced inside ClientController::update().
     *
     * - admin/manager → any field
     * - staff         → stage, notes, cibil_score only (stripped in controller)
     * - dsa           → blocked entirely (403 returned before validation runs)
     */
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['admin', 'manager', 'staff']);
    }

    /**
     * All fields use 'sometimes' so this works for both full PUT and
     * partial PATCH requests from the frontend.
     */
    public function rules(): array
    {
        return [
            // ── Personal ─────────────────────────────────────────────────
            'name'                  => ['sometimes', 'string', 'min:2', 'max:100'],
            'phone'                 => ['sometimes', 'string', 'regex:/^[0-9]{10}$/'],
            'email'                 => ['sometimes', 'nullable', 'email', 'max:200'],
            'pan_number'            => ['sometimes', 'nullable', 'string', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/'],
            'aadhaar_number'        => ['sometimes', 'nullable', 'string', 'digits:12'],

            // ── Loan ─────────────────────────────────────────────────────
            'loan_type'             => ['sometimes', Rule::in(\App\Models\Lead::LOAN_TYPES)],
            'amount'                => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:999999999'],
            'monthly_income'        => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'emi_amount'            => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'tenure_months'         => ['sometimes', 'nullable', 'integer', 'min:1', 'max:360'],
            'disbursed_at'          => ['sometimes', 'nullable', 'date'],

            // ── CIBIL ─────────────────────────────────────────────────────
            'cibil_score'           => ['sometimes', 'nullable', 'integer', 'min:300', 'max:900'],

            // ── Pipeline ─────────────────────────────────────────────────
            'stage'                 => ['sometimes', Rule::in(Client::STAGES)],

            // ── Bank ─────────────────────────────────────────────────────
            'bank_policy_id'        => ['sometimes', 'nullable', 'integer', 'exists:bank_policies,id'],
            'bank_reference_number' => ['sometimes', 'nullable', 'string', 'max:50'],

            // ── Notes ─────────────────────────────────────────────────────
            'notes'                 => ['sometimes', 'nullable', 'string', 'max:5000'],

            // ── Assignment (admin/manager only — stripped for staff in controller) ──
            'managed_by'            => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'franchise_id'          => ['sometimes', 'nullable', 'integer', 'exists:franchises,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'cibil_score.min'       => 'CIBIL score must be between 300 and 900.',
            'cibil_score.max'       => 'CIBIL score must be between 300 and 900.',
            'pan_number.regex'      => 'PAN must be in the format ABCDE1234F.',
            'aadhaar_number.digits' => 'Aadhaar must be exactly 12 digits.',
            'tenure_months.max'     => 'Tenure cannot exceed 360 months (30 years).',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone') && $this->phone) {
            $cleaned = preg_replace('/[^0-9]/', '', $this->phone);
            if (strlen($cleaned) === 12 && str_starts_with($cleaned, '91')) {
                $cleaned = substr($cleaned, 2);
            }
            $this->merge(['phone' => $cleaned]);
        }

        if ($this->has('pan_number') && $this->pan_number) {
            $this->merge(['pan_number' => strtoupper(trim($this->pan_number))]);
        }
    }
}
