<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\Request;

class RegionController extends Controller
{
    public function index()
    {
        return Region::withCount('customers')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:regions',
            'description' => 'nullable|string',
        ]);

        $region = Region::create($validated);

        return response()->json($region, 201);
    }

    public function show(Region $region)
    {
        return $region->load('customers');
    }

    public function update(Request $request, Region $region)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:regions,name,' . $region->id,
            'description' => 'nullable|string',
        ]);

        $region->update($validated);

        return response()->json($region);
    }

    public function destroy(Region $region)
    {
        if ($region->customers()->count() > 0) {
            return response()->json(['message' => 'Bu bölgeye atanmış müşteriler olduğu için silinemez.'], 422);
        }

        $region->delete();

        return response()->json(['message' => 'Bölge silindi.']);
    }
}
