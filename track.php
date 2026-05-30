<?php
/**
 * track.php — бэкенд для сбора данных
 * 
 * Как использовать:
 * 1. Залейте этот файл на бесплатный PHP-хостинг (infinityfree.net, 000webhost и т.д.)
 * 2. Файл будет создавать track.log с данными о посетителях
 * 3. В script.js замените WEBHOOK_URL на URL этого файла
 *    Пример: https://your-site.epizy.com/track.php
 * 
 * Данные приходят в формате JSON через POST
 * IP определяется автоматически из заголовков
 */

// Разрешаем CORS (чтобы скрипт с GitHub Pages мог отправлять сюда)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Получаем данные
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Если данных нет — выходим
if (!$data) {
    http_response_code(400);
    exit;
}

// Добавляем IP из заголовков (учитываем прокси)
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$data['_server_ip'] = $ip;

// Добавляем заголовки запроса (могут быть полезны)
$data['_headers'] = [
    'accept' => $_SERVER['HTTP_ACCEPT'] ?? '',
    'accept_language' => $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '',
    'accept_encoding' => $_SERVER['HTTP_ACCEPT_ENCODING'] ?? '',
    'x_forwarded_for' => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
    'cf_connecting_ip' => $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
];

// Таймстамп
$data['_timestamp'] = date('Y-m-d H:i:s');
$data['_server_time'] = time();

// Форматируем для лога
$logLine = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n---\n";

// Сохраняем в файл
$logFile = __DIR__ . '/track.log';
file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);

// Также можно отправить в Telegram (опционально)
// Раскомментируйте и настройте ниже:
/*
$telegramToken = 'ВАШ_ТОКЕН_БОТА';
$chatId = 'ВАШ_CHAT_ID';
$message = "🔔 Новый визит на why?\n\n";
foreach ($data as $key => $value) {
    if (is_array($value)) continue;
    $message .= "$key: $value\n";
}
file_get_contents("https://api.telegram.org/bot{$telegramToken}/sendMessage?" . http_build_query([
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'HTML'
]));
*/

// Отвечаем успехом (пустой ответ, чтобы не палиться)
http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['status' => 'ok']);
