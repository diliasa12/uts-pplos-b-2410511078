<?php

namespace App\Http\Controllers;

use App\Models\Field;
use App\Models\FieldImage;
use App\Models\FieldSchedule;
use Illuminate\Http\Request;

class FieldController extends Controller
{
    public function index(Request $request)
    {
        $query = Field::with(['category', 'primaryImage']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        if ($request->filled('min_price')) {
            $query->where('price_per_hour', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price_per_hour', '<=', $request->max_price);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $perPage = $request->get('per_page', 10);
        $fields = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $fields->items(),
            'meta' => [
                'total' => $fields->total(),
                'per_page' => $fields->perPage(),
                'current_page' => $fields->currentPage(),
                'last_page' => $fields->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|uuid|exists:field_categories,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'location' => 'required|string|max:100',
            'price_per_hour' => 'required|numeric|min:0',
            'status' => 'sometimes|in:active,inactive,maintenance',
            'images' => 'nullable|array',
            'images.*.image_url' => 'required|string',
            'images.*.is_primary' => 'boolean',
            'schedules' => 'nullable|array',
            'schedules.*.day_of_week' => 'required|integer|between:0,6',
            'schedules.*.open_time' => 'required|date_format:H:i',
            'schedules.*.close_time' => 'required|date_format:H:i|after:schedules.*.open_time',
            'schedules.*.is_open' => 'boolean',
        ]);

        $field = Field::create($validated);

        if (!empty($validated['images'])) {
            foreach ($validated['images'] as $image) {
                FieldImage::create([
                    'field_id' => $field->id,
                    'image_url' => $image['image_url'],
                    'is_primary' => $image['is_primary'] ?? false,
                ]);
            }
        }

        if (!empty($validated['schedules'])) {
            foreach ($validated['schedules'] as $schedule) {
                FieldSchedule::create([
                    'field_id' => $field->id,
                    'day_of_week' => $schedule['day_of_week'],
                    'open_time' => $schedule['open_time'],
                    'close_time' => $schedule['close_time'],
                    'is_open' => $schedule['is_open'] ?? true,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Field created successfully',
            'data' => $field->load(['category', 'images', 'schedules']),
        ], 201);
    }

    public function show($id)
    {
        $field = Field::with(['category', 'images', 'schedules'])->find($id);

        if (!$field) {
            return response()->json([
                'success' => false,
                'message' => 'Field not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $field,
        ]);
    }

    public function update(Request $request, $id)
    {
        $field = Field::find($id);

        if (!$field) {
            return response()->json([
                'success' => false,
                'message' => 'Field not found',
            ], 404);
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|uuid|exists:field_categories,id',
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'location' => 'sometimes|string|max:100',
            'price_per_hour' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:active,inactive,maintenance',
        ]);

        $field->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Field updated successfully',
            'data' => $field->load(['category', 'images', 'schedules']),
        ]);
    }

    public function destroy($id)
    {
        $field = Field::find($id);

        if (!$field) {
            return response()->json([
                'success' => false,
                'message' => 'Field not found',
            ], 404);
        }

        $field->delete();

        return response()->json([
            'success' => true,
            'message' => 'Field deleted successfully',
        ], 204);
    }
}
