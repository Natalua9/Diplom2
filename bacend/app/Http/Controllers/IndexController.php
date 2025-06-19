<?php
namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Comment;
use App\Models\Record;
use App\Models\Timing;
use App\Models\Direction;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Log;
use Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable; // Для отлова исключений в транзакции

class IndexController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api', ['only' => ['user', 'update_user_data', 'store']]);
    }
    public function index(Request $request)
    {
        try {
            // Загрузка опубликованных комментариев с информацией об авторе и преподавателе
            $commentsForDisplay = Comment::where('status', 'выложить')
                ->with([
                    'user:id,full_name,photo',      // Автор комментария
                    'teacher:id,full_name'          // Преподаватель, которому адресован отзыв
                ])
                ->latest() // Сначала последние
                ->take(5)  //  5 последних отзывов для слайдера
                ->get();


            $weekOffset = $request->get('week_offset', 0);
            $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY)->addWeeks($weekOffset);

            $dates = [];
            for ($i = 0; $i < 7; $i++) {
                $currentDate = $startOfWeek->copy()->addDays($i);
                $dates[] = [
                    'rawDate' => $currentDate->format('Y-m-d'),
                    'dayName' => $currentDate->translatedFormat('l'),
                    'formattedDate' => $currentDate->format('d.m'),
                    'isoDayOfWeek' => $currentDate->dayOfWeekIso,
                ];
            }

            $scheduleQuery = Timing::join('teacher_directions', 'timings.id_teacher', '=', 'teacher_directions.id')
                ->join('directions', 'teacher_directions.id_directions', '=', 'directions.id')
                ->join('users', 'teacher_directions.id_teacher', '=', 'users.id')
                ->select(
                    'timings.id',
                    'timings.date as day_of_week',
                    'timings.time',
                    'directions.name as direction_name',
                    'users.full_name as teacher_name',
                    'users.id as actual_teacher_id'
                )
                ->orderBy('timings.date', 'asc')
                ->orderBy('timings.time', 'asc');
            $schedule = $scheduleQuery->get();

            $teacherRatings = Comment::where('status', 'выложить')
                ->select('id_teacher', DB::raw('AVG(rating) as average_rating'))
                ->groupBy('id_teacher')
                ->pluck('average_rating', 'id_teacher');

            $schedule->transform(function ($item) use ($teacherRatings) {
                $item->duration = $item->duration ?? '1 час';
                $item->teacher_rating = isset($teacherRatings[$item->actual_teacher_id])
                    ? round($teacherRatings[$item->actual_teacher_id], 1)
                    : null;
                return $item;
            });

            $directions = Direction::select('id', 'name')->get();

            return response()->json([
                'dates' => $dates,
                'schedule' => $schedule,
                'directions' => $directions,
                'weekOffset' => $weekOffset,
                'comments' => $commentsForDisplay,
            ]);

        } catch (\Exception $e) {
            Log::error('Ошибка на сервере при получении данных (public): ' . $e->getMessage() . ' Stack: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Ошибка сервера при загрузке данных.'], 500);
        }
    }
    public function markNotificationAsRead(Request $request)
    {
        $notificationId = $request->input('id');

        $notification = Notification::find($notificationId);

        if (!$notification) {
            return response()->json(['error' => 'Уведомление не найдено'], 404);
        }

        $notification->status = 'прочитано';
        $notification->save();

        return response()->json(['message' => 'Уведомление подтверждено']);
    }

    public function direction()
    {
        $directions = DB::table('directions')->paginate(4);

        return response()->json($directions);
    }
    public function user(Request $request)
    {
        $user_auth_data = Auth::user();

        if (!$user_auth_data) {
            return response()->json(['error' => 'Необходимо авторизоваться'], 401);
        }

        $user_id = $user_auth_data->id;
        $weekOffset = $request->get('week_offset', 0);

        // ... (код для $dates и $records остается без изменений) ...
        $startOfWeek = Carbon::now()->startOfWeek()->addWeeks($weekOffset);
        $endOfWeek = $startOfWeek->copy()->endOfWeek();

        $dates = [];
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $dates[] = [
                'dayOfWeekIso' => $date->dayOfWeekIso,
                'dayName' => $date->translatedFormat('l'),
                'date' => $date->format('Y-m-d'),
            ];
        }

        $recordsQuery = DB::table('record')
            ->join('timings', 'timings.id', '=', 'record.id_td')
            ->join('teacher_directions', 'timings.id_teacher', '=', 'teacher_directions.id')
            ->join('directions', 'teacher_directions.id_directions', '=', 'directions.id')
            ->join('users as teacher_user', 'teacher_directions.id_teacher', '=', 'teacher_user.id')
            ->where('record.id_user', '=', $user_id)
            ->whereBetween('record.date_record', [$startOfWeek->format('Y-m-d'), $endOfWeek->format('Y-m-d')])
            ->select(
                'record.id',
                'record.status',
                'record.date_record',
                'record.time_record',
                'teacher_user.id as teacher_id',
                'teacher_user.full_name as teacher_full_name',
                'directions.name as direction_name'
            )
            ->orderBy('record.date_record')
            ->orderBy('record.time_record')
            ->get();

        $groupedRecords = [];
        if ($recordsQuery) {
            foreach ($recordsQuery as $record) {
                $dayOfWeek = Carbon::parse($record->date_record)->dayOfWeekIso;
                $groupedRecords[$dayOfWeek][] = [
                    'id' => $record->id,
                    'time_record' => Carbon::parse($record->time_record)->format('H:i'),
                    'status' => $record->status,
                    'teacher' => [
                        'id' => $record->teacher_id,
                        'full_name' => $record->teacher_full_name
                    ],
                    'direction' => [
                        'name' => $record->direction_name
                    ]
                ];
            }
        }

        $userSubscriptions = DB::table('subscription')
            ->join('directions', 'subscription.id_direction', '=', 'directions.id')
            ->where('subscription.id_user', $user_id)
            ->select(
                'subscription.id',
                'subscription.id_user',
                'subscription.count_lessons',
                'subscription.status as db_status',
                'subscription.created_at',
                'subscription.updated_at as subscription_updated_at',
                'subscription.expires_at',
                'directions.name as direction_name',
                'directions.id as direction_id'
            )
            ->orderBy('subscription.created_at', 'desc')
            ->get()
            ->map(function ($sub) {
                Log::info("Processing subscription ID: {$sub->id}, User ID: {$sub->id_user}");
                Log::info("Initial data - DB Status: {$sub->db_status}, Count Lessons: {$sub->count_lessons}, Expires At: " . ($sub->expires_at ? $sub->expires_at : 'NULL'));

                $actualStatus = $sub->db_status;
                $original_db_status = $sub->db_status;
                $userIdForNotification = $sub->id_user;
                $subscription_id_for_notification = $sub->id;
                $direction_name_for_notification = $sub->direction_name;
                $sub_expires_at_date = $sub->expires_at ? Carbon::parse($sub->expires_at) : null;

                // 1. Определение текущего актуального статуса абонемента (активен/неактивен)
                if ($actualStatus === 'активный' && $sub->count_lessons <= 0) {
                    $actualStatus = 'неактивный';
                }
                if ($actualStatus === 'активный' && $sub_expires_at_date && $sub_expires_at_date->endOfDay()->isPast()) {
                    $actualStatus = 'неактивный';
                }

                Log::info("Subscription ID: {$sub->id} - Original DB Status: {$original_db_status}, Calculated Actual Status: {$actualStatus}");

                // --- ЛОГИКА УВЕДОМЛЕНИЙ ---
                $unique_prefix = "Абонемент ID:{$subscription_id_for_notification} на '{$direction_name_for_notification}'";

                // УВЕДОМЛЕНИЕ: АБОНЕМЕНТ ЗАКОНЧИЛСЯ
                if (
                    ($original_db_status === 'активный' && $actualStatus === 'неактивный') ||
                    ($actualStatus === 'неактивный' && $sub->count_lessons <= 0 && $original_db_status === 'неактивный')
                ) { // Добавлено условие для "догоняющего"
    
                    $reason_for_expiry = "";
                    if ($sub->count_lessons <= 0) {
                        $reason_for_expiry = "закончились занятия";
                    } elseif ($sub_expires_at_date && $sub_expires_at_date->endOfDay()->isPast()) {
                        $reason_for_expiry = "истек срок действия (" . $sub_expires_at_date->format('d.m.Y') . ")";
                    }

                    $notification_content = "{$unique_prefix} ЗАКОНЧИЛСЯ";
                    if ($reason_for_expiry) {
                        $notification_content .= " (причина: {$reason_for_expiry}).";
                    } else {
                        $notification_content .= ".";
                    }
                    Log::info("Subscription ID: {$sub->id} - Potential 'expired' notification. Content: [{$notification_content}]");

                    // Проверяем, есть ли уже *любое* (не только 'новое') уведомление о том, что он ЗАКОНЧИЛСЯ
                    $exists_any_expired_notification = DB::table('notifications')
                        ->where('id_user', $userIdForNotification)
                        ->where('content', 'LIKE', $unique_prefix . " ЗАКОНЧИЛСЯ%")
                        ->exists();

                    if (!$exists_any_expired_notification) {
                        Log::info("Subscription ID: {$sub->id} - Creating 'expired' notification (was missing).");
                        $created_at_for_notification = ($original_db_status === 'неактивный' && $sub->subscription_updated_at) ? Carbon::parse($sub->subscription_updated_at) : Carbon::now();
                        if ($created_at_for_notification->gt(Carbon::now()))
                            $created_at_for_notification = Carbon::now();

                        DB::table('notifications')->insert([
                            'id_user' => $userIdForNotification,
                            'content' => $notification_content,
                            'status' => 'новое',
                            'created_at' => $created_at_for_notification,
                            'updated_at' => Carbon::now(),
                        ]);
                        // Помечаем связанные "скоро закончится" и "мало занятий" уведомления как прочитанные
                        DB::table('notifications')
                            ->where('id_user', $userIdForNotification)
                            ->where(function ($query) use ($unique_prefix) {
                            $query->where('content', 'LIKE', $unique_prefix . " СКОРО ЗАКОНЧИТСЯ%")
                                ->orWhere('content', 'LIKE', $unique_prefix . " ОСТАЛОСЬ 1 ЗАНЯТИЕ%");
                        })
                            ->where('status', 'новое')
                            ->update(['status' => 'прочитано', 'updated_at' => Carbon::now()]);
                        Log::info("Subscription ID: {$sub->id} - 'Expired' notification created. Related 'soon'/'low lessons' notifications marked as read.");
                    } else {
                        Log::info("Subscription ID: {$sub->id} - 'Expired' notification NOT created because one already exists.");
                    }
                }
                // УВЕДОМЛЕНИЯ ДЛЯ АКТИВНЫХ АБОНЕМЕНТОВ
                else if ($actualStatus === 'активный') {
                    Log::info("Subscription ID: {$sub->id} - Is 'активный'. Checking for 'low lessons' or 'expiring soon' notifications.");

                    // УВЕДОМЛЕНИЕ: ОСТАЛОСЬ 1 ЗАНЯТИЕ
                    if ($sub->count_lessons === 1) {
                        $notification_content_low_lessons = "{$unique_prefix} ОСТАЛОСЬ 1 ЗАНЯТИЕ. Не забудьте продлить.";
                        Log::info("Subscription ID: {$sub->id} - Potential 'low lessons' notification. Content: [{$notification_content_low_lessons}]");

                        $exists_unconfirmed_low_lessons = DB::table('notifications')
                            ->where('id_user', $userIdForNotification)
                            ->where('content', $notification_content_low_lessons) // Точное совпадение для этого типа
                            ->where('status', 'новое')
                            ->exists();

                        if (!$exists_unconfirmed_low_lessons) {
                            Log::info("Subscription ID: {$sub->id} - Creating 'low lessons' notification.");
                            DB::table('notifications')->insert([
                                'id_user' => $userIdForNotification,
                                'content' => $notification_content_low_lessons,
                                'status' => 'новое',
                                'created_at' => Carbon::now(),
                                'updated_at' => Carbon::now(),
                            ]);
                        } else {
                            Log::info("Subscription ID: {$sub->id} - 'Low lessons' notification NOT created (already exists and unconfirmed).");
                        }
                    }

                    // УВЕДОМЛЕНИЕ: СКОРО ЗАКОНЧИТСЯ ПО ВРЕМЕНИ (но есть занятия > 0)
                    if ($sub_expires_at_date && $sub->count_lessons > 0) {
                        $today = Carbon::now()->startOfDay();
                        $expires_on_date_obj = $sub_expires_at_date->copy()->startOfDay();
                        $days_to_notify_before = 3; // Уведомлять за 0, 1, 2, 3 дня до истечения
    
                        if ($expires_on_date_obj->gte($today) && $expires_on_date_obj->lte($today->copy()->addDays($days_to_notify_before))) {
                            $daysRemaining = $today->diffInDays($expires_on_date_obj);
                            $lessons_remaining_str = "осталось {$sub->count_lessons} " . ($sub->count_lessons == 1 ? "занятие" : "занятий");

                            $notification_content_expiring_soon = "{$unique_prefix} СКОРО ЗАКОНЧИТСЯ по времени.";
                            if ($daysRemaining == 0) {
                                $notification_content_expiring_soon .= " Срок истекает СЕГОДНЯ ({$expires_on_date_obj->format('d.m.Y')}). У вас {$lessons_remaining_str}.";
                            } else {
                                $days_str = trans_choice('день|дня|дней', $daysRemaining, [], 'ru');
                                if ($days_str === 'день|дня|дней') {
                                    $rem = $daysRemaining % 10;
                                    $rem100 = $daysRemaining % 100;
                                    if ($rem == 1 && $rem100 != 11)
                                        $days_str = "день";
                                    elseif ($rem >= 2 && $rem <= 4 && ($rem100 < 10 || $rem100 >= 20))
                                        $days_str = "дня";
                                    else
                                        $days_str = "дней";
                                }
                                $notification_content_expiring_soon .= " Срок истекает через {$daysRemaining} {$days_str} ({$expires_on_date_obj->format('d.m.Y')}). У вас {$lessons_remaining_str}.";
                            }
                            Log::info("Subscription ID: {$sub->id} - Potential 'expiring soon by time' notification. Content: [{$notification_content_expiring_soon}]");

                            $exists_unconfirmed_soon = DB::table('notifications')
                                ->where('id_user', $userIdForNotification)
                                ->where('content', 'LIKE', $unique_prefix . " СКОРО ЗАКОНЧИТСЯ%") // Ищем по префиксу
                                ->where('status', 'новое')
                                ->exists();

                            if (!$exists_unconfirmed_soon) {
                                Log::info("Subscription ID: {$sub->id} - Creating 'expiring soon by time' notification.");
                                DB::table('notifications')->insert([
                                    'id_user' => $userIdForNotification,
                                    'content' => $notification_content_expiring_soon,
                                    'status' => 'новое',
                                    'created_at' => Carbon::now(),
                                    'updated_at' => Carbon::now(),
                                ]);
                            } else {
                                Log::info("Subscription ID: {$sub->id} - 'Expiring soon by time' notification NOT created (already exists and unconfirmed).");
                            }
                        }
                    }
                } else {
                    Log::info("Subscription ID: {$sub->id} - No conditions met for active subscription notifications (status is '{$actualStatus}').");
                }

                // Обновление статуса абонемента в БД
                if ($original_db_status !== $actualStatus) {
                    Log::info("Subscription ID: {$sub->id} - Updating subscription status in DB from '{$original_db_status}' to '{$actualStatus}'.");
                    DB::table('subscription')
                        ->where('id', $sub->id)
                        ->update([
                            'status' => $actualStatus,
                            'count_lessons' => ($actualStatus === 'неактивный' && $sub->count_lessons <= 0) ? 0 : $sub->count_lessons,
                            'updated_at' => Carbon::now(),
                        ]);
                }

                $sub->status = $actualStatus;
                $sub->expires_at_formatted = $sub_expires_at_date ? $sub_expires_at_date->format('d.m.Y') : null;

                unset($sub->db_status);
                unset($sub->subscription_updated_at);
                return $sub;
            });

        $notifications = DB::table('notifications')
            ->where('id_user', $user_id)
            ->where('status', 'новое')
            ->orderBy('created_at', 'desc')
            ->get();

        // ... (остальной код для $comments, $availableDirections, $age и возврата response()->json(...)) ...
        // $comments = DB::table('comments')
        //     ->where('id_user', $user_id)
        //     ->select('id', 'id_teacher', 'contant', 'rating', 'created_at')
        //     ->get();

        $comments = DB::table('comments')
            ->where('id_user', $user_id)
            ->select('id', 'id_teacher', 'id_user', 'id_record', 'contant', 'rating', 'created_at') // <--- ДОБАВЛЕНО 'id_record' и 'id_user' для полноты
            ->get();

        $availableDirections = DB::table('directions')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $age = $user_auth_data->age ? Carbon::parse($user_auth_data->age)->format('Y-m-d') : null;

        return response()->json([
            'user' => [
                'full_name' => $user_auth_data->full_name ?? '',
                'phone' => $user_auth_data->phone ?? '',
                'email' => $user_auth_data->email ?? '',
                'age' => $age,
                'photo' => $user_auth_data->photo ?? '',
            ],
            'records' => $groupedRecords,
            'dates' => $dates,
            'notifications' => $notifications,
            'comments' => $comments,
            'subscriptions' => $userSubscriptions,
            'available_directions' => $availableDirections
        ]);
    }
    // метод для получения только комментариев пользователя
    public function userComments()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['error' => 'Необходимо авторизоваться'], 401);
        }

        $comments = DB::table('comments')
            ->where('id_user', $userId)
            ->select('id', 'id_teacher','id_record', 'contant', 'rating', 'created_at', 'status') 
            ->get();

        return response()->json([
            'comments' => $comments
        ]);
    }


    // обновление данных у  пользователя
    public function update_user_data(Request $request)
    {
        $id = Auth::id();

        // Кастомные сообщения об ошибках на русском языке
        $messages = [
            'full_name.required' => 'Поле "Имя" обязательно для заполнения',
            'full_name.string' => 'Поле "Имя" должно быть строкой',
            'full_name.max' => 'Поле "Имя" не должно превышать 255 символов',

            'email.required' => 'Поле "Email" обязательно для заполнения',
            'email.email' => 'Поле "Email" должно быть действительным электронным адресом',
            'email.unique' => 'Такой Email уже используется другим пользователем',
            'email.regex' => 'Поле "Email" должно заканчиваться на @mail.ru или @google.com',

            'phone.required' => 'Поле "Телефон" обязательно для заполнения',
            'phone.digits_between' => 'Поле "Телефон" должно содержать от 10 до 11 цифр',

            'age.required' => 'Поле "Дата рождения" обязательно для заполнения',
            'age.date' => 'Поле "Дата рождения" должно быть датой',
            'age.before' => 'Дата рождения должна быть ранее сегодняшнего дня',
        ];

        // Валидация с передачей кастомных сообщений
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'unique:users,email,' . $id,
                'regex:/^.+@(mail\.ru|google\.com)$/i'  // Проверка на mail.ru или google.com
            ],
            'phone' => 'required|digits_between:10,11',
            'age' => 'required|date|before:today',
        ], $messages);

        $user = User::findOrFail($id);
        $user->full_name = $validated['full_name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->age = $validated['age'];
        $user->save();

        return redirect()->route('user')->with('success', 'Данные успешно обновлены!');
    }
    // обновление данных у преподавателя
    public function update_teacher_data(Request $request)
    {
        $id = Auth::id();
        $user = User::findOrFail($id);

        // Кастомные сообщения об ошибках на русском языке
        $messages = [
            'full_name.required' => 'Поле "Имя" обязательно для заполнения',
            'full_name.string' => 'Поле "Имя" должно быть строкой',
            'full_name.max' => 'Поле "Имя" не должно превышать 255 символов',

            'email.required' => 'Поле "Email" обязательно для заполнения',
            'email.email' => 'Поле "Email" должно быть действительным электронным адресом',
            'email.unique' => 'Такой Email уже используется другим пользователем',
            'email.regex' => 'Поле "Email" должно заканчиваться на @mail.ru или @google.com',

            'phone.required' => 'Поле "Телефон" обязательно для заполнения',
            'phone.digits_between' => 'Поле "Телефон" должно содержать от 10 до 11 цифр',

            'age.required' => 'Поле "Дата рождения" обязательно для заполнения',
            'age.date' => 'Поле "Дата рождения" должно быть датой',
            'age.before' => 'Дата рождения должна быть ранее сегодняшнего дня',
        ];

        // Валидация с передачей кастомных сообщений
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'unique:users,email,' . $id,
                'regex:/^.+@(mail\.ru|google\.com)$/i'  // Проверка на mail.ru или google.com
            ],
            'phone' => 'required|digits_between:10,11',
            'age' => 'required|date|before:today',
        ], $messages);

        // Обновление данных
        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Данные успешно обновлены!',
            'user' => $user
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'id_td' => 'required|integer|exists:timings,id',
            'class_date' => 'required|date_format:Y-m-d',
        ]);

        $timingId = $request->input('id_td');
        $classDate = $request->input('class_date');
        $user = Auth::user(); // Получаем объект авторизованного пользователя

        if (!$user) {
            return response()->json(['error' => 'Пользователь не авторизован.'], 401);
        }
        $userId = $user->id;

        DB::beginTransaction();
        try {

            $timingDetails = DB::table('timings')
                ->join('teacher_directions', 'timings.id_teacher', '=', 'teacher_directions.id')
                ->where('timings.id', $timingId)
                ->select(
                    'timings.id',
                    'timings.date as day_of_week', // День недели из таблицы timings (1-7)
                    'timings.time',
                    'teacher_directions.id_directions' // ID направления
                )
                ->first();

            if (!$timingDetails || !isset($timingDetails->id_directions)) {
                DB::rollBack();
                return response()->json(['error' => 'Слот времени не найден или не связан с направлением.'], 404);
            }
            $idDirection = $timingDetails->id_directions;

            // Проверка соответствия дня недели
            $providedDateDayOfWeek = Carbon::parse($classDate)->dayOfWeekIso;
            if ((int) $timingDetails->day_of_week !== $providedDateDayOfWeek) {
                DB::rollBack();
                return response()->json(['error' => 'Выбранный день недели не соответствует расписанию для этого занятия.'], 400);
            }

            // Проверка на существующую запись
            $existingRecord = Record::where('id_user', $userId)
                ->where('id_td', $timingId)
                ->where('date_record', $classDate)
                ->first();

            if ($existingRecord) {
                DB::rollBack();
                return response()->json(['error' => 'Вы уже записаны на это занятие на указанную дату.'], 400);
            }

            // Проверка и обновление абонемента
            $activeSubscription = DB::table('subscription')
                ->where('id_user', $userId)
                ->where('id_direction', $idDirection)
                ->where('status', 'активный')
                ->where('count_lessons', '>', 0)
                ->orderBy('created_at', 'asc')
                ->first();

            if (!$activeSubscription) {
                DB::rollBack();
                return response()->json(['error' => 'У вас нет активного абонемента на это направление, закончились занятия или абонемент истек. Пожалуйста, оформите новый абонемент.'], 400);
            }

            $newLessonCount = $activeSubscription->count_lessons - 1;
            $newStatusSubscription = ($newLessonCount <= 0) ? 'неактивный' : 'активный';

            DB::table('subscription')
                ->where('id', $activeSubscription->id)
                ->update([
                    'count_lessons' => $newLessonCount,
                    'status' => $newStatusSubscription,
                ]);

            // Создание записи на занятие
            $record = Record::create([
                'id_user' => $userId,
                'id_td' => $timingDetails->id,
                'id_subscription' => $activeSubscription->id, // <--- СОХРАНЯЕМ ID АБОНЕМЕНТА
                'date_record' => $classDate,
                'time_record' => $timingDetails->time,
            ]);
            // Отправка письма 
            $carbonDate = Carbon::parse($classDate);
            $russianMonths = [
                '01' => 'января',
                '02' => 'февраля',
                '03' => 'марта',
                '04' => 'апреля',
                '05' => 'мая',
                '06' => 'июня',
                '07' => 'июля',
                '08' => 'августа',
                '09' => 'сентября',
                '10' => 'октября',
                '11' => 'ноября',
                '12' => 'декабря'
            ];
            $day = $carbonDate->day;
            $month = $carbonDate->format('m');
            $year = $carbonDate->year;
            $russianDate = $day . ' ' . $russianMonths[$month] . ' ' . $year;
            $formattedTime = Carbon::parse($timingDetails->time)->format('H:i');



            if ($user->email && filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
                Mail::send([], [], function ($message) use ($user, $formattedTime, $russianDate) {
                    $message->to('mironova.natasha.05@mail.ru') // Замените на ваш email
                        ->subject('Новое сообщение о записи на занятие')
                        ->html('
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px; background-color: #f9f9f9; }
        .header { background-color: #4a76a8; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; margin: -20px -20px 20px; }
        .content { background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
        .highlight { font-weight: bold; color: #4a76a8; font-size: 18px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h2>Подтверждение записи на занятие</h2></div>
        <div class="content">
            <p>Уважаемый клиент!</p>
            <p>Вы успешно записались на занятие:</p>
            <p class="highlight">Дата: ' . $russianDate . '</p>
            <p class="highlight">Время: ' . $formattedTime . '</p>
            <p>Пожалуйста, приходите вовремя. В случае изменения планов, просим сообщить заранее.</p>
            <p>С уважением,<br>Администрация</p>
        </div>
        <div class="footer"><p>© ' . date('Y') . ' Наша Компания. Это автоматическое письмо, пожалуйста, не отвечайте на него.</p></div>
    </div>
</body>
</html>
                ');
                });
            }

            DB::commit(); // Все операции успешны, фиксируем изменения

            return response()->json([
                'message' => 'Вы успешно записались на занятие! Количество занятий в абонементе обновлено. Письмо о записи будет отправлено на почту.',
                'data' => $record // Возвращаем созданную запись
            ], 201);

        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json(['error' => 'Произошла ошибка при записи на занятие. ' . $e->getMessage()], 500);
        }
    }

    // отправка письма со страницы контактов
    public function send(Request $request)
    {
        // Валидация данных формы
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'message' => 'required|string',
        ]);

        try {
            // Отправка письма
            Mail::send([], [], function ($message) use ($request) {
                $message->to('mironova.natasha.05@mail.ru')
                    ->subject('Новое сообщение от ' . $request->name)
                    ->html("
                    <p><strong>Имя:</strong> {$request->name}</p>
                    <p><strong>Email:</strong> {$request->email}</p>
                    <p><strong>Сообщение:</strong><br>{$request->message}</p>
                ");
            });

            return response()->json(['message' => 'Сообщение успешно отправлено!'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка при отправке сообщения.'], 500);
        }
    }



}
