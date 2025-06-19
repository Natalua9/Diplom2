<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IndexController;
// use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SubscriptionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
// Публичные маршруты аутентификации
Route::post('signin', [AuthController::class, 'signin']);
Route::post('signup', [AuthController::class, 'signup']);
Route::get('/', [IndexController::class, 'index'])->name('index');

// Защищенные маршруты
Route::middleware('auth:api')->group(function () {

    Route::post('/record', [IndexController::class, 'store'])->name('store');

    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('/teacher', [TeacherController::class, 'teacher'])->name('teacher');

    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('personal', [IndexController::class, 'user']);
    Route::post('update_user_data', [IndexController::class, 'update_user_data']);
    Route::post('/update-status-record', [TeacherController::class, 'updateStatus']);
    Route::post('/update-status-record-teacher', [TeacherController::class, 'updateStatusTeacher']);

    Route::delete('/delete-photo', [TeacherController::class, 'deletePhoto'])->name('delete.photo');
    Route::delete('/deleteTiming/{id}', [AdminController::class, 'deleteTiming']);
    Route::post('/signupTeacher', [AuthController::class, 'signupTeacher'])->name('signupTeacher');
    Route::post('/notification-read', [IndexController::class, 'markNotificationAsRead']);

    Route::post('/subscriptions/purchase', [SubscriptionController::class, 'purchase']);

});
Route::delete('/delete_direction/{id}', [AdminController::class, 'delete_direction'])->name('delete_direction');

Route::get('/direction', [IndexController::class, 'direction'])->name('direction');
Route::get('/teachers', [TeacherController::class, 'getTeachersByDirection']);

Route::get('/balet', [IndexController::class, 'balet'])->name('balet');
Route::get('/modern', [IndexController::class, 'modern'])->name('modern');
Route::get('/latina', [IndexController::class, 'poleDanse'])->name('latina');

Route::get('/childDanse', [IndexController::class, 'childDanse'])->name('childDanse');

Route::get('/search', [IndexController::class, 'index'])->name('search');

Route::get('/contact', [IndexController::class, 'contact'])->name('contact');
Route::get('/personal', [IndexController::class, 'user'])->name('user');
Route::post('/add-photo', [TeacherController::class, 'addPhoto'])->name('add.photo');

Route::post('/update_user_data', [IndexController::class, 'update_user_data'])->name('update_user_data');
Route::post('/update_teacher_data', [IndexController::class, 'update_teacher_data'])->name('update_teacher_data');


Route::post('/update-status', [TeacherController::class, 'updateStatus'])->name('updateStatusRecord');
Route::post('/send-email', [IndexController::class, 'send'])->name('contact.send');

// панель администратора
Route::get('/admin/teachers', [AdminController::class, 'adminIndex'])->name('adminIndex');

Route::get('/admin/adminContant', [AdminController::class, 'adminContant'])->name('adminContant');

Route::get('/admin/comment', [AdminController::class, 'comment'])->name('comment');
Route::get('/admin/adminTiming', [AdminController::class, 'adminTiming'])->name('adminTiming');

Route::post('/timings/store', [AdminController::class, 'addTiming'])->name('addTiming');
// Route::delete('/admin/timing/{id}', [AdminController::class, 'deleteTiming'])->name('deleteTiming');
Route::post('/admin/Addcomment', [AdminController::class, 'addComment'])->name('addComment');



Route::get('/admin/adminPerson', [AdminController::class, 'adminPerson'])->name('adminPerson');
Route::get('/admin/adminDirection', [AdminController::class, 'adminDirection'])->name('adminDirection');
Route::post('/addDirection', [AdminController::class, 'addDirection'])->name('addDirection');
Route::delete('/delete_teacher/{id}', [AdminController::class, 'delete_teacher'])->name('delete_teacher');
Route::put('/admin/comments/update/{id}', [AdminController::class, 'CommentUpdate'])->name('commentUpdate');
Route::post('/admin/updateDirection/', [AdminController::class, 'updateDirection'])->name('updateDirection');
Route::post('/admin/addDirectionTeacher/', [AdminController::class, 'addDirectionTeacher'])->name('addDirectionTeacher');
Route::delete('/deleteTiming/{id}', [AdminController::class, 'deleteTiming'])->name('deleteTiming');
Route::get('/admin/directions', [AdminController::class, 'getDirections']);

Route::get('/user/comments', [IndexController::class, 'userComments'])->middleware('auth:api');

    Route::get('/admin/instructor-stats', [AdminController::class, 'getInstructorStats']); // Обновленный роут
