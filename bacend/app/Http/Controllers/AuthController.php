<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\TeacherDirection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['signin', 'signup']]);
    }

    public function signin(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');
        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Неверный email или пароль'], 401);
        }

        $user = auth()->user();
        
        return response()->json([
            'success' => true,
            'token' => $token,
            'role' => $user->role,
            'user' => $user
        ]);
    }

    public function signup(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|digits_between:10,11',
            'age' => 'required|date|before:today',
            'password' => 'required|min:6',
        ]);

        try {
            $user = User::create([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'age' => $request->age,
                'gender' => $request->gender,
                'password' => Hash::make($request->password),
            ]);
            
            return response()->json([
                'message' => 'Регистрация успешна',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка сервера' . $e], 500);
        }
    }

    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function refresh()
    {
        return response()->json([
            'token' => auth()->refresh(),
            'user' => auth()->user()
        ]);
    }
   public function signupTeacher(Request $request)
{
    try {
        \Log::info('Incoming teacher signup data:', $request->all());

        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized. Только администраторы могут регистрировать преподавателей.'
            ], 401);
        }

        // Нормализация телефонного номера перед валидацией
        $phoneInput = $request->input('phone');
        if ($phoneInput) {
            $numericPhone = preg_replace('/\D/', '', $phoneInput); // Удаляем все нецифровые символы
            $request->merge(['phone' => $numericPhone]); // Обновляем значение в запросе
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => [ // Обновленные правила для телефона
                'required',
                'digits:11',     // Ровно 11 цифр
                'regex:/^(7|8)/' // Начинается с 7 или 8
            ],
            'age' => 'required|date|before:today', // 'age' здесь - это дата рождения (birth_date)
            'gender' => 'required|in:мужчина,женщина',
            'password' => 'required|min:6',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            // 'directions' валидируются отдельно, т.к. приходят как JSON строка
        ],[
            // Кастомные сообщения для поля phone
            'phone.required' => 'Поле "Телефон" обязательно для заполнения.',
            'phone.digits' => 'Телефонный номер должен состоять ровно из 11 цифр (например, 79XXXXXXXXX или 89XXXXXXXXX).',
            'phone.regex' => 'Телефонный номер должен начинаться с 7 или 8 (после удаления всех нецифровых символов, включая +).',
        ]);

        $user = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'], // Здесь уже будет нормализованный номер
            'age' => $validated['age'],       // Дата рождения
            'gender' => $validated['gender'],
            'role' => 'teacher',
            'password' => Hash::make($validated['password']),
            'id_job_status' => 1, // Предполагается, что 1 - это "работает"
        ]);

        if ($request->hasFile('photo')) {
            $fileName = uniqid() . '.' . $request->file('photo')->getClientOriginalExtension();
            $publicPath = public_path('photos');
            if (!file_exists($publicPath)) {
                mkdir($publicPath, 0777, true);
            }
            $request->file('photo')->move($publicPath, $fileName);
            $user->photo = 'photos/' . $fileName;
            $user->save();
        }
        
        if ($request->has('directions')) {
            $directions = json_decode($request->directions, true); // true для ассоциативного массива
            if (is_array($directions)) { // Добавим проверку, что это массив
                foreach ($directions as $directionId) {
                    // Дополнительно можно проверить, существует ли такое направление в БД
                    TeacherDirection::create([
                        'id_teacher' => $user->id,
                        'id_directions' => $directionId,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Регистрация успешна',
            'user' => $user
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation errors:', $e->errors());
        return response()->json([
            'success' => false,
            'message' => 'Ошибка валидации', // Общее сообщение
            'errors' => $e->errors()      // Детальные ошибки по полям
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Ошибка регистрации преподавателя: ' . $e->getMessage());
        \Log::error('Полные данные: ' . json_encode($request->all()));
        \Log::error('Trace: ' . $e->getTraceAsString());

        return response()->json([
            'message' => 'Произошла ошибка при регистрации',
            'error' => $e->getMessage(),
            // 'details' => $e->getTraceAsString() // В продакшене лучше не отправлять полный трейс клиенту
        ], 500);
    }
}
}