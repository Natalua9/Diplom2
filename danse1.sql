-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Авг 08 2025 г., 20:32
-- Версия сервера: 5.7.39
-- Версия PHP: 8.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `danse1`
--

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE `comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_teacher` bigint(20) UNSIGNED NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_record` int(11) NOT NULL,
  `contant` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` enum('1','2','3','4','5') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('выложить','скрыть') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'скрыть',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `comments`
--

INSERT INTO `comments` (`id`, `id_teacher`, `id_user`, `id_record`, `contant`, `rating`, `status`, `created_at`, `updated_at`) VALUES
(1, 28, 29, 0, 'Профессионал своего дела. Занятие очень понравилось', '5', 'выложить', '2025-05-25 07:52:32', '2025-05-25 08:03:45'),
(2, 28, 25, 0, 'Очень классно ведет занятие', '4', 'выложить', NULL, NULL),
(3, 33, 36, 0, 'Супер преподаватель, интересно преподает данный стиль', '5', 'выложить', NULL, NULL),
(4, 32, 35, 0, 'Преподаватель помог мне по-настоящему раскрыть свой танцевальный потенциал! Это настоящий профессионал своего дела, который создает на занятиях невероятно поддерживающую и вдохновляющую атмосферу. Спасибо!', '5', 'выложить', NULL, NULL),
(5, 32, 35, 0, 'Занимаюсь балетом уже год. Результаты превзошли все ожидания. Рекомендую всем, кто хочет научиться танцевать!', '5', 'выложить', NULL, NULL),
(6, 30, 35, 0, 'Классный педагод. Рада что попала именно к нему.', '5', 'выложить', NULL, NULL),
(7, 30, 29, 0, 'самый крутой преподаватель которого я только встречала. Я в восторге', '5', 'скрыть', '2025-06-03 12:06:23', '2025-06-03 12:06:23'),
(8, 30, 29, 0, 'ывуав', '4', 'скрыть', '2025-06-03 12:22:32', '2025-06-03 12:22:32'),
(9, 28, 29, 0, 'фыцвуак', '5', 'скрыть', '2025-06-03 12:23:22', '2025-06-03 12:23:22'),
(10, 28, 25, 0, 'оывпрылоп', '5', 'скрыть', '2025-06-03 12:31:06', '2025-06-03 12:31:06'),
(11, 28, 25, 38, 'ыва', '5', 'скрыть', '2025-06-03 13:03:44', '2025-06-03 13:03:44'),
(12, 28, 25, 38, 'авмвч', '5', 'скрыть', '2025-06-03 13:11:34', '2025-06-03 13:11:34'),
(13, 28, 25, 37, 'мяяу', '4', 'скрыть', '2025-06-03 13:17:04', '2025-06-03 13:17:04'),
(14, 28, 25, 39, 'очень круто', '5', 'скрыть', '2025-06-03 13:20:34', '2025-06-03 13:20:34');

-- --------------------------------------------------------

--
-- Структура таблицы `directions`
--

