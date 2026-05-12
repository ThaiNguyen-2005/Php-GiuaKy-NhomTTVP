<?php

namespace App\Http\Controllers;

use App\Http\Requests\LibrarySettingUpdateRequest;
use App\Models\LibrarySetting;

class LibrarySettingController extends Controller
{
    public function show()
    {
        $settings = LibrarySetting::singleton();

        return response()->json($this->formatResponse($settings));
    }

    public function update(LibrarySettingUpdateRequest $request)
    {
        $validated = $request->validated();
        $settings = LibrarySetting::singleton();

        $settings->fill([
            'loan_period_days' => $validated['loan_period_days'],
            'max_active_loans' => $validated['max_active_loans'],
        ]);
        $settings->save();

        return response()->json($this->formatResponse($settings));
    }

    private function formatResponse(LibrarySetting $settings): array
    {
        return [
            'loan_period_days' => (int) $settings->loan_period_days,
            'max_active_loans' => (int) $settings->max_active_loans,
            'updated_at' => $settings->updated_at?->toIso8601String(),
        ];
    }
}
