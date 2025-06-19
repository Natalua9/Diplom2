<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function purchase(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Необходимо авторизоваться'], 401);
        }

        $validator = Validator::make($request->all(), [
            'id_direction' => 'required|exists:directions,id',
            'count_lessons' => 'required|in:4,8,12',
        ], [
            'id_direction.required' => 'Необходимо выбрать направление.',
            'id_direction.exists' => 'Выбранное направление не существует.',
            'count_lessons.required' => 'Необходимо выбрать количество занятий.',
            'count_lessons.in' => 'Выбрано некорректное количество занятий.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Опционально: Проверка на существующий активный абонемент по этому направлению
        $existingActiveSubscription = DB::table('subscription')
            ->where('id_user', $user->id)
            ->where('id_direction', $request->id_direction)
            ->where('status', 'активный')
            ->where('expires_at', '>', Carbon::now()) // Проверяем по новой дате окончания
            ->first();

        if ($existingActiveSubscription) {
            return response()->json(['message' => 'У вас уже есть активный абонемент на это направление. Вы можете приобрести новый после окончания текущего.'], 409);
        }

        $durationInMonths = 1; // Стандартный срок - 1 месяц
        $expiresAt = Carbon::now()->addMonths($durationInMonths);

        DB::beginTransaction(); // Начинаем транзакцию для безопасности
        try {
            $subscriptionId = DB::table('subscription')->insertGetId([
                'id_user' => $user->id,
                'id_direction' => $request->id_direction,
                'count_lessons' => $request->count_lessons,
                'status' => 'активный',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'expires_at' => $expiresAt, // <--- СОХРАНЯЕМ ДАТУ ОКОНЧАНИЯ
            ]);

            if (!$subscriptionId) {
                DB::rollBack();
                return response()->json(['message' => 'Не удалось создать запись об абонементе.'], 500);
            }

            // Получаем данные нового абонемента для отправки на фронт
            $newSubscriptionData = DB::table('subscription')
                ->join('directions', 'subscription.id_direction', '=', 'directions.id')
                ->where('subscription.id', $subscriptionId)
                ->select(
                    'subscription.id',
                    'subscription.count_lessons',
                    'subscription.status',
                    'subscription.created_at',
                    'subscription.expires_at', // <--- ПОЛУЧАЕМ ДАТУ ОКОНЧАНИЯ ИЗ БД
                    'directions.name as direction_name',
                    'directions.id as direction_id'
                )
                ->first();

            if ($newSubscriptionData) {
                // Форматируем дату окончания для отображения на фронтенде
                $newSubscriptionData->expires_at_formatted = Carbon::parse($newSubscriptionData->expires_at)->format('d.m.Y');
            } else {
                DB::rollBack();
                return response()->json(['message' => 'Не удалось получить данные созданного абонемента.'], 500);
            }

            DB::commit(); // Фиксируем транзакцию

            return response()->json([
                'message' => 'Абонемент успешно оформлен!',
                'subscription' => $newSubscriptionData
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack(); 
            // \Log::error("Ошибка покупки абонемента: " . $e->getMessage()); 
            return response()->json(['message' => 'Произошла ошибка при оформлении абонемента. Пожалуйста, попробуйте позже.'], 500);
        }
    }
}