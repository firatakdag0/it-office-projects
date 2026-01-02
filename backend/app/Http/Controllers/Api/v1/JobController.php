<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Notification;
use App\Models\User;

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
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'materials' => 'nullable|string',
            'status' => 'required|in:pending,traveling,working,completed,cancelled',
            'priority' => 'required|in:low,medium,high,urgent',
            'start_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'customer_id' => 'required|exists:customers,id',
            'authorized_person_id' => 'nullable|exists:customer_contacts,id',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'assigned_user_id' => 'nullable|exists:users,id',
            'region_id' => 'required|exists:regions,id',
            'location_address' => 'nullable|string',
            'maps_url' => 'nullable|url',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'type' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:10240', // 10MB max
        ]);

        $job = Job::create([
            'customer_id' => $validated['customer_id'],
            'authorized_person_id' => $validated['authorized_person_id'] ?? null,
            'contact_name' => $validated['contact_name'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'assigned_user_id' => $validated['assigned_user_id'] ?? null,
            'region_id' => $validated['region_id'],
            'location_address' => $validated['location_address'] ?? null,
            'maps_url' => $validated['maps_url'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'status' => $validated['status'],
            'type' => $validated['type'],
            'priority' => $validated['priority'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'materials' => $validated['materials'] ?? null,
            'start_date' => $validated['start_date'],
            'due_date' => $validated['due_date'] ?? null,
            'price' => $validated['price'] ?? null,
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

        // Notify assigned user
        if ($job->assigned_user_id) {
            Notification::create([
                'user_id' => $job->assigned_user_id,
                'title' => 'Yeni İş Atandı',
                'message' => "Yeni bir iş sizi bekliyor: {$job->title}",
                'type' => 'job_assigned',
                'link' => "/jobs/{$job->id}"
            ]);
        }

        return response()->json($job->load(['customer.region', 'attachments']), 201);
    }

    public function show(Job $job)
    {
        return $job->load(['customer.region', 'assignee', 'logs.user', 'payment', 'attachments']);
    }

    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'materials' => 'nullable|string',
            'status' => 'sometimes|required|in:pending,traveling,working,completed,cancelled',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'start_date' => 'sometimes|required|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'customer_id' => 'sometimes|required|exists:customers,id',
            'authorized_person_id' => 'nullable|exists:customer_contacts,id',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'assigned_user_id' => 'nullable|exists:users,id',
            'region_id' => 'sometimes|required|exists:regions,id',
            'location_address' => 'nullable|string',
            'maps_url' => 'nullable|url',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'type' => 'sometimes|required|string',
            'price' => 'nullable|numeric|min:0',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:10240',
        ]);

        $job->update($validated);

        // Handle New Attachments (if any)
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

        // Log the update
        JobLog::create([
            'job_id' => $job->id,
            'user_id' => $request->user()->id,
            'new_status' => $job->status,
            'notes' => 'İş bilgileri güncellendi.',
        ]);

        return response()->json($job->load(['customer.region', 'attachments', 'assignee']));
    }

    public function destroy(Job $job)
    {
        // Delete related logs and attachments if needed, or rely on cascade
        // Assuming cascade or simple delete is fine for now
        $job->delete();

        return response()->json(['message' => 'İş başarıyla silindi.']);
    }

    public function updateStatus(Request $request, Job $job)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,traveling,working,completed,cancelled',
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

            // Notify Managers
            $statusLabels = [
                'pending' => 'Beklemede',
                'traveling' => 'Yolda',
                'working' => 'Çalışıyor',
                'completed' => 'Tamamlandı',
                'cancelled' => 'İptal Edildi'
            ];
            $statusLabel = $statusLabels[$newStatus] ?? $newStatus;

            $managers = User::where('role', 'manager')->get();
            foreach ($managers as $manager) {
                Notification::create([
                    'user_id' => $manager->id,
                    'title' => 'İş Durumu Güncellendi',
                    'message' => "{$job->id} numaralı işin durumu '{$statusLabel}' olarak güncellendi. (Güncelleyen: {$request->user()->name})",
                    'type' => 'job_update',
                    'link' => "/jobs/{$job->id}"
                ]);
            }
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
