<?php

namespace App\Http\Requests\Lead;

use App\Models\Lead;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeadRequest extends FormRequest
{
    /**
     * Only authenticated users can create leads.
     * DSA partners cannot create leads directly (they submit externally).
     */
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['admin', 'manager', 'staff']);
    }

    public function rules(): array
    {
        return [
            // ── Required ──────────────────────────────────────────────────
            'name'           => ['required', 'string', 'min:2', 'max:100'],
            'phone'          => ['required', 'string', 'regex:/^[0-9]{10}$/'],

            // ── Loan & Assessment Details ──────────────────────────────────
            'loan_type'      => ['required', Rule::in(Lead::LOAN_TYPES)],
            'amount'         => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'monthly_income' => ['nullable', 'numeric', 'min:0'],
            'income_status'  => ['nullable', 'string', 'max:50'],
            'running_loans'  => ['nullable', 'integer', 'min:0'],
            'lead_value'     => ['nullable', 'numeric', 'min:0'],
            'birth_date'     => ['nullable', 'date', 'before:today'],
            'location'       => ['nullable', 'string', 'max:150'],

            // ── Pipeline ──────────────────────────────────────────────────
            'source'         => ['nullable', Rule::in(Lead::SOURCES)],
            'priority'       => ['nullable', Rule::in(['High', 'Medium', 'Low'])],
            'follow_up_date' => ['nullable', 'date', 'after_or_equal:today'],
            'notes'          => ['nullable', 'string', 'max:2000'],

            // ── Assignment ────────────────────────────────────────────────
            'assigned_to'    => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => 'Client full name is required.',
            'phone.required'       => 'Mobile number is required.',
            'phone.regex'          => 'Enter a valid 10-digit mobile number.',
            'loan_type.required'   => 'Please select a loan type.',
            'loan_type.in'         => 'Invalid loan type selected.',
            'follow_up_date.after_or_equal' => 'Follow-up date cannot be in the past.',
            'assigned_to.exists'   => 'The selected employee does not exist.',
        ];
    }

    /**
     * Normalise phone before validation hits:
     *   "98765 43210" → "9876543210"
     */
    protected function prepareForValidation(): void
    {
        if ($this->phone) {
            $this->merge(['phone' => preg_replace('/[^0-9]/', '', $this->phone)]);
        }

        // Staff are always assigned to themselves — ignore any assigned_to they send
        if ($this->user()->role === 'staff') {
            $this->merge(['assigned_to' => $this->user()->id]);
        }
    }
}