CREATE TABLE `directions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `directions`
--

INSERT INTO `directions` (`id`, `name`, `description`, `photo`, `created_at`, `updated_at`) VALUES
(5, 'Детские танцы1', 'Танцы для детей от 3 до 5 лет', 'photos/1742795223.png', '2025-03-24 02:47:03', '2025-04-21 04:30:25'),
(6, 'Балет', 'Классический танцевальный стиль, который помогает развить грацию, гибкость и силу. Балетные классы обычно начинаются с простых упражнений и постепенно переходят к более сложным комбинациям.', 'photos/1742885334.png', '2025-03-25 03:48:54', '2025-03-25 03:48:54'),
(7, 'Латина', 'Латиноамериканские танцы, такие как сальса, бачата и ча-ча-ча, подходят для детей, которые любят веселье и энергичные движения. Эти танцы помогают развить чувство ритма и музыкальность, а также укрепить мышцы ног и бёдер', 'photos/1742885440.jpg', '2025-03-25 03:50:40', '2025-03-25 03:50:40'),
(8, 'Джаз', 'Яркий и выразительный стиль танца, который сочетает в себе элементы балета и современных танцев. Джазовые движения развивают гибкость и технику, а также помогают ребёнку научиться чувствовать музыку.', 'photos/1742885503.png', '2025-03-25 03:51:43', '2025-04-09 11:18:50'),
(9, 'High heels', 'Современное направление для развития женственности и пластичности', 'photos/1742999481.png', '2025-03-26 11:31:21', '2025-03-26 11:31:21'),
(10, 'Брейк-данс', 'Динамичный стиль уличного танца, включающий силовые элементы, трюки и вращения на полу. Требует хорошей физической подготовки и координации.', 'photos/1747114966.png', '2025-05-13 02:42:46', '2025-05-13 02:42:46'),
(11, 'Джаз-фанк (Jazz-Funk)', 'Сочетание джазового танца с хип-хопом. Характеризуется яркой подачей, резкими и чувственными движениями, часто используется в клипах и шоу.', 'photos/1747114995.png', '2025-05-13 02:43:15', '2025-05-13 02:43:15'),
(12, 'Vogue', 'Стиль, вдохновлённый подиумной модой и фотопозированием. Отличается резкими линиями, позами, плавными переходами и выразительной подачей. Часто используется в перформансах и шоу.', 'photos/1747115250.jpg', '2025-05-13 02:47:30', '2025-05-13 02:47:30'),
(13, 'Восточные танцы (беллиданс)', 'Танец живота с акцентом на изолированные движения тела, гибкость и пластику. Подходит для всех возрастов и помогает развивать женственность.', 'photos/1747115283.png', '2025-05-13 02:48:03', '2025-05-13 02:48:03'),
(14, 'Танго', 'Чувственный парный танец с богатой эмоциональной палитрой. Основан на тесном взаимодействии партнёров, импровизации и музыкальности.', 'photos/1747115945.png', '2025-05-13 02:59:05', '2025-05-13 02:59:05'),
(15, 'Сальса', 'Популярный латиноамериканский парный танец с живыми, энергичными движениями. Отличается лёгкостью, музыкальностью и весёлым настроением.', 'photos/1747115968.png', '2025-05-13 02:59:28', '2025-05-13 02:59:28'),
(16, 'Reggaeton', 'Танец на основе одноимённой музыки с акцентом на бёдра, изоляцию и ритм. Отличается экспрессией, пластичностью и драйвом.', 'photos/1747116024.png', '2025-05-13 03:00:24', '2025-05-13 03:00:24');

-- --------------------------------------------------------

--
-- Структура таблицы `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `job_status`
--

CREATE TABLE `job_status` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('работает','уволен') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `job_status`
--

