<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FieldCategoryController;
use App\Http\Controllers\FieldController;
use App\Http\Controllers\FieldSlotController;


Route::prefix('categories')->group(function () {
  Route::get('/', [FieldCategoryController::class, 'index']);
  Route::get('/{id}', [FieldCategoryController::class, 'show']);
});

Route::prefix('fields')->group(function () {
  Route::get('/', [FieldController::class, 'index']);
  Route::get('/{id}', [FieldController::class, 'show']);
  Route::get('/{field_id}/slots', [FieldSlotController::class, 'index']);
});


Route::middleware('jwt.verify')->group(function () {

  Route::middleware('role:admin')->group(function () {
    Route::prefix('categories')->group(function () {
      Route::post('/', [FieldCategoryController::class, 'store']);
      Route::put('/{id}', [FieldCategoryController::class, 'update']);
      Route::delete('/{id}', [FieldCategoryController::class, 'destroy']);
    });

    Route::prefix('fields')->group(function () {
      Route::post('/', [FieldController::class, 'store']);
      Route::put('/{id}', [FieldController::class, 'update']);
      Route::delete('/{id}', [FieldController::class, 'destroy']);
      Route::post('/{field_id}/slots', [FieldSlotController::class, 'store']);
    });
  });
  Route::prefix('slots')->group(function () {
    Route::patch('/{id}/lock', [FieldSlotController::class, 'lock']);
    Route::patch('/{id}/release', [FieldSlotController::class, 'release']);
  });
});
