<?php

namespace App\Http\Requests\Lead;

use App\Models\Lead;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        // DSA partners cannot edit leads
        return in_array($this->user()->role, ['admin', 'manager', 'staff']);
    }

    public function rules(): array
    {
        return [
            // All fields are "sometimes" (partial PATCH support)
            'name'           => ['sometimes', 'string', 'min:2', 'max:100'],
            'phone'          => ['sometimes', 'string', 'regex:/^[0-9]{10}$/'],
            'email'          => ['sometimes', 'nullable', 'email'],
            'pan_number'     => ['sometimes', 'nullable', 'string', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/'],
            'loan_type'      => ['sometimes', Rule::in(Lead::LOAN_TYPES)],
            'amount'         => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'monthly_income' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'stage'          => ['sometimes', Rule::in(Lead::STAGES)],
            'priority'       => ['sometimes', Rule::in(['High', 'Medium', 'Low'])],
            'source'         => ['sometimes', Rule::in(Lead::SOURCES)],
            'follow_up_date' => ['sometimes', 'nullable', 'date'],
            'notes'          => ['sometimes', 'nullable', 'string', 'max:2000'],
            'assigned_to'    => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'cibil_score'     => ['sometimes', 'nullable', 'integer', 'min:300', 'max:900'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->phone) {
            $this->merge(['phone' => preg_replace('/[^0-9]/', '', $this->phone)]);
        }

        if ($this->pan_number) {
            $this->merge(['pan_number' => strtoupper($this->pan_number)]);
        }

        // Staff cannot reassign leads — strip the field if they try to send it
        if ($this->user()->role === 'staff') {
            $this->request->remove('assigned_to');
        }
    }
}
