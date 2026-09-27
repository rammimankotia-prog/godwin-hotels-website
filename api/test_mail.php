<?php
/**
 * Godwin Hotels - SMTP & Mail Diagnostic Tool
 * 
 * Run in browser via: http://localhost/Godwin%20Hotels%20Website/api/test_mail.php
 * or from CLI via: php test_mail.php
 */

header('Content-Type: text/plain; charset=UTF-8');

echo "====================================================\n";
echo "Godwin Hotels - SMTP / Mail Diagnostics & Test\n";
echo "====================================================\n\n";

$config = require __DIR__ . '/mail_config.php';
require_once __DIR__ . '/SimpleSMTP.php';

echo "1. Current Configuration:\n";
echo "   - SMTP Host: " . $config['smtp']['host'] . "\n";
echo "   - SMTP Port: " . $config['smtp']['port'] . " (" . $config['smtp']['encryption'] . ")\n";
echo "   - SMTP User: " . $config['smtp']['username'] . "\n";
$maskedPass = ($config['smtp']['password'] === 'YOUR_EMAIL_PASSWORD_HERE') ? '[DEFAULT PLACEHOLDER - PLEASE SET REAL PASSWORD]' : (substr($config['smtp']['password'], 0, 2) . '******');
echo "   - SMTP Pass: " . $maskedPass . "\n";
echo "   - Destination Inbox: " . $config['to_email'] . "\n\n";

echo "2. Testing Socket Connectivity to " . $config['smtp']['host'] . ":" . $config['smtp']['port'] . "...\n";
$context = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
$target = ($config['smtp']['encryption'] === 'ssl' ? 'ssl://' : '') . $config['smtp']['host'] . ':' . $config['smtp']['port'];

$errno = 0;
$errstr = '';
$start = microtime(true);
$fp = @stream_socket_client($target, $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $context);
$elapsed = round((microtime(true) - $start) * 1000, 2);

if ($fp) {
    $banner = fgets($fp, 515);
    fclose($fp);
    echo "   [SUCCESS] Connected in {$elapsed}ms!\n";
    echo "   Server Banner: " . trim($banner) . "\n\n";
} else {
    echo "   [FAILED] Could not connect: $errstr ($errno) in {$elapsed}ms\n\n";
}

if ($config['smtp']['password'] === 'YOUR_EMAIL_PASSWORD_HERE') {
    echo "3. Action Required:\n";
    echo "   Please open api/mail_config.php and replace 'YOUR_EMAIL_PASSWORD_HERE'\n";
    echo "   with the actual password of book@godwinhotels.com.\n\n";
} else {
    echo "3. Sending Test Query Email to " . $config['to_email'] . "...\n";
    $smtp = new SimpleSMTP($config['smtp']);
    $success = $smtp->send(
        $config['to_email'],
        $config['to_name'],
        $config['from_email'],
        $config['from_name'],
        $config['from_email'],
        "Test Booking Query from Website System - " . date('Y-m-d H:i:s'),
        "<h1>Godwin Hotels Mail Delivery Test</h1><p>This is a test notification confirming that SMTP delivery to <strong>book@godwinhotels.com</strong> is configured and operating correctly.</p><p>Timestamp: " . date('r') . "</p>"
    );

    echo "\nDelivery Result: " . ($success ? "SUCCESS! Check your book@godwinhotels.com inbox." : "FAILED. See log below:") . "\n\n";
    echo "SMTP Protocol Transcript:\n";
    foreach ($smtp->getLogs() as $logLine) {
        echo "  $logLine\n";
    }
}

echo "\n====================================================\n";
echo "POP3 / IMAP Settings (for Outlook / Phone Client):\n";
echo "====================================================\n";
echo "Incoming Mail (POP3):\n";
echo "  - Server: mail.godwinhotels.com\n";
echo "  - Port: 995 (SSL)\n";
echo "  - Username: book@godwinhotels.com\n\n";
echo "Incoming Mail (IMAP):\n";
echo "  - Server: mail.godwinhotels.com\n";
echo "  - Port: 993 (SSL)\n";
echo "  - Username: book@godwinhotels.com\n\n";
echo "Outgoing Mail (SMTP):\n";
echo "  - Server: mail.godwinhotels.com\n";
echo "  - Port: 465 (SSL) or 587 (TLS)\n";
echo "  - Username: book@godwinhotels.com\n";
echo "  - Authentication: Required (same password)\n";
echo "====================================================\n";