INSERT INTO `job_status` (`id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'работает', '2025-05-18 05:52:27', '2025-05-18 05:52:27'),
(2, 'уволен', '2025-05-18 05:52:34', '2025-05-18 05:52:34');

-- --------------------------------------------------------

--
-- Структура таблицы `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_resets_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2025_02_25_154959_create_directions_table', 1),
(6, '2025_02_25_155128_create_comments_table', 1),
(7, '2025_02_25_155200_create_teacher_directions_table', 1),
(8, '2025_02_25_155236_create_timings_table', 1),
(9, '2025_02_25_155306_create_record_table', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('новое','прочитано') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'новое',
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `notifications`
--

INSERT INTO `notifications` (`id`, `id_user`, `content`, `status`, `created_at`, `updated_at`) VALUES
(35, 29, 'Абонемент ID:18 на \'Детские танцы1\' ЗАКОНЧИЛСЯ (причина: закончились занятия).', 'прочитано', '2025-06-02 00:52:52', '2025-06-03 11:43:06'),
(36, 29, 'Абонемент ID:17 на \'Джаз-фанк (Jazz-Funk)\' ЗАКОНЧИЛСЯ (причина: закончились занятия).', 'прочитано', '2025-06-02 00:50:45', '2025-06-03 11:43:05'),
(37, 29, 'Абонемент ID:16 на \'Балет\' СКОРО ЗАКОНЧИТСЯ по времени. Срок истекает через 2 дня (05.06.2025). У вас осталось 4 занятий.', 'прочитано', '2025-06-03 11:42:57', '2025-06-03 11:43:04'),
(38, 29, 'Абонемент ID:16 на \'Балет\' СКОРО ЗАКОНЧИТСЯ по времени. Срок истекает через 2 дня (05.06.2025). У вас осталось 4 занятий.', 'прочитано', '2025-06-03 11:43:08', '2025-06-03 11:43:10'),
(39, 29, 'Абонемент ID:16 на \'Балет\' СКОРО ЗАКОНЧИТСЯ по времени. Срок истекает через 2 дня (05.06.2025). У вас осталось 4 занятий.', 'прочитано', '2025-06-03 11:43:12', '2025-06-03 12:03:44'),
(40, 29, 'Абонемент ID:16 на \'Балет\' СКОРО ЗАКОНЧИТСЯ по времени. Срок истекает через 2 дня (05.06.2025). У вас осталось 4 занятий.', 'прочитано', '2025-06-03 12:03:55', '2025-06-05 07:07:53'),
(41, 25, 'Абонемент ID:22 на \'Детские танцы1\' СКОРО ЗАКОНЧИТСЯ по времени. Срок истекает СЕГОДНЯ (03.06.2025). У вас осталось 1 занятие.', 'прочитано', '2025-06-03 13:20:01', '2025-06-03 13:20:06'),
(42, 25, 'Абонемент ID:22 на \'Детские танцы1\' СКОРО ЗАКОНЧИТСЯ по времени. Срок истекает СЕГОДНЯ (03.06.2025). У вас осталось 1 занятие.', 'прочитано', '2025-06-03 13:20:20', '2025-06-03 13:20:22'),
(43, 29, 'Абонемент ID:16 на \'Балет\' СКОРО ЗАКОНЧИТСЯ по времени. Срок истекает СЕГОДНЯ (05.06.2025). У вас осталось 4 занятий.', 'прочитано', '2025-06-05 07:07:56', '2025-06-05 08:27:06'),
(44, 29, 'Абонемент ID:16 на \'Балет\' ЗАКОНЧИЛСЯ (причина: истек срок действия (05.06.2025)).', 'прочитано', '2025-06-14 14:45:27', '2025-06-14 14:45:31'),
(45, 29, 'Абонемент ID:21 на \'High heels\' ЗАКОНЧИЛСЯ (причина: истек срок действия (03.07.2025)).', 'новое', '2025-07-19 09:27:39', '2025-07-19 09:27:39'),
(46, 29, 'Абонемент ID:20 на \'Детские танцы1\' ЗАКОНЧИЛСЯ (причина: истек срок действия (03.07.2025)).', 'новое', '2025-07-19 09:27:39', '2025-07-19 09:27:39');

-- --------------------------------------------------------

--
-- Структура таблицы `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `record`
--

CREATE TABLE `record` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_user` bigint(20) UNSIGNED NOT NULL,
  `id_td` bigint(20) UNSIGNED NOT NULL,
  `id_subscription` int(11) DEFAULT NULL,
  `status` enum('новая','проведена','отменена') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'новая',
  `date_record` date NOT NULL,
  `time_record` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `record`
--

INSERT INTO `record` (`id`, `id_user`, `id_td`, `id_subscription`, `status`, `date_record`, `time_record`, `created_at`, `updated_at`) VALUES
(22, 29, 11, 18, 'отменена', '2025-06-05', '16:00:00', '2025-06-02 00:53:01', '2025-06-03 16:40:33'),
(23, 29, 11, 18, 'проведена', '2025-05-22', '16:00:00', '2025-06-02 01:01:24', '2025-06-03 12:03:02'),
(24, 29, 12, 18, 'новая', '2025-06-07', '17:00:00', '2025-06-02 12:41:52', '2025-06-02 12:41:52'),
(25, 29, 17, 18, 'проведена', '2025-06-02', '16:00:00', '2025-06-02 12:42:50', '2025-06-03 11:47:13'),
(26, 29, 20, 17, 'отменена', '2025-06-06', '17:00:00', '2025-06-02 12:49:21', '2025-06-02 12:49:21'),
(27, 29, 20, 17, 'новая', '2025-06-13', '17:00:00', '2025-06-02 12:49:25', '2025-06-02 12:49:25'),
(28, 29, 20, 17, 'новая', '2025-06-20', '17:00:00', '2025-06-02 12:49:44', '2025-06-02 12:49:44'),
(29, 29, 20, 17, 'проведена', '2025-06-27', '17:00:00', '2025-06-02 12:50:13', '2025-06-02 12:50:13'),
(30, 29, 21, 19, 'проведена', '2025-06-04', '17:00:00', '2025-06-02 12:54:57', '2025-06-02 12:54:57'),
(31, 29, 21, 19, 'проведена', '2025-05-28', '17:00:00', '2025-06-02 12:55:01', '2025-06-03 11:42:06'),
(32, 29, 21, 19, 'проведена', '2025-06-11', '17:00:00', '2025-06-02 12:55:17', '2025-06-02 12:55:17'),
(33, 29, 20, 17, 'проведена', '2025-08-01', '17:00:00', '2025-06-03 10:55:45', '2025-06-03 10:55:45'),
(34, 29, 20, 17, 'проведена', '2025-08-22', '17:00:00', '2025-06-03 11:00:28', '2025-06-03 11:00:28'),
(35, 29, 22, 20, 'проведена', '2025-06-03', '12:00:00', '2025-06-03 12:00:35', '2025-06-03 12:00:41'),
(36, 29, 21, 21, 'проведена', '2025-06-18', '17:00:00', '2025-06-03 12:07:24', '2025-06-03 12:07:24'),
(37, 25, 22, 22, 'проведена', '2025-06-03', '12:00:00', '2025-06-03 12:30:09', '2025-06-03 12:30:09'),
(38, 25, 11, 22, 'отменена', '2025-06-05', '16:00:00', '2025-06-03 12:31:12', '2025-06-03 16:40:33'),
(39, 25, 12, 22, 'проведена', '2025-06-07', '17:00:00', '2025-06-03 13:19:25', '2025-06-03 13:19:25'),
(40, 29, 12, 18, 'новая', '2025-06-14', '17:00:00', '2025-06-14 14:45:43', '2025-06-14 14:45:43');

-- --------------------------------------------------------

--
-- Структура таблицы `subscription`
--

CREATE TABLE `subscription` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_user` bigint(20) UNSIGNED NOT NULL,
  `id_direction` bigint(20) UNSIGNED NOT NULL,
  `count_lessons` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('активный','неактивный') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` date NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `subscription`
--

INSERT INTO `subscription` (`id`, `id_user`, `id_direction`, `count_lessons`, `status`, `expires_at`, `created_at`, `updated_at`) VALUES
(7, 29, 5, '4', 'неактивный', '2025-06-22', '2025-05-22 02:46:28', '2025-05-22 02:46:28'),
(16, 29, 6, '4', 'неактивный', '2025-06-05', '2025-06-02 00:42:08', '2025-06-14 14:45:27'),
(17, 29, 11, '0', 'неактивный', '2025-07-02', '2025-06-02 00:50:45', '2025-06-02 00:50:45'),
(18, 29, 5, '1', 'неактивный', '2025-07-02', '2025-06-02 00:52:52', '2025-07-19 09:27:39'),
(19, 29, 9, '1', 'неактивный', '2025-06-02', '2025-06-02 12:54:08', '2025-06-02 12:54:08'),
(20, 29, 5, '3', 'неактивный', '2025-07-03', '2025-06-03 12:00:29', '2025-07-19 09:27:39'),
(21, 29, 9, '3', 'неактивный', '2025-07-03', '2025-06-03 12:07:10', '2025-07-19 09:27:39'),
(22, 25, 5, '2', 'активный', '2025-06-03', '2025-06-03 12:30:02', '2025-06-03 16:40:33');

-- --------------------------------------------------------

--
-- Структура таблицы `teacher_directions`
--

CREATE TABLE `teacher_directions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_teacher` bigint(20) UNSIGNED NOT NULL,
  `id_directions` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `teacher_directions`
--

INSERT INTO `teacher_directions` (`id`, `id_teacher`, `id_directions`, `created_at`, `updated_at`) VALUES
(62, 25, 9, '2025-05-18 04:12:49', '2025-05-18 04:12:49'),
(63, 27, 7, '2025-05-18 04:23:16', '2025-05-18 04:23:16'),
(64, 28, 5, '2025-05-18 05:01:13', '2025-05-18 05:01:13'),
(65, 28, 8, '2025-05-18 05:01:13', '2025-05-18 05:01:13'),
(66, 30, 9, '2025-05-28 09:03:13', '2025-05-28 09:03:13'),
(67, 31, 5, '2025-05-28 09:04:09', '2025-05-28 09:04:09'),
(68, 32, 9, '2025-05-28 09:05:38', '2025-05-28 09:05:38'),
(69, 33, 10, '2025-05-28 09:07:00', '2025-05-28 09:07:00'),
(70, 37, 6, '2025-06-01 08:15:02', '2025-06-01 08:15:02'),
(71, 37, 11, '2025-06-01 08:15:02', '2025-06-01 08:15:02'),
(72, 38, 8, '2025-06-01 08:17:45', '2025-06-01 08:17:45'),
(73, 38, 10, '2025-06-01 08:17:45', '2025-06-01 08:17:45'),
(74, 39, 7, '2025-06-01 08:18:15', '2025-06-01 08:18:15'),
(75, 40, 13, '2025-06-01 08:21:11', '2025-06-01 08:21:11'),
(76, 40, 14, '2025-06-01 08:21:11', '2025-06-01 08:21:11'),
(77, 41, 10, '2025-06-01 08:26:21', '2025-06-01 08:26:21'),
(78, 42, 8, '2025-06-01 08:27:40', '2025-06-01 08:27:40'),
(79, 42, 7, '2025-06-01 08:27:40', '2025-06-01 08:27:40'),
(80, 42, 6, '2025-06-01 08:27:40', '2025-06-01 08:27:40'),
(81, 43, 7, '2025-06-01 08:33:17', '2025-06-01 08:33:17'),
(82, 43, 8, '2025-06-01 08:33:17', '2025-06-01 08:33:17'),
(83, 43, 6, '2025-06-01 08:33:17', '2025-06-01 08:33:17'),
(84, 44, 5, '2025-06-01 08:39:19', '2025-06-01 08:39:19'),
(85, 45, 11, '2025-06-01 08:40:20', '2025-06-01 08:40:20'),
(86, 45, 12, '2025-06-01 08:40:20', '2025-06-01 08:40:20'),
(87, 46, 5, '2025-06-01 08:42:05', '2025-06-01 08:42:05'),
(88, 46, 6, '2025-06-01 08:42:05', '2025-06-01 08:42:05'),
(91, 47, 5, '2025-06-15 07:39:15', '2025-06-15 07:39:15'),
(92, 47, 14, '2025-06-15 07:39:15', '2025-06-15 07:39:15');

-- --------------------------------------------------------

--
-- Структура таблицы `timings`
--

CREATE TABLE `timings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `date` tinyint(3) UNSIGNED NOT NULL,
  `time` time NOT NULL,
  `id_teacher` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `timings`
--

INSERT INTO `timings` (`id`, `date`, `time`, `id_teacher`, `created_at`, `updated_at`) VALUES
(11, 4, '16:00:00', 64, '2025-05-23 06:48:37', '2025-05-23 06:48:37'),
(12, 6, '17:00:00', 64, '2025-05-23 06:50:17', '2025-05-23 06:50:17'),
(14, 7, '17:00:00', 65, '2025-05-28 09:27:39', '2025-05-28 09:27:39'),
(15, 6, '15:00:00', 73, '2025-06-02 00:41:14', '2025-06-02 00:41:14'),
(17, 1, '16:00:00', 64, '2025-06-02 00:55:07', '2025-06-02 00:55:07'),
(18, 1, '17:00:00', 65, '2025-06-02 00:56:10', '2025-06-02 00:56:10'),
(19, 5, '17:00:00', 73, '2025-06-02 12:47:54', '2025-06-02 12:47:54'),
(20, 5, '17:00:00', 85, '2025-06-02 12:49:00', '2025-06-02 12:49:00'),
(21, 3, '17:00:00', 66, '2025-06-02 12:54:28', '2025-06-02 12:54:28'),
(22, 2, '12:00:00', 64, NULL, NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('женщина','мужчина') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age` date DEFAULT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(70) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user','teacher') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `id_job_status` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `full_name`, `phone`, `email`, `gender`, `age`, `photo`, `password`, `role`, `id_job_status`, `created_at`, `updated_at`) VALUES
(24, 'Иванов Владимир Петрович', '89870252334', 'volodya@gmail.com', 'мужчина', '1989-05-07', NULL, '$2y$10$S8FwzFZKxNwE3rujO4SjSuaET/CjilbmakyH7F68SUwCrQwAdPwNC', 'user', NULL, NULL, NULL),
(25, 'Игнатов Станислав Олегович', '89870637367', 'Ignatov.Stas05@mail.ru', 'мужчина', '1980-05-13', 'photos/68298863df4cc.png', '$2y$10$S8FwzFZKxNwE3rujO4SjSuaET/CjilbmakyH7F68SUwCrQwAdPwNC', 'user', 2, '2025-05-18 02:59:09', '2025-05-18 15:15:37'),
(26, 'миронова наталья евгеньевна', '89870252334', 'lakos2080@gmail.com', 'женщина', '2025-05-15', NULL, '$2y$10$S8FwzFZKxNwE3rujO4SjSuaET/CjilbmakyH7F68SUwCrQwAdPwNC', 'admin', NULL, '2025-05-18 02:59:09', '2025-05-18 02:59:09'),
(27, 'миронова наталья евгеньевна2', '89870252334', 'lakos22080@gmail.com', 'мужчина', '1993-02-03', 'photos/682977580a707.jpg', '$2y$10$EqfK/A/D7MdvJNX5G5/nAe28ekOZlVKw9BfGARFOmU/yNAl8fm1cG', 'teacher', 1, '2025-05-18 02:59:52', '2025-05-18 04:23:16'),
(28, 'Иванов Иван Иванович', '89870252334', 'lakos222080@gmail.com', 'мужчина', '1993-02-03', 'photos/682dfcb5b2a9b.png', '$2y$10$Dv4jQd.bc1RsmQZ291iNtOYVb4mmfG021gT4lFbqTomVaqM7rUkSO', 'teacher', 1, '2025-05-18 03:03:10', '2025-05-21 13:17:57'),
(29, 'миронова наталья евгеньевна', '89870252334', 'mir@mail.ru', 'женщина', '2005-05-17', NULL, '$2y$10$Dv4jQd.bc1RsmQZ291iNtOYVb4mmfG021gT4lFbqTomVaqM7rUkSO', 'user', NULL, '2025-05-21 12:14:21', '2025-05-28 09:29:12'),
(30, 'Князева Наталья Викторовна', '89879876239', 'natalya@gmail.com', 'женщина', '1999-12-21', 'photos/6836fb81ac08c.png', '$2y$10$DwRWMax6jQAYFX6GR5BfDeMACcGyl/rgEgNtuNqmFWI29HkunkHwa', 'teacher', 1, '2025-05-28 09:03:13', '2025-05-28 09:03:13'),
(31, 'Миронова Елизавета Евгеньевна', '89870879646', 'Mir_liz@mail.ru', 'женщина', '2004-01-24', 'photos/6836fbb9c0f95.png', '$2y$10$2EF6acF7Q0Yz.FCy0qT4qurXprlVJlRGwklsYfSSe7Q6z2Eackony', 'teacher', 1, '2025-05-28 09:04:09', '2025-05-28 09:04:09'),
(32, 'Игнатова Мария Викторовна', '89870637367', 'Ignatova05@mail.ru', 'женщина', '2000-02-13', 'photos/6836fc12eccb5.png', '$2y$10$E8aeRIVv8RubVB7VMkW4m.Wd8P/A4eeyGokChFBTXIQyFfu2CxZnW', 'teacher', 1, '2025-05-28 09:05:38', '2025-05-28 09:05:38'),
(33, 'Смирнов Андрей Викторович', '89898765678', 'Smirnov@mail.ru', 'мужчина', '1997-06-12', 'photos/6836fc645ed04.png', '$2y$10$TDFsdHTlzWBpzh5de9BnfOnh8twEsOdYiN5PYY90iEn9Iv4jtcLGW', 'teacher', 2, '2025-05-28 09:07:00', '2025-05-28 09:18:38'),
(34, 'Кузьмина Валентина Петровна', '89876576489', 'valentina1980@mail.ru', 'женщина', '1998-03-12', NULL, '$2y$10$cqSUWfS.Aew2RD9ncJvk6.DAzDDqoSlBw26kD6zDZc3F3bMratqGa', 'user', NULL, '2025-05-28 09:08:33', '2025-05-28 09:08:33'),
(35, 'Якушева Мария Ивановна', '87678597654', 'Maria@mail.ru', 'женщина', '1989-12-12', NULL, '$2y$10$PX5Yp9xH2fgNNbEH8IdteuOuKFTtds5KhLNF4xVQ2JtWNHy8y2yLW', 'user', NULL, '2025-05-28 09:09:25', '2025-05-28 09:09:25'),
(36, 'Кошкина Нина Игоревна', '89768987567', 'Nina@gmail.ru', 'женщина', '1997-12-12', NULL, '$2y$10$KwUourshooxgmmXYnqo55e9PsidVHUC7nybNMMB5tD3ez/xutssi.', 'user', NULL, '2025-05-28 09:10:22', '2025-05-28 09:10:22'),
(37, 'Ивинова Наталья Петровна', '89870252334', 'irina1@mail.ru', 'женщина', '1988-09-07', 'photos/683c363666b81.png', '$2y$10$h.Bjm5nbs6fttRtgrDULDuOGt5bZD6McwOGdpsWJNpxDgkGU7STNq', 'teacher', 1, '2025-06-01 08:15:02', '2025-06-01 08:15:02'),
(38, 'Васькова Екатерина Петровна', '79870252334', 'ekaterina13@gmail.com', 'женщина', '1999-12-12', 'photos/683c36d905409.png', '$2y$10$oOdG2/5aeNjp.kcIlYOUZ.J2Nq/9GL..86/BHrvZC5kyXWM9sdZL2', 'teacher', 1, '2025-06-01 08:17:45', '2025-06-01 08:17:45'),
(39, 'Васькова Екатерина Петровна', '79870252334', 'lakos20822220@gmail.com', 'женщина', '1999-12-12', 'photos/683c36f7f0b31.png', '$2y$10$nIrqqH9yBRIMrAijW6B7b.V/k.HS5NHiOuuyuEfQURCYsLkpXxzlW', 'teacher', 1, '2025-06-01 08:18:15', '2025-06-01 08:18:15'),
(40, 'Васькова Екатерина Петровна', '79870252334', 'lakos298989080@gmail.com', 'женщина', '1999-12-12', 'photos/683c37a7bcbc5.png', '$2y$10$HezMLKZZMbH3kKbATq7zT.9ab5iCFuGr6KDlQ6nvvrg1U4TSLDzse', 'teacher', 1, '2025-06-01 08:21:11', '2025-06-01 08:21:11'),
(41, 'Петров Кирил Иванович', '79870252334', 'kiril1@mail.ru', 'мужчина', '1998-06-12', 'photos/683c38dd7b08a.png', '$2y$10$jAFVoePPC6gBeICf0nA/D.tkLFnUASX3IXXJ8Bb8Njt4VxzYfNz0e', 'teacher', 1, '2025-06-01 08:26:21', '2025-06-01 08:26:21'),
(42, 'Гладышев Валерий Иванович', '89870252341', 'Valeruy@mail.ru', 'мужчина', '1990-08-12', 'photos/683c392c61fab.png', '$2y$10$bZhkPOVZqR6mTHDwe7fsPOivXuPVKvotT/ii8aPIL.QGWJJIusrZS', 'teacher', 1, '2025-06-01 08:27:40', '2025-06-01 08:27:40'),
(43, 'Сидоров Сергей Дмитриевич', '79123456789', 'sidorov_sd1@mail.ru', 'мужчина', '1987-09-08', 'photos/683c3a7deb48a.png', '$2y$10$QKjx1Yy8Sw5hlsL1OKLB7ecc1S2r.Aas6N/3P2M7G4wF8UEg0VAg.', 'teacher', 1, '2025-06-01 08:33:17', '2025-06-01 08:33:17'),
(44, 'Попов Дмитрий Алексеевич', '79870252334', 'popov_d@gmail.com', 'мужчина', '1989-12-12', NULL, '$2y$10$CWQ74pwdarRw8cFPbOjHYeAA0nLddmnbGlSKinSJCVcyR7znMR4vK', 'teacher', 1, '2025-06-01 08:39:19', '2025-06-01 08:39:19'),
(45, 'Новиков Максим Евгеньевич', '79189012345', 'novikov_me@example.com', 'мужчина', '1987-03-12', NULL, '$2y$10$tTUb8O.VRYxF.IaagxL1G.ZsNVbQKnewjY5obukqzPP.eKCYQE2Iy', 'teacher', 1, '2025-06-01 08:40:20', '2025-06-01 08:40:20'),
(46, 'Михайлова Ольга Артёмовна', '79178901234', 'mikhailova_oa@gmail.com', 'женщина', '2000-06-19', 'photos/683c3c8d1c533.png', '$2y$10$06CtCSztUjuE6tr6H1psN.e.HIhkRL7twFdxbgrLu7w0Gu5wLulnC', 'teacher', 1, '2025-06-01 08:42:05', '2025-06-01 08:42:05'),
(47, 'Соколов Андрей Владимирович', '79870252334', 'sokolov_av@gmail.com', 'мужчина', '2005-08-20', 'photos/684ea2d33b923.png', '$2y$10$.0t4mTuPwdkiz7ohXxyisu4l/rE5Ly/wj5/D2TCVIeGvhv17VikJa', 'teacher', 1, '2025-06-01 08:43:10', '2025-06-15 07:39:15');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comments_id_user_foreign` (`id_teacher`);

--
-- Индексы таблицы `directions`
--
ALTER TABLE `directions`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Индексы таблицы `job_status`
--
ALTER TABLE `job_status`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_user` (`id_user`);

--
-- Индексы таблицы `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Индексы таблицы `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Индексы таблицы `record`
--
ALTER TABLE `record`
  ADD PRIMARY KEY (`id`),
  ADD KEY `record_id_user_foreign` (`id_user`),
  ADD KEY `record_id_td_foreign` (`id_td`);

--
-- Индексы таблицы `subscription`
--
ALTER TABLE `subscription`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_direction` (`id_direction`),
  ADD KEY `id_user` (`id_user`);

--
-- Индексы таблицы `teacher_directions`
--
ALTER TABLE `teacher_directions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_directions_id_teacher_foreign` (`id_teacher`),
  ADD KEY `teacher_directions_id_directions_foreign` (`id_directions`);

--
-- Индексы таблицы `timings`
--
ALTER TABLE `timings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timings_id_teacher_foreign` (`id_teacher`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_job_status` (`id_job_status`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT для таблицы `directions`
--
ALTER TABLE `directions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT для таблицы `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `job_status`
--
ALTER TABLE `job_status`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT для таблицы `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `record`
--
ALTER TABLE `record`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT для таблицы `subscription`
--
ALTER TABLE `subscription`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT для таблицы `teacher_directions`
--
ALTER TABLE `teacher_directions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT для таблицы `timings`
--
ALTER TABLE `timings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`id_teacher`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `record`
--
ALTER TABLE `record`
  ADD CONSTRAINT `record_ibfk_1` FOREIGN KEY (`id_td`) REFERENCES `timings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `record_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `subscription`
--
ALTER TABLE `subscription`
  ADD CONSTRAINT `subscription_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `subscription_ibfk_2` FOREIGN KEY (`id_direction`) REFERENCES `directions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `teacher_directions`
--
ALTER TABLE `teacher_directions`
  ADD CONSTRAINT `teacher_directions_ibfk_1` FOREIGN KEY (`id_teacher`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `teacher_directions_id_directions_foreign` FOREIGN KEY (`id_directions`) REFERENCES `directions` (`id`);

--
-- Ограничения внешнего ключа таблицы `timings`
--
ALTER TABLE `timings`
  ADD CONSTRAINT `timings_ibfk_2` FOREIGN KEY (`id_teacher`) REFERENCES `teacher_directions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ограничения внешнего ключа таблицы `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_job_status`) REFERENCES `job_status` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
