<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\Admin\ApiDashboardController;
use App\Http\Controllers\Api\Admin\ApiCategoryController;
use App\Http\Controllers\Api\Admin\ApiProductController;
use App\Http\Controllers\Api\Admin\ApiInventoryController;
use App\Http\Controllers\Api\Admin\ApiOrderController;
use App\Http\Controllers\Api\Admin\ApiDocumentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rute-rute di sini dimuat oleh RouteServiceProvider dan tergabung dalam
| middleware group "api". Sangat cocok untuk testing via Postman!
|
*/

// ==========================================
// AUTH API
// ==========================================
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Admin routes (more will be added in later tasks)
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/dashboard', [ApiDashboardController::class, 'index']);
        Route::apiResource('/categories', ApiCategoryController::class);
        Route::apiResource('/products', ApiProductController::class);
        Route::apiResource('/inventories', ApiInventoryController::class)->only(['index', 'show', 'update']);
        Route::get('/orders/export', [ApiOrderController::class, 'export']);
        Route::apiResource('/orders', ApiOrderController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
        Route::get('/orders/{orderId}/invoice', [ApiDocumentController::class, 'invoice']);
        Route::get('/orders/{orderId}/packing-list', [ApiDocumentController::class, 'packingList']);
    });
});

// ==========================================
// 1. CHATBOT API (Public)
// ==========================================
Route::prefix('chatbot')->group(function () {
    Route::post('/session', [ChatbotController::class, 'startSession']);
    Route::post('/message', [ChatbotController::class, 'sendMessage']);
});

// ==========================================
// 2. CATALOG API (Public)
// ==========================================
Route::get('/categories', [CatalogController::class, 'categories']);
Route::get('/products', [CatalogController::class, 'index']);
Route::get('/products/{id}', [CatalogController::class, 'show']);

// Auth check default bawaan Sanctum
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
