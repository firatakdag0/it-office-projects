<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->notifications()
            ->latest()
            ->paginate(15);
    }

    public function markAsRead(Notification $notification)
    {
        $notification->update(['read_at' => now()]);
        return response()->json(['message' => 'Okundu olarak işaretlendi.']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Tümü okundu olarak işaretlendi.']);
    }

    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => $request->user()->notifications()->whereNull('read_at')->count()
        ]);
    }
}
