<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Job::with(['customer.region', 'assignee']);

        // Field staff sees only their jobs
        if ($user->role === 'field_staff') {
            $query->where('assigned_user_id', $user->id);
            // Optional: Also show unassigned jobs or special logic
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'type' => 'required|string', // Relaxed validation
            'description' => 'required|string',
            'scheduled_at' => 'nullable|date',
            'price' => 'nullable|numeric',
            'assigned_user_id' => 'nullable|exists:users,id',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:10240', // 10MB max
        ]);

        $job = Job::create([
            'customer_id' => $validated['customer_id'],
            'type' => $validated['type'],
            'description' => $validated['description'],
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'price' => $validated['price'] ?? null,
            'assigned_user_id' => $validated['assigned_user_id'] ?? null,
        ]);

        // Handle Attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('job-attachments', 'public');

                \App\Models\JobAttachment::create([
                    'job_id' => $job->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                ]);
            }
        }

        // Initial log
        JobLog::create([
            'job_id' => $job->id,
            'user_id' => $request->user()->id,
            'new_status' => 'pending',
            'notes' => 'İş oluşturuldu.',
        ]);

        return response()->json($job->load(['customer.region', 'attachments']), 201);
    }

    public function show(Job $job)
    {
        return $job->load(['customer.region', 'assignee', 'logs.user', 'payment', 'attachments']);
    }

    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'type' => 'sometimes|string',
            'description' => 'sometimes|string',
            'scheduled_at' => 'nullable|date',
            'price' => 'nullable|numeric',
        ]);

        $job->update($validated);

        return response()->json($job);
    }

    public function updateStatus(Request $request, Job $job)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,traveling,working,completed',
            'notes' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $oldStatus = $job->status;
        $newStatus = $validated['status'];

        DB::transaction(function () use ($job, $validated, $oldStatus, $newStatus, $request) {
            $job->update(['status' => $newStatus]);

            if ($newStatus === 'completed') {
                $job->update(['completed_at' => now()]);
            }

            JobLog::create([
                'job_id' => $job->id,
                'user_id' => $request->user()->id,
                'previous_status' => $oldStatus,
                'new_status' => $newStatus,
                'notes' => $validated['notes'] ?? null,
                'location_lat' => $validated['latitude'] ?? null,
                'location_lng' => $validated['longitude'] ?? null,
            ]);
        });

        return response()->json($job);
    }

    public function assign(Request $request, Job $job)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $job->update(['assigned_user_id' => $validated['user_id']]);

        return response()->json($job);
    }
}
