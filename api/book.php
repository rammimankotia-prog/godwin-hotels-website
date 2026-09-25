<?php
/**
 * Godwin Hotels & Resorts - Reservation API Handler
 * Compatible with XAMPP / Apache / PHP 7.4+
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON payload.']);
    exit;
}

$bookingRef  = htmlspecialchars($data['bookingRef'] ?? ('GDW-' . rand(100000, 999999)));
$guestName   = htmlspecialchars($data['name'] ?? 'Guest');
$guestEmail  = htmlspecialchars($data['email'] ?? '');
$guestPhone  = htmlspecialchars($data['phone'] ?? '');
$destination = htmlspecialchars($data['destination'] ?? 'Godwin Hotel');
$roomType    = htmlspecialchars($data['room'] ?? 'Deluxe Room');
$totalAmount = htmlspecialchars($data['total'] ?? '₹0');

// Create bookings log file for persistent audit in XAMPP
$logEntry = sprintf(
    "[%s] REF: %s | Name: %s | Email: %s | Phone: %s | Dest: %s | Room: %s | Total: %s\n",
    date('Y-m-d H:i:s'),
    $bookingRef,
    $guestName,
    $guestEmail,
    $guestPhone,
    $destination,
    $roomType,
    $totalAmount
);

$logDir = __DIR__ . '/../data';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}
@file_put_contents($logDir . '/reservations.log', $logEntry, FILE_APPEND);

echo json_encode([
    'status' => 'success',
    'bookingRef' => $bookingRef,
    'message' => 'Reservation received successfully. Our concierge will contact you shortly.'
]);
