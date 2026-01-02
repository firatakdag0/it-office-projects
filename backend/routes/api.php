<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\CustomerController;
use App\Http\Controllers\Api\v1\DashboardController;
use App\Http\Controllers\Api\v1\JobController;
use App\Http\Controllers\Api\v1\RegionController;

// Public Routes
Route::post('/v1/auth/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Customers
    // Dashboard Stats
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::apiResource('customers', CustomerController::class);

    // Jobs
    Route::apiResource('jobs', JobController::class);
    Route::apiResource('regions', RegionController::class);
    Route::patch('/jobs/{job}/status', [JobController::class, 'updateStatus']);
    Route::post('/jobs/{job}/assign', [JobController::class, 'assign']);

    // Users
    Route::apiResource('users', \App\Http\Controllers\Api\v1\UserController::class);
    Route::put('/users/{user}/permissions', [\App\Http\Controllers\Api\v1\UserController::class, 'updatePermissions']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\v1\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\Api\v1\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\Api\v1\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\v1\NotificationController::class, 'markAllAsRead']);
});
