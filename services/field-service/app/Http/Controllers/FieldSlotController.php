<?php

namespace App\Http\Controllers;

use App\Models\Field;
use App\Models\FieldSlot;
use Illuminate\Http\Request;

class FieldSlotController extends Controller
{
    public function index(Request $request, $field_id)
    {
        $field = Field::find($field_id);

        if (!$field) {
            return response()->json([
                'success' => false,
                'message' => 'Field not found',
            ], 404);
        }

        $query = FieldSlot::where('field_id', $field_id);

        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $query->orderBy('date')->orderBy('start_time');

        $perPage = $request->get('per_page', 10);
        $slots = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $slots->items(),
            'meta' => [
                'total' => $slots->total(),
                'per_page' => $slots->perPage(),
                'current_page' => $slots->currentPage(),
                'last_page' => $slots->lastPage(),
            ],
        ]);
    }

    public function store(Request $request, $field_id)
    {
        $field = Field::find($field_id);

        if (!$field) {
            return response()->json([
                'success' => false,
                'message' => 'Field not found',
            ], 404);
        }

        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $conflict = FieldSlot::where('field_id', $field_id)
            ->where('date', $validated['date'])
            ->where(function ($q) use ($validated) {
                $q->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                    ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']]);
            })->exists();

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'Time slot already exists or conflicts with another slot',
            ], 409);
        }

        $slot = FieldSlot::create([
            'field_id' => $field_id,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'status' => 'available',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slot created successfully',
            'data' => $slot,
        ], 201);
    }

    public function lock(Request $request, $id)
    {
        $slot = FieldSlot::find($id);

        if (!$slot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot not found',
            ], 404);
        }

        if ($slot->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'Slot is not available',
            ], 409);
        }

        $validated = $request->validate([
            'booking_id' => 'required|uuid',
        ]);

        $slot->update([
            'status' => 'booked',
            'booking_id' => $validated['booking_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slot locked successfully',
            'data' => $slot,
        ]);
    }

    public function release($id)
    {
        $slot = FieldSlot::find($id);

        if (!$slot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot not found',
            ], 404);
        }

        $slot->update([
            'status' => 'available',
            'booking_id' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slot released successfully',
            'data' => $slot,
        ]);
    }
}
