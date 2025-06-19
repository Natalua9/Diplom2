<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Timing;
use App\Http\Resources\InstructorStatResource;
use Illuminate\Support\Facades\Validator;
use App\Models\Comment;
use App\Models\Record;
use App\Models\Notification;
use App\Models\Subscription;
use Log;
use Carbon\Carbon;
use App\Models\Job_status;


use App\Models\Direction;
use App\Models\TeacherDirection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getDirections()
    {
        try {
            $directions = Direction::all();

            return response()->json([
                'directions' => $directions
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching directions: ' . $e->getMessage());

            return response()->json([
                'error' => 'Failed to fetch directions',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function adminIndex(Request $request)
    {
        try {
            // Начинаем запрос к базе данных для получения преподавателей
            $teachersQuery = User::where('role', 'teacher')
                ->with([
                    'teacherDirections.direction', // Убедимся, что и эта связь корректно работает
                    'jobStatus'
                ]);

            // Обработка поискового запроса
            if ($request->has('search')) {
                $searchTerm = $request->input('search');
                $teachersQuery->where(function ($query) use ($searchTerm) {
                    $query->where('full_name', 'like', "%{$searchTerm}%")
                        ->orWhere('email', 'like', "%{$searchTerm}%");
                });
            }

            // Фильтрация по направлениям
            if ($request->has('directions')) {
                $directionIds = $request->input('directions'); // Это массив ID из таблицы 'directions'

                if (is_array($directionIds) && count($directionIds) > 0) {
                    // Фильтруем пользователей, у которых есть записи в teacherDirections,
                    // где id_directions (внешний ключ к таблице directions) входит в массив $directionIds
                    $teachersQuery->whereHas('teacherDirections', function ($query) use ($directionIds) {
                        $query->whereIn('id_directions', $directionIds); // ИСПРАВЛЕНО
                    });
                }
            }

            // Применяем пагинацию к результатам
            $teachers = $teachersQuery->orderBy('id', 'desc')->paginate($request->input('per_page', 10));

            // Получаем все направления для фильтров
            $directions = \App\Models\Direction::all(); // Убедитесь, что модель Direction импортирована или используйте полный namespace

            // Возвращаем данные в формате JSON
            return response()->json([
                'teachers' => $teachers,
                'directions' => $directions,
            ]);
        } catch (\Exception $e) {
            // Логирование ошибки
            \Log::error('Error fetching teachers: ' . $e->getMessage() . ' Stack: ' . $e->getTraceAsString()); // Добавим стек вызовов для лучшей диагностики

            // Возвращаем пустой результат вместо ошибки
            return response()->json([
                'teachers' => [
                    'data' => [],
                    'total' => 0,
                    'per_page' => $request->input('per_page', 10),
                    'current_page' => 1,
                    'last_page' => 1,
                    'links' => []
                ],
                'directions' => \App\Models\Direction::all(), // Попытаемся загрузить направления даже при ошибке с преподавателями
                'error' => 'Failed to load teachers data. Please check logs. ' . $e->getMessage() // Более детальное сообщение для фронта (можно убрать $e->getMessage() в продакшене)
            ], 500);
        }
    }


    public function adminPerson()
    {
        $users = DB::table('users')
            ->where('role', 'user')
            ->select(
                'users.id',
                'users.full_name',
                'users.email',
                'users.phone',
                DB::raw('TIMESTAMPDIFF(YEAR, users.age, CURDATE()) as age'),
                DB::raw('(SELECT COUNT(*) FROM record WHERE record.id_user = users.id AND record.status = "проведена") as attended_lessons'),
                DB::raw('(SELECT COUNT(*) FROM record WHERE record.id_user = users.id AND record.status = "отменена") as cancelled_lessons'),
                'users.created_at as registration_date',
                DB::raw('(SELECT MAX(record.date_record) FROM record WHERE record.id_user = users.id AND record.status = "проведена") as last_lesson_date')
            )
            ->paginate(5);

        return response()->json($users);
    }
    public function adminDirection()
    {
        $directions = DB::table('directions')->paginate(5);

        return response()->json($directions);
    }
    public function addTiming(Request $request)
    {
        $request->validate([
            'id_teacher' => 'required|exists:teacher_directions,id', // id_teacher из запроса = teacher_direction_id
            'time' => 'required|date_format:H:i',
            'date' => 'required|date_format:Y-m-d', // Фронтенд присылает полную дату
        ]);

        try {
            // $request->id_teacher это ID из teacher_directions
            $teacherDirection = TeacherDirection::find($request->id_teacher);

            if (!$teacherDirection) {
                // Это не должно произойти из-за 'exists:teacher_directions,id' валидации, но для безопасности
                return response()->json(['success' => false, 'message' => 'Запись преподаватель-направление не найдена'], 404);
            }

            // Получаем ID самого преподавателя (из таблицы users) через teacherDirection
            $actualTeacherUserId = $teacherDirection->id_teacher;

            // Находим все teacher_direction_id для этого конкретного преподавателя (user_id)
            $allTeacherDirectionIdsForThisUser = TeacherDirection::where('id_teacher', $actualTeacherUserId)->pluck('id');

            // Конвертируем полученную полную дату в день недели (ISO: 1=Пн, ..., 7=Вс)
            $dayOfWeek = Carbon::parse($request->date)->dayOfWeekIso;

            // Проверяем, занят ли преподаватель (через любые его teacher_direction_id)
            // в этот день недели и время
            $existingTiming = Timing::whereIn('id_teacher', $allTeacherDirectionIdsForThisUser)
                ->where('date', $dayOfWeek) // 'date' в таблице timings - это день недели
                ->where('time', $request->time)
                ->first();

            if ($existingTiming) {
                return response()->json([
                    'success' => false,
                    'message' => 'Преподаватель уже занят в это время и день недели.'
                ], 400);
            }

            // Создаем новую запись в timings
            // 'date' => $dayOfWeek сохраняет номер дня недели
            $timing = Timing::create([
                'id_teacher' => $request->id_teacher, // Это teacher_direction_id
                'time' => $request->time,
                'date' => $dayOfWeek,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Запись успешно добавлена!',
                'timing' => $timing // Возвращаем созданную запись
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка при добавлении записи расписания: ' . $e->getMessage() . ' Stack: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Серверная ошибка при добавлении записи: ' . $e->getMessage()
            ], 500);
        }
    }

    public function adminTiming(Request $request)
    {
        $weekOffset = $request->get('week_offset', 0);
        // Убедимся, что неделя начинается с понедельника для Carbon
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY)->addWeeks($weekOffset);

        $dates = [];
        for ($i = 0; $i < 7; $i++) {
            $currentDate = $startOfWeek->copy()->addDays($i);
            $dates[] = [
                'rawDate' => $currentDate->format('Y-m-d'),
                'dayName' => $currentDate->translatedFormat('l'),
                'formattedDate' => $currentDate->format('d.m'),
                'isoDayOfWeek' => $currentDate->dayOfWeekIso, // 1 (Пн) - 7 (Вс)
            ];
        }

        $timingsData = Timing::join('teacher_directions', 'timings.id_teacher', '=', 'teacher_directions.id')
            ->join('directions', 'teacher_directions.id_directions', '=', 'directions.id')
            ->join('users', 'teacher_directions.id_teacher', '=', 'users.id') // users.id это id преподавателя
            ->select(
                'timings.id',
                'timings.date as day_of_week', // 'date' из таблицы timings это номер дня недели, алиас для фронтенда
                'timings.time',
                'timings.id_teacher', // Это teacher_direction_id
                'directions.name as direction_name',
                'directions.id as direction_id',
                'users.full_name as teacher_name',
                'users.id as actual_teacher_id' // Это ID преподавателя из таблицы users
            )
            ->orderBy('timings.date', 'asc') // Сортировка по дню недели
            ->orderBy('timings.time', 'asc')
            ->get();

        $directions = Direction::with([
            'teacherDirections.teacher' => function ($query) {
                // Можно добавить фильтр по статусу преподавателя, если нужно
                // $query->whereHas('jobStatus', function ($q) {
                //     $q->where('status', 'работает');
                // });
            }
        ])->get();

        // Log::info('Returning timings:', $timingsData->toArray());
        // Log::info('Returning directions:', $directions->toArray());

        return response()->json([
            'dates' => $dates,
            'timings' => $timingsData,
            'directions' => $directions,
            'weekOffset' => $weekOffset
        ]);
    }

    public function deleteTiming($id) // $id - это timings.id
    {
        DB::beginTransaction();
        try {
            $timingToDelete = Timing::findOrFail($id);

            // 1. Найти все записи студентов (Record), которые были сделаны на основе этого шаблона timings.
            //    Эти записи могут быть на разные конкретные даты, но все они ссылаются на один id_td.
            $studentRecords = Record::where('id_td', $timingToDelete->id)
                // Отменяем только те, что еще не отменены и не проведены
                ->whereIn('status', ['новая'])
                // Можно добавить ->where('date_record', '>=', Carbon::today()->toDateString())
                // если нужно отменять только будущие/сегодняшние, но обычно отменяют все связанные.
                ->get();

            foreach ($studentRecords as $studentRecord) {
                // А. Создаем уведомление для пользователя
                if (class_exists(Notification::class)) {
                    Notification::create([
                        'id_user' => $studentRecord->id_user,
                        'content' => 'Администратор отменил занятие из расписания, на которое вы были записаны.',
                        'status' => 'новое',
                    ]);
                }

                // Б. Возвращаем занятие в абонемент, если оно было по абонементу
                if ($studentRecord->id_subscription) {
                    $subscription = Subscription::find($studentRecord->id_subscription);
                    // Или DB::table('subscription')->where('id', $studentRecord->id_subscription)->first();

                    if ($subscription) {
                        $isExpired = false;
                        if ($subscription->expires_at) {
                            if (Carbon::now()->gt(Carbon::parse($subscription->expires_at))) {
                                $isExpired = true;
                            }
                        } else {
                            $createdAt = Carbon::parse($subscription->created_at);
                            $calculatedExpiresAt = $createdAt->copy()->addMonth(); // Ваша логика срока
                            if (Carbon::now()->gt($calculatedExpiresAt)) {
                                $isExpired = true;
                            }
                        }

                        if (!$isExpired) {
                            $subscription->count_lessons += 1;
                            if ($subscription->status === 'неактивный' && $subscription->count_lessons > 0) {
                                $subscription->status = 'активный';
                            }
                            $subscription->save();
                            // Или через DB::table:
                            // DB::table('subscription')->where('id', $subscription->id)->update([
                            //     'count_lessons' => DB::raw('count_lessons + 1'),
                            //     'status' => ($subscription->status === 'неактивный' && ($subscription->count_lessons + 1) > 0) ? 'активный' : $subscription->status
                            // ]);

                            Log::info("Admin DeleteTiming: Returned 1 lesson to subscription ID: {$subscription->id} for record ID: {$studentRecord->id}.");
                        } else {
                            Log::info("Admin DeleteTiming: Subscription ID: {$subscription->id} is expired. Lesson not returned for record ID: {$studentRecord->id}.");
                        }
                    }
                }

                // В. Обновляем статус записи студента на "отменена"
                $studentRecord->status = 'отменена'; // Или 'отменена_администратором'
                $studentRecord->save();
                // Или DB::table('record')->where('id', $studentRecord->id)->update(['status' => 'отменена']);
            }

            // 2. После обработки всех записей студентов, связанных с этим timing (шаблоном),
            //    можно удалить сам шаблон timing.
            //    Если есть записи со статусом "проведена", связанные с этим timing,
            //    возможно, вы не захотите удалять сам timing, а пометить его как "архивный"
            //    или "удален". Это зависит от бизнес-логики.
            //    Текущий код удаляет его.

            // Если нужно удалить все записи, даже проведенные (не рекомендуется, если нужна история):
            // Record::where('id_td', $timingToDelete->id)->delete();

            $timingToDelete->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Шаблон занятия и все связанные активные записи успешно отменены/удалены!'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            Log::error('Ошибка удаления занятия: Шаблон Timing не найден. ID: ' . $id . ' Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка: Шаблон занятия не найден.'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Ошибка удаления занятия: ' . $e->getMessage());
            Log::error('Трассировка: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при удалении шаблона занятия: ' . $e->getMessage()
            ], 500);
        }
    }

    // добавление направления
    public function addDirection(Request $request)
    {
        // Валидация входящих данных
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',  // добавлена валидация для фото
        ]);

        // Получаем имя файла
        $filename = time() . '.' . $request->photo->extension();

        // Сохранение файла в папку public/photos
        $request->photo->move(public_path('photos'), $filename);

        // Создаем запись в базе данных с путем к фото
        Direction::create([
            'name' => $request->name,
            'description' => $request->description,
            'photo' => 'photos/' . $filename,  // сохраняем путь к файлу в базе данных
        ]);

        return redirect()->route('adminDirection')->with('success', 'Направление успешно добавлено!');
    }
    public function delete_direction($id)
    {
        // Находим и удаляем связанные записи в teacher_directions
        DB::table('teacher_directions')->where('id_directions', $id)->delete();

        // Затем удаляем само направление
        $directions = Direction::find($id);
        $directions->delete();

        return response()->json(['message' => 'Направление успешно удалено'], 200);
    }
    public function delete_teacher($id)
    {
        // Начинаем транзакцию базы данных
        DB::beginTransaction();

        try {
            // Находим преподавателя
            $teacher = User::findOrFail($id);

            // Получаем ID статусов "уволен" и "работает" из таблицы job_status
            $firedStatusId = Job_status::where('status', 'уволен')->first()->id ?? null;
            $activeStatusId = Job_status::where('status', 'работает')->first()->id ?? null;

            // Если статусы не найдены, создаем их
            if (!$firedStatusId) {
                $firedStatus = Job_status::create(['status' => 'уволен']);
                $firedStatusId = $firedStatus->id;
            }

            if (!$activeStatusId) {
                $activeStatus = Job_status::create(['status' => 'работает']);
                $activeStatusId = $activeStatus->id;
            }

            // Определяем текущий статус и меняем его на противоположный
            $newStatusId = ($teacher->id_job_status == $firedStatusId) ? $activeStatusId : $firedStatusId;
            $newStatusName = ($teacher->id_job_status == $firedStatusId) ? 'работает' : 'уволен';

            // Обновляем статус преподавателя
            $teacher->id_job_status = $newStatusId;
            $teacher->save();

            // Завершаем транзакцию
            DB::commit();

            return response()->json([
                'message' => "Статус преподавателя изменен на \"$newStatusName\"",
                'status' => $newStatusName
            ], 200);
        } catch (\Exception $e) {
            // Откатываем транзакцию в случае ошибки
            DB::rollBack();

            return response()->json([
                'message' => 'Ошибка при изменении статуса преподавателя',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // смена статуса отзыва 
    public function comment(Request $request)
    {
        $status = $request->status;
        $comments = Comment::with('user')
            ->when($status, function ($query) use ($status) {
                return $query->where('status', $status);
            })
            ->paginate(5);

        return response()->json($comments);
    }

    public function addComment(Request $request)
    {
        // Проверка на авторизацию
        if (!Auth::check()) {
            return response()->json(['error' => 'Вы должны быть авторизованы для добавления комментария.'], 401);
        }

        // Валидация входящих данных
        $validated = $request->validate([
            'contant' => 'required|string|max:1000',
            'rating' => 'required|integer|between:1,5',
            'id_teacher' => 'required|integer|exists:users,id', // Проверяем, что такой учитель существует в таблице users
            'id_record' => 'required|integer|exists:record,id', // <--- ДОБАВЛЕНО: Проверяем, что такая запись на занятие существует
        ]);

        // Log::info('Validated data for comment:', $validated); // Для отладки

        try {
            // Создание нового комментария с рейтингом и id_record
            $comment = Comment::create([
                'contant' => $validated['contant'], // Лучше использовать $validated['contant']
                'id_user' => Auth::id(),
                'rating' => $validated['rating'],   // Лучше использовать $validated['rating']
                'id_teacher' => $validated['id_teacher'], // Лучше использовать $validated['id_teacher']
                'id_record' => $validated['id_record'],   // <--- ДОБАВЛЕНО: Сохраняем id_record
            ]);

            // Log::info('Comment created:', $comment->toArray()); // Для отладки

            return response()->json([
                'success' => true,
                'message' => 'Ваш отзыв успешно отправлен!',
                'comment' => $comment->load('user') // Можно сразу вернуть комментарий с данными пользователя
            ], 201);

        } catch (\Exception $e) {
            // Log::error('Error creating comment: ' . $e->getMessage()); // Для отладки
            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при добавлении отзыва.',
                'error_details' => $e->getMessage() // Опционально, для отладки на стороне клиента
            ], 500);
        }
    }
    public function CommentUpdate(Request $request, $id)
    {

        $comment = Comment::findOrFail($id);
        $comment->status = $request->status;
        $comment->save();

        return response()->json(['success' => true]);
    }
    public function updateDirection(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',  // Фото опционально
        ]);

        // Найдем направление по ID
        $direction = Direction::findOrFail($request->id);

        // Обрабатываем фото, если оно было загружено
        if ($request->hasFile('photo')) {
            // Удаляем старое фото, если оно существует
            if ($direction->photo && file_exists(public_path($direction->photo))) {
                unlink(public_path($direction->photo)); // удаляем файл
            }

            // Загружаем новое фото
            $filename = time() . '.' . $request->photo->extension();
            $request->photo->move(public_path('photos'), $filename);
            $direction->photo = 'photos/' . $filename;  // Сохраняем путь к новому файлу
        }

        // Обновляем другие данные
        $direction->name = $request->name;
        $direction->description = $request->description;
        $direction->save();

        return redirect()->route('adminDirection')->with('success', 'Направление успешно обновлено!');
    }
    public function addDirectionTeacher(Request $request)
    {
        \Log::info('Request data:', $request->all());

        try {
            $request->validate([
                'directions' => 'required',
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $request->id,
                'phone' => 'required|digits_between:10,11',
                'age' => 'required|date|before:today',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Decode the JSON string to an array
            $directions = json_decode($request->directions, true);

            $user = User::findOrFail($request->id);

            // Обрабатываем загрузку фото
            if ($request->hasFile('photo')) {
                // Генерируем уникальное имя файла
                $fileName = uniqid() . '.' . $request->file('photo')->getClientOriginalExtension();

                // Путь к папке public/photos
                $publicPath = public_path('photos');

                // Создаем папку, если она не существует
                if (!file_exists($publicPath)) {
                    mkdir($publicPath, 0777, true);
                }

                // Удаляем старую фотографию, если она существует
                if ($user->photo) {
                    $oldFilePath = public_path($user->photo);
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }

                // Перемещаем загруженный файл
                $request->file('photo')->move($publicPath, $fileName);

                // Добавляем обновленный путь к фото в обновляемые данные
                $user->photo = 'photos/' . $fileName;
            }

            $user->update([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'age' => $request->age,
            ]);

            TeacherDirection::where('id_teacher', $request->id)->delete();

            foreach ($directions as $directionId) {
                TeacherDirection::create([
                    'id_teacher' => $request->id,
                    'id_directions' => $directionId,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Преподаватель успешно обновлен'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation errors:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            \Log::error('Error updating teacher:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при обновлении преподавателя',
                'error' => $e->getMessage()
            ], 500);
        }
    }


     public function getInstructorStats(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|digits:4',
            'per_page' => 'integer|min:1|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $month = $request->input('month');
        $year = $request->input('year');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $instructorsStats = DB::table('users as u')
            ->join('job_status as js', 'u.id_job_status', '=', 'js.id')
            // 1. Соединение users с teacher_directions
            ->leftJoin('teacher_directions as td', 'u.id', '=', 'td.id_teacher')
            // 2. Соединение teacher_directions с timings
            //    Убедитесь, что в таблице timings поле для связи с teacher_directions также называется id_teacher
            //    Если оно называется по-другому (например, id_teacher_direction), измените 't.id_teacher'
            ->leftJoin('timings as t', 'td.id', '=', 't.id_teacher')
            // 3. Соединение timings с record
            ->leftJoin('record as r', function($join) use ($year, $month) {
                $join->on('t.id', '=', 'r.id_td')
                    ->where('r.status', '=', 'проведена')
                    ->whereYear('r.date_record', '=', $year)
                    ->whereMonth('r.date_record', '=', $month);
            })
            ->where('u.role', '=', 'teacher')
            ->where('js.status', '=', 'работает')
            ->select(
                'u.id',
                'u.full_name as instructor_name',
                DB::raw('COUNT(r.id) as lessons_taught')
            )
            ->groupBy('u.id', 'u.full_name')
            ->orderByDesc('lessons_taught')
            ->orderBy('u.full_name')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $instructorsStats->items(),
            'current_page' => $instructorsStats->currentPage(),
            'first_page_url' => $instructorsStats->url(1),
            'from' => $instructorsStats->firstItem(),
            'last_page' => $instructorsStats->lastPage(),
            'last_page_url' => $instructorsStats->url($instructorsStats->lastPage()),
            'next_page_url' => $instructorsStats->nextPageUrl(),
            'path' => $instructorsStats->path(),
            'per_page' => $instructorsStats->perPage(),
            'prev_page_url' => $instructorsStats->previousPageUrl(),
            'to' => $instructorsStats->lastItem(),
            'total' => $instructorsStats->total(),
        ]);
    }
}
