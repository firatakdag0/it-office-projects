<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Job;
use App\Models\Region;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $stats = [
            'total_customers' => Customer::count(),
            'total_regions' => Region::count(),
            'total_jobs' => Job::count(),
            'pending_jobs' => Job::where('status', 'pending')->count(),
            'working_jobs' => Job::where('status', 'working')->count(),
            'completed_today' => Job::where('status', 'completed')
                ->whereDate('updated_at', now()->toDateString())
                ->count(),
            'staff_count' => User::where('role', 'staff')->count(),
            'recent_jobs' => Job::with('customer')
                ->latest()
                ->take(5)
                ->get(),
        ];

        return response()->json($stats);
    }
}
