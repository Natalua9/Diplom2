<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

use Illuminate\Http\Request;

class TeacherController extends Controller
{
    // вывод данных о преподавателе 
    public function teacher(Request $request)
{
    $user_data = Auth::user();

    if (!$user_data) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $id_teacher_user = $user_data->id;
    $weekOffset = $request->get('week_offset', 0);
    $startOfWeek = Carbon::now()->startOfWeek()->addWeeks($weekOffset);
    $today = Carbon::now()->startOfDay(); // Сегодняшняя дата для сравнения

    $frontendDates = [];
    for ($d = 0; $d < 7; $d++) {
        $frontendDates[] = $startOfWeek->copy()->addDays($d)->format('Y-m-d');
    }

    $teacherTimingTemplates = DB::table('timings')
        ->join('teacher_directions', 'timings.id_teacher', '=', 'teacher_directions.id')
        ->join('directions', 'teacher_directions.id_directions', '=', 'directions.id')
        ->where('teacher_directions.id_teacher', '=', $id_teacher_user)
        ->select(
            'timings.id',
            'timings.date as day_of_week', // Это день недели из шаблона, а не конкретная дата
            'timings.time',
            'directions.name as direction_name'
        )
        ->orderBy('timings.date') // По дню недели из шаблона
        ->orderBy('timings.time')
        ->get()
        ->groupBy('day_of_week');


    $teacherDirectionsInfo = DB::table('teacher_directions')
        ->join('directions', 'teacher_directions.id_directions', '=', 'directions.id')
        ->where('teacher_directions.id_teacher', '=', $id_teacher_user)
        ->select('directions.name as direction_name')
        ->get();
    $direction_teacher = $teacherDirectionsInfo->pluck('direction_name')->implode(', ');

    $groupedRecords = [];

    for ($i = 0; $i < 7; $i++) {
        $currentDate = $startOfWeek->copy()->addDays($i);
        $currentDateString = $currentDate->format('Y-m-d');
        $dayOfWeekIso = $currentDate->dayOfWeekIso; // ISO-8601 день недели (1 = Пн, 7 = Вс)

        // Проверяем, прошла ли дата и время (считаем, что если дата прошла, то и время прошло)
        // Более точная проверка была бы: $currentDateTime->isPast(), где $currentDateTime = $currentDate + time_slot
        $isPastSlot = $currentDate->lt($today); // Грубая проверка по дате
        // Для более точной проверки isPastSlot, нужно учитывать время слота.
        // Сейчас она будет true для всех слотов прошедшего дня.

        $slotsForThisDayOfWeek = $teacherTimingTemplates->get($dayOfWeekIso, collect());
        $daySchedule = [];

        foreach ($slotsForThisDayOfWeek as $timingTemplate) {
            // Более точная проверка, прошел ли конкретный слот (дата + время)
            $slotDateTime = Carbon::parse($currentDateString . ' ' . $timingTemplate->time);
            $isCurrentSlotPast = $slotDateTime->isPast();

            $studentRecordsOnThisDateAndSlot = DB::table('record')
                ->where('id_td', '=', $timingTemplate->id)
                ->where('date_record', '=', $currentDateString)
                ->get();

            // --- НАЧАЛО ЛОГИКИ АВТОМАТИЧЕСКОГО ИЗМЕНЕНИЯ СТАТУСА НА "ПРОВЕДЕНА" ДЛЯ ПРОШЕДШИХ "НОВАЯ" ---
            if ($isCurrentSlotPast) { // Используем более точную проверку для текущего слота
                $recordsToAutoMarkProvedena = $studentRecordsOnThisDateAndSlot->where('status', 'новая');
                if ($recordsToAutoMarkProvedena->isNotEmpty()) {
                    $recordIdsToUpdate = $recordsToAutoMarkProvedena->pluck('id')->toArray();
                    DB::table('record')
                        ->whereIn('id', $recordIdsToUpdate)
                        ->update(['status' => 'проведена', 'updated_at' => Carbon::now()]);
                    
                    \Log::info("Auto-marked records as 'проведена' IDs: " . implode(', ', $recordIdsToUpdate) . " for date: {$currentDateString} / slot time: {$timingTemplate->time} as it was past and 'новая'.");
                    
                    // Перезагружаем записи студентов для этого слота, чтобы отобразить актуальный статус
                    $studentRecordsOnThisDateAndSlot = DB::table('record')
                        ->where('id_td', '=', $timingTemplate->id)
                        ->where('date_record', '=', $currentDateString)
                        ->get();
                }
            }
            // --- КОНЕЦ ЛОГИКИ АВТОМАТИЧЕСКОГО ИЗМЕНЕНИЯ СТАТУСА ---

            $activeRecordCount = $studentRecordsOnThisDateAndSlot
                ->whereIn('status', ['новая', 'проведена']) // 'новая' здесь может остаться, если слот еще не прошел
                ->count();

            // Определение общего статуса слота для отображения преподавателю
            $displayStatus = 'новая'; // По умолчанию
            if ($studentRecordsOnThisDateAndSlot->isNotEmpty()) {
                $allCancelled = $studentRecordsOnThisDateAndSlot->every(fn($sr) => $sr->status === 'отменена');
                $allProvedena = $studentRecordsOnThisDateAndSlot->every(fn($sr) => $sr->status === 'проведена');
                $anyProvedena = $studentRecordsOnThisDateAndSlot->contains('status', 'проведена');
                $anyNew = $studentRecordsOnThisDateAndSlot->contains('status', 'новая');

                if ($allProvedena) {
                    $displayStatus = 'проведена';
                } elseif ($allCancelled) {
                    $displayStatus = 'отменена';
                } elseif ($anyProvedena && !$anyNew) { // Есть проведенные, и нет новых (значит, остальные могут быть отменены)
                    $displayStatus = 'проведена'; // Или можно сложнее: "частично проведена"
                } elseif ($anyNew) {
                    $displayStatus = 'новая'; // Если есть хоть одна 'новая', слот считается 'новая'
                }
                // Если нет записей, или все записи имеют другие статусы (что маловероятно при текущей логике),
                // displayStatus останется 'новая'. Это можно доработать, если есть кейсы без студентов.

            } elseif ($isCurrentSlotPast) {
                 // Если записей студентов нет, и слот прошел, то он считается "проведенным" (пустым)
                 // Это опционально, зависит от бизнес-логики.
                 // Если не нужно, чтобы пустые прошедшие слоты были "проведена", закомментируйте.
                 $displayStatus = 'проведена';
            }


            $daySchedule[] = [
                'id' => $timingTemplate->id, // Это timings.id
                'time' => $timingTemplate->time, // Время из шаблона timings
                'time_record' => Carbon::parse($timingTemplate->time)->format('H:i'), // Форматированное время
                'date' => $currentDateString, // Конкретная дата для этого экземпляра слота
                'status' => $displayStatus, // Рассчитанный статус слота
                'direction_name' => $timingTemplate->direction_name,
                'record_count' => $activeRecordCount, // Количество активных (не отмененных) записей студентов
                'is_past' => $isCurrentSlotPast, // Добавляем флаг, что слот в прошлом
            ];
        }
        $groupedRecords[(string) $dayOfWeekIso] = $daySchedule;
    }

    return response()->json([
        'user_data' => [
            'id' => $user_data->id,
            'full_name' => $user_data->full_name,
            'photo' => $user_data->photo,
            'phone' => $user_data->phone,
            'email' => $user_data->email,
            'age' => $user_data->age ? Carbon::parse($user_data->age)->format('Y-m-d') : null,
        ],
        'direction_teacher' => $direction_teacher ?? '',
        'records' => $groupedRecords,
        'dates' => $frontendDates,
        'weekOffset' => (int) $weekOffset
    ]);
}

    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:record,id',
            'status' => 'required|string|in:проведена,отменена,новая', // 'новая' - если есть такой статус
        ]);

        $recordId = $request->id;
        $newStatus = $request->status;

        DB::beginTransaction();
        try {
            // Получаем запись, включая id_subscription
            $record = DB::table('record')->where('id', $recordId)->first();

            if (!$record) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Запись не найдена.'], 404);
            }

            // Обновляем статус самой записи
            DB::table('record')
                ->where('id', $recordId)
                ->update(['status' => $newStatus]);

            // Если статус изменен на "отменена" и есть связанный абонемент
            if ($newStatus === 'отменена' && $record->id_subscription) {
                $subscription = DB::table('subscription')->where('id', $record->id_subscription)->first();

                if ($subscription) {
                    // Проверяем, не истек ли абонемент по сроку.
                    // В вашем методе user() срок действия вычисляется как 1 месяц от created_at.
                    // Используем ту же логику.
                    $createdAt = Carbon::parse($subscription->created_at);
                    $expiresAt = $createdAt->copy()->addMonth();

                    // Если абонемент еще не истек по дате
                    if (Carbon::now()->lte($expiresAt)) {
                        $updatedLessonCount = $subscription->count_lessons + 1;
                        $newSubscriptionStatus = $subscription->status;

                        // Если абонемент был неактивен (например, из-за 0 занятий),
                        // и теперь в нем есть занятия, делаем его активным.
                        if ($subscription->status === 'неактивный' && $updatedLessonCount > 0) {
                            $newSubscriptionStatus = 'активный';
                        }

                        DB::table('subscription')
                            ->where('id', $subscription->id)
                            ->update([
                                'count_lessons' => $updatedLessonCount,
                                'status' => $newSubscriptionStatus,
                            ]);
                    } else {
                        // Абонемент истек по сроку, занятие не возвращаем.
                        // Можно добавить лог или специфическое сообщение, если это нужно.
                    }
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Статус записи успешно обновлен. Занятие возвращено в абонемент, если это применимо.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            // \Log::error('Ошибка обновления статуса записи: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка обновления статуса записи.'
            ], 500);
        }
    }
   public function updateStatusTeacher(Request $request)
{
    $validated = $request->validate([
        'id' => 'required|integer|exists:timings,id', // ID занятия (слота) из таблицы timings
        'status' => 'required|string|in:новая,проведена,отменена',
        // Добавим дату, чтобы точно знать, для какого дня меняется статус
        // Фронтенд должен передавать дату слота, который преподаватель изменяет
        'date' => 'required|date_format:Y-m-d', 
    ]);

    $timingsId = $request->id;
    $newGlobalStatusForSlot = $request->status;
    $slotDateString = $request->date;

    // Получаем информацию о времени из timings, чтобы сформировать полную дату-время слота
    $timingTemplate = DB::table('timings')->find($timingsId);
    if (!$timingTemplate) {
        return response()->json(['success' => false, 'message' => 'Слот времени не найден.'], 404);
    }

    try {
        $slotDateTime = Carbon::parse($slotDateString . ' ' . $timingTemplate->time);
    } catch (\Exception $e) {
        \Log::error("updateStatusTeacher: Error parsing slot date/time. Date: {$slotDateString}, Time: {$timingTemplate->time}. Error: " . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Ошибка определения даты и времени слота.'], 400);
    }

    // --- НАЧАЛО: Проверки на изменение статуса ---
    $isSlotPast = $slotDateTime->isPast();

    if ($isSlotPast) {
        // Если слот в прошлом, то менять статус можно только в ОЧЕНЬ ограниченных случаях или нельзя вообще.
        // Правило: Если занятие в прошлом и его статус УЖЕ НЕ "новая" (т.е. "проведена" или "отменена"),
        // то его статус менять НЕЛЬЗЯ.
        // Это означает, что если слот был автоматически отмечен как "проведена" (потому что был "новая" и прошел),
        // или был отменен, то преподаватель уже не может это изменить.

        // Проверяем текущие статусы записей студентов для этого слота на эту дату
        $studentRecords = DB::table('record')
                            ->where('id_td', $timingsId)
                            ->where('date_record', $slotDateString)
                            ->get();
        
        $canChangeStatusForPastSlot = true;
        if ($studentRecords->isNotEmpty()) {
            // Если есть хоть одна запись, которая НЕ 'новая', то менять нельзя
            if ($studentRecords->some(fn($sr) => $sr->status !== 'новая')) {
                $canChangeStatusForPastSlot = false;
            }
        } else {
            // Если записей студентов нет, то статус самого пустого слота (если он был 'новая' и прошел)
            // мог стать 'проведена' в `teacher` методе. Такой менять тоже нельзя.
            // Этот кейс сложнее отследить здесь без хранения "статуса слота".
            // Для простоты, если нет записей, и слот в прошлом, и препод пытается что-то сделать - возможно, запретить.
            // Или разрешить, если он ставит "отменена" (например, забыл отменить пустой слот).
            // Текущая логика: если пусто и в прошлом, и препод меняет - даем менять (но это можно ужесточить).
        }

        if (!$canChangeStatusForPastSlot) {
             return response()->json([
                'success' => false,
                'message' => 'Нельзя изменить статус прошедшего занятия, которое уже было обработано (проведено или отменено).'
            ], 403); // 403 Forbidden - подходящий статус
        }
    }


    // Запрет ставить "проведена" для будущих занятий
    if ($newGlobalStatusForSlot === 'проведена' && $slotDateTime->isFuture()) {
        return response()->json([
            'success' => false,
            'message' => 'Нельзя отметить будущее занятие как "проведена".'
        ], 422);
    }
    // --- КОНЕЦ: Проверки на изменение статуса ---


    DB::beginTransaction();
    try {
        // Находим все записи студентов (record), связанные с этим слотом timings НА КОНКРЕТНУЮ ДАТУ
        $studentRecordsToUpdate = DB::table('record')
            ->where('id_td', $timingsId)
            ->where('date_record', $slotDateString) // Важно: обновляем только для указанной даты
            ->get();

        $updatedStudentRecordsCount = 0;

        foreach ($studentRecordsToUpdate as $studentRecord) {
            $currentRecordStatus = $studentRecord->status;
            $newRecordStatus = $currentRecordStatus; // По умолчанию не меняем

            // Если преподаватель отменяет занятие (слот)
            if ($newGlobalStatusForSlot === 'отменена') {
                // Отменяем запись студента, только если она не была уже отменена (например, самим студентом)
                // или проведена. Если проведена - отменять уже поздно.
                if ($currentRecordStatus !== 'отменена' && $currentRecordStatus !== 'проведена') {
                    $newRecordStatus = 'отменена'; // Или 'отменена_преподавателем' для ясности
                    // Логика возврата занятия в абонемент
                    if ($studentRecord->id_subscription) {
                        $subscription = DB::table('subscription')->where('id', $studentRecord->id_subscription)->first();
                        if ($subscription) {
                            $subIsExpired = false;
                            if ($subscription->expires_at) {
                                if (Carbon::now()->gt(Carbon::parse($subscription->expires_at)->endOfDay())) {
                                    $subIsExpired = true;
                                }
                            } else {
                                $createdAt = Carbon::parse($subscription->created_at);
                                $calculatedExpiresAt = $createdAt->copy()->addMonth();
                                if (Carbon::now()->gt($calculatedExpiresAt->endOfDay())) {
                                    $subIsExpired = true;
                                }
                            }
                            if (!$subIsExpired) {
                                DB::table('subscription')
                                    ->where('id', $subscription->id)
                                    ->increment('count_lessons'); // Безопаснее использовать increment
                                // Если абонемент был неактивен из-за 0 занятий, делаем активным
                                if ($subscription->status === 'неактивный' && ($subscription->count_lessons + 1) > 0) {
                                     DB::table('subscription')
                                        ->where('id', $subscription->id)
                                        ->update(['status' => 'активный', 'updated_at' => Carbon::now()]);
                                } else {
                                    DB::table('subscription')
                                        ->where('id', $subscription->id)
                                        ->update(['updated_at' => Carbon::now()]);
                                }
                                \Log::info("Returned 1 lesson to subscription ID: {$subscription->id} for record ID: {$studentRecord->id} due to teacher cancellation.");
                            } else {
                                \Log::info("Subscription ID: {$subscription->id} is expired. Lesson not returned for record ID: {$studentRecord->id}.");
                            }
                        }
                    }
                }
            } 
            // Если преподаватель помечает как "проведена"
            elseif ($newGlobalStatusForSlot === 'проведена') {
                // Можно провести, только если запись была 'новая' (или какой-то другой активный статус, не 'отменена')
                // И если сам слот не в будущем (проверка уже была выше)
                if ($currentRecordStatus === 'новая') { // Строгая проверка: только 'новая' -> 'проведена'
                    $newRecordStatus = 'проведена';
                }
            } 
            // Если преподаватель сбрасывает статус на "новая"
            elseif ($newGlobalStatusForSlot === 'новая') {
                // Сбросить на "новая" можно, если слот НЕ в прошлом (проверка выше не пустит, если $isSlotPast и $canChangeStatusForPastSlot = false)
                // И если запись была 'проведена' или 'отменена' (но не отменена студентом, если есть такой статус)
                // Осторожно: сброс статуса для прошедших занятий теперь ограничен общей проверкой $isSlotPast.
                if ($currentRecordStatus === 'проведена' || $currentRecordStatus === 'отменена') {
                     // Дополнительно убедимся, что если слот в прошлом, то мы сюда попали, потому что все записи были 'новая'
                    if (!$isSlotPast || ($isSlotPast && $canChangeStatusForPastSlot)) {
                         $newRecordStatus = 'новая';
                    }
                }
            }

            if ($newRecordStatus !== $currentRecordStatus) {
                 DB::table('record')
                    ->where('id', $studentRecord->id)
                    ->update(['status' => $newRecordStatus, 'updated_at' => Carbon::now()]);
                $updatedStudentRecordsCount++;
            }
        }

        // Опционально: Обновить статус самого слота timings, если у вас есть такое поле для конкретной даты.
        // Например, в таблице 'teacher_slot_overrides' (id_timings, date, status_override)
        // Сейчас мы меняем только статусы student records.

        DB::commit();
        return response()->json([
            'success' => true,
            'message' => 'Статус занятия и связанных записей успешно обновлен.',
            'updated_count' => $updatedStudentRecordsCount
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Ошибка обновления статуса занятия преподавателем: ' . $e->getMessage() . ' --- Stack: ' . $e->getTraceAsString());
        return response()->json([
            'success' => false,
            'message' => 'Ошибка при обновлении статуса занятия.'
        ], 500);
    }
}


    public function addPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // до 2 МБ
        ]);

        $user = auth()->user();

        if ($request->hasFile('photo')) {
            // Генерируем уникальное имя файла
            $fileName = uniqid() . '.' . $request->file('photo')->getClientOriginalExtension();

            // Путь к папке public/photos
            $publicPath = public_path('photos');

            // Создаем папку, если она не существует
            if (!file_exists($publicPath)) {
                mkdir($publicPath, 0777, true);
            }

            // Полный путь к файлу
            $fullPath = $publicPath . '/' . $fileName;

            // Удаляем старую фотографию, если она существует
            if ($user->photo) {
                $oldFilePath = public_path($user->photo);
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }

            // Перемещаем загруженный файл
            $request->file('photo')->move($publicPath, $fileName);

            // Обновляем путь в базе данных (без public/)
            $user->photo = 'photos/' . $fileName;
            $user->save();

            return response()->json([
                'photo' => $user->photo,
                'message' => 'Фото успешно загружено'
            ], 200);
        }

        return response()->json(['error' => 'Файл не найден'], 400);
    }

    public function deletePhoto()
    {
        try {
            $user = auth()->user();
            Log::info('Запрос на удаление фото от пользователя: ' . $user->id);

            if ($user->photo) {
                $filePath = public_path($user->photo);
                if (file_exists($filePath)) {
                    unlink($filePath);
                    Log::info('Файл удален: ' . $filePath);
                } else {
                    Log::warning('Файл не найден: ' . $filePath);
                }

                $user->photo = null;
                $user->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Фото успешно удалено!'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Фото не найдено'
            ]);

        } catch (\Exception $e) {
            Log::error('Ошибка удаления фото: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении фото',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTeachersByDirection(Request $request)
    {
        $teachers = User::where('role', 'teacher')->limit(4)->get();

        return response()->json($teachers);
    }
}
