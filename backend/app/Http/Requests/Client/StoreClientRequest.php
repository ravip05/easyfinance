<?php

namespace App\Http\Requests\Client;

use App\Models\Client;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only admin and manager can create client records
        return in_array($this->user()->role, ['admin', 'manager']);
    }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'min:2', 'max:100'],
            'phone'                 => ['required', 'string', 'regex:/^[0-9]{10}$/'],
            'email'                 => ['nullable', 'email'],
            'pan_number'            => ['nullable', 'string', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/'],
            'aadhaar_number'        => ['nullable', 'string', 'digits:12'],
            'loan_type'             => ['required', Rule::in(Client::STAGES)],
            'amount'                => ['nullable', 'numeric', 'min:0'],
            'monthly_income'        => ['nullable', 'numeric', 'min:0'],
            'emi_amount'            => ['nullable', 'numeric', 'min:0'],
            'tenure_months'         => ['nullable', 'integer', 'min:1', 'max:360'],
            'disbursed_at'          => ['nullable', 'date'],
            'cibil_score'           => ['nullable', 'integer', 'min:300', 'max:900'],
            'stage'                 => ['nullable', Rule::in(Client::STAGES)],
            'bank_policy_id'        => ['nullable', 'integer', 'exists:bank_policies,id'],
            'bank_reference_number' => ['nullable', 'string', 'max:50'],
            'notes'                 => ['nullable', 'string', 'max:2000'],
            'managed_by'            => ['nullable', 'integer', 'exists:users,id'],
            'lead_id'               => ['nullable', 'integer', 'exists:leads,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'cibil_score.min' => 'CIBIL score must be at least 300.',
            'cibil_score.max' => 'CIBIL score cannot exceed 900.',
            'pan_number.regex' => 'PAN number format must be ABCDE1234F.',
            'aadhaar_number.digits' => 'Aadhaar number must be exactly 12 digits.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->phone) {
            $this->merge(['phone' => preg_replace('/[^0-9]/', '', $this->phone)]);
        }
        if ($this->pan_number) {
            $this->merge(['pan_number' => strtoupper(trim($this->pan_number))]);
        }
        // Default managed_by to the creator
        if (! $this->managed_by) {
            $this->merge(['managed_by' => $this->user()->id]);
        }
    }
}
