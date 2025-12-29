<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        return Customer::with(['contacts', 'region'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:individual,corporate',
            'full_company_name' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:50',
            'tax_office' => 'nullable|string|max:100',
            'iban' => 'nullable|string|max:34',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'maps_link' => 'nullable|string', // Zorunlu istenirse required yapilabilir
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'region' => 'nullable|string|max:255',
            'region_id' => 'nullable|exists:regions,id',
            'contacts' => 'nullable|array',
            'contacts.*.name' => 'required_with:contacts|string',
            'contacts.*.email' => 'nullable|email',
            'contacts.*.phone' => 'nullable|string',
            'contacts.*.department' => 'nullable|string',
        ]);

        $customer = Customer::create(collect($validated)->except('contacts')->toArray());

        if ($request->type === 'corporate' && !empty($request->contacts)) {
            $customer->contacts()->createMany($request->contacts);
        }

        return response()->json($customer->load(['contacts', 'region']), 201);
    }

    public function show(Customer $customer)
    {
        return $customer->load(['contacts', 'region']);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:individual,corporate',
            'full_company_name' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:50',
            'tax_office' => 'nullable|string|max:100',
            'iban' => 'nullable|string|max:34',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'maps_link' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'region' => 'nullable|string|max:255',
            'region_id' => 'nullable|exists:regions,id',
            'contacts' => 'nullable|array',
        ]);

        $customer->update(collect($validated)->except('contacts')->toArray());

        // Full sync contacts if provided (simple approach: delete all and recreate)
        // Or handle add/remove/update logic. For now, we'll just add new ones if sent?
        // Better: if corporate and contacts array sent, replacing them might be safer for MVP editor
        if ($request->has('contacts') && $customer->type === 'corporate') {
            $customer->contacts()->delete();
            $customer->contacts()->createMany($request->contacts);
        }

        return response()->json($customer->load(['contacts', 'region']));
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->json(['message' => 'User deleted.']);
    }
}
