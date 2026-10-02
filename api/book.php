<?php
/**
 * Godwin Hotels & Resorts - Reservation & Booking Query API Handler
 * 
 * Receives website booking queries, logs them, and dispatches direct
 * notifications to book@godwinhotels.com via SMTP.
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

if (!isset($data) || empty($data)) {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    if (!$data && !empty($_POST)) {
        $data = $_POST;
    }
}

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON or POST payload.']);
    exit;
}

// Sanitize inputs
$bookingRef  = htmlspecialchars($data['bookingRef'] ?? ('GDW-' . rand(100000, 999999)));
$guestName   = htmlspecialchars($data['name'] ?? 'Guest');
$guestEmail  = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
$guestPhone  = htmlspecialchars($data['phone'] ?? '');
$destination = htmlspecialchars($data['destination'] ?? 'Godwin Hotels New Delhi');
$roomType    = htmlspecialchars($data['room'] ?? 'Deluxe Room');
$checkin     = htmlspecialchars($data['checkin'] ?? 'Not specified');
$checkout    = htmlspecialchars($data['checkout'] ?? 'Not specified');
$guests      = htmlspecialchars($data['guests'] ?? '2 Guests');
$address     = htmlspecialchars($data['address'] ?? 'Not provided');
$totalAmount = htmlspecialchars($data['total'] ?? '₹0');
$receivedAt  = date('d M Y, h:i A (T)');
$clientIp    = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

// 1. Persist audit log
$logEntry = sprintf(
    "[%s] REF: %s | Name: %s | Email: %s | Phone: %s | Dest: %s | Room: %s | Dates: %s to %s | Guests: %s | Address: %s | Total: %s | IP: %s\n",
    date('Y-m-d H:i:s'),
    $bookingRef,
    $guestName,
    $guestEmail,
    $guestPhone,
    $destination,
    $roomType,
    $checkin,
    $checkout,
    $guests,
    $address,
    $totalAmount,
    $clientIp
);

$logDir = __DIR__ . '/../data';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}
@file_put_contents($logDir . '/reservations.log', $logEntry, FILE_APPEND);

// 2. Load mail configuration
$config = require __DIR__ . '/mail_config.php';
require_once __DIR__ . '/SimpleSMTP.php';

// Prepare WhatsApp clean phone number for link
$cleanPhone = preg_replace('/[^0-9]/', '', $guestPhone);
if (strlen($cleanPhone) === 10) {
    $cleanPhone = '91' . $cleanPhone;
}

// 3. Construct staff notification email HTML
$staffSubject = "New Booking Query [{$bookingRef}] - {$guestName} ({$destination})";

$staffHtml = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Booking Query - {$bookingRef}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: #f8fafc; padding: 26px 30px; border-bottom: 4px solid #c8922e; }
    .header h1 { margin: 0 0 4px 0; font-size: 20px; letter-spacing: 0.05em; text-transform: uppercase; color: #f8fafc; font-weight: 700; }
    .header p { margin: 0; font-size: 13px; color: #c8922e; letter-spacing: 0.08em; text-transform: uppercase; }
    .badge-bar { background: #fbfaf8; border-bottom: 1px solid #f1ece4; padding: 14px 30px; display: flex; justify-content: space-between; align-items: center; }
    .ref-badge { display: inline-block; background: #fff9ed; color: #b45309; border: 1px solid #fcd34d; font-weight: 700; font-size: 14px; padding: 4px 12px; border-radius: 6px; letter-spacing: 0.05em; }
    .content { padding: 26px 30px; }
    .section-title { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin: 20px 0 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .section-title:first-child { margin-top: 0; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 14px; }
    .data-table td { padding: 8px 0; vertical-align: top; }
    .data-table td.label { width: 140px; color: #64748b; font-weight: 500; }
    .data-table td.value { color: #0f172a; font-weight: 600; }
    .actions { margin: 24px 0 10px; padding: 18px; background: #f8fafc; border-radius: 8px; text-align: center; }
    .btn { display: inline-block; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; margin: 4px; }
    .btn-wa { background: #25d366; color: #ffffff !important; }
    .btn-call { background: #c8922e; color: #ffffff !important; }
    .btn-reply { background: #0f172a; color: #ffffff !important; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Godwin Hotels &amp; Resorts</h1>
      <p>New Website Booking Query</p>
    </div>
    <div class="badge-bar">
      <span>Query Reference: <strong class="ref-badge">{$bookingRef}</strong></span>
      <span style="font-size:12px;color:#64748b;">{$receivedAt}</span>
    </div>
    <div class="content">
      <div class="section-title">Guest Contact Details</div>
      <table class="data-table">
        <tr>
          <td class="label">Primary Guest:</td>
          <td class="value">{$guestName}</td>
        </tr>
        <tr>
          <td class="label">Mobile / Phone:</td>
          <td class="value"><a href="tel:{$guestPhone}" style="color:#0284c7;text-decoration:none;">{$guestPhone}</a></td>
        </tr>
        <tr>
          <td class="label">Email Address:</td>
          <td class="value"><a href="mailto:{$guestEmail}" style="color:#0284c7;text-decoration:none;">{$guestEmail}</a></td>
        </tr>
        <tr>
          <td class="label">Origin / City:</td>
          <td class="value">{$address}</td>
        </tr>
      </table>

      <div class="section-title">Stay &amp; Room Details</div>
      <table class="data-table">
        <tr>
          <td class="label">Hotel Property:</td>
          <td class="value" style="color:#c8922e;">{$destination}</td>
        </tr>
        <tr>
          <td class="label">Room Category:</td>
          <td class="value">{$roomType}</td>
        </tr>
        <tr>
          <td class="label">Check-In Date:</td>
          <td class="value">{$checkin}</td>
        </tr>
        <tr>
          <td class="label">Check-Out Date:</td>
          <td class="value">{$checkout}</td>
        </tr>
        <tr>
          <td class="label">Guests:</td>
          <td class="value">{$guests}</td>
        </tr>
        <tr>
          <td class="label">Estimated Total:</td>
          <td class="value" style="font-size:16px;color:#15803d;">{$totalAmount}</td>
        </tr>
      </table>

      <div class="actions">
        <div style="font-size:12px;color:#64748b;margin-bottom:10px;font-weight:600;">QUICK ACTIONS FOR RECEPTION DESK:</div>
        <a href="https://wa.me/{$cleanPhone}?text=Hello%20{$guestName},%20greetings%20from%20Godwin%20Hotels%20New%20Delhi.%20We%20received%20your%20booking%20query%20({$bookingRef})." class="btn btn-wa" target="_blank">Chat on WhatsApp</a>
        <a href="tel:{$guestPhone}" class="btn btn-call">Call Guest</a>
        <a href="mailto:{$guestEmail}?subject=Re:%20Godwin%20Hotels%20Booking%20Query%20[{$bookingRef}]" class="btn btn-reply">Reply by Email</a>
      </div>
    </div>
    <div class="footer">
      Godwin Hotels Website Notification System &bull; Delivered to {$config['to_email']}<br>
      IP Address: {$clientIp} &bull; Timestamp: {$receivedAt}
    </div>
  </div>
</body>
</html>
HTML;

// 4. Send Email via SimpleSMTP or PHP mail()
$mailSent = false;
$mailLogs = [];

if (!empty($config['smtp']['enabled'])) {
    $smtp = new SimpleSMTP($config['smtp']);
    $mailSent = $smtp->send(
        $config['to_email'],
        $config['to_name'],
        $config['from_email'],
        $config['from_name'],
        !empty($guestEmail) ? $guestEmail : $config['from_email'],
        $staffSubject,
        $staffHtml
    );
    $mailLogs = $smtp->getLogs();
}

// Fallback to PHP mail() if SMTP was disabled or failed
if (!$mailSent) {
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: {$config['from_name']} <{$config['from_email']}>\r\n";
    if (!empty($guestEmail)) {
        $headers .= "Reply-To: <{$guestEmail}>\r\n";
    }
    $mailSent = @mail($config['to_email'], $staffSubject, $staffHtml, $headers);
    $mailLogs[] = "PHP native mail() fallback returned: " . ($mailSent ? 'SUCCESS' : 'FAILED');
}

// 5. Send auto-acknowledgement copy to the guest if requested and email provided
if (!empty($config['send_guest_ack']) && !empty($guestEmail) && filter_var($guestEmail, FILTER_VALIDATE_EMAIL)) {
    $guestSubject = "Query Received [{$bookingRef}] - Hotel Grand Godwin & Hotel Godwin Deluxe";
    $guestHtml = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Query Received - {$bookingRef}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: #f8fafc; padding: 26px 30px; border-bottom: 4px solid #c8922e; }
    .header h1 { margin: 0 0 4px 0; font-size: 20px; letter-spacing: 0.05em; text-transform: uppercase; color: #f8fafc; }
    .header p { margin: 0; font-size: 13px; color: #c8922e; letter-spacing: 0.08em; text-transform: uppercase; }
    .content { padding: 26px 30px; }
    .ref-box { background: #fff9ed; border: 1px dashed #fcd34d; padding: 12px 18px; border-radius: 8px; text-align: center; margin: 18px 0; font-size: 18px; font-weight: 700; color: #b45309; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Godwin Hotels &amp; Resorts</h1>
      <p>Boutique Hospitality &bull; New Delhi</p>
    </div>
    <div class="content">
      <h2 style="font-size:18px;color:#0f172a;margin-top:0;">Dear {$guestName},</h2>
      <p style="font-size:14px;line-height:1.6;color:#475569;">
        Thank you for contacting Godwin Hotels New Delhi. We have received your booking query.
      </p>
      <div class="ref-box">
        Your Query Reference: {$bookingRef}
      </div>
      <p style="font-size:14px;line-height:1.6;color:#475569;">
        Our 24-hour reception desk is reviewing your requirements for <strong>{$destination}</strong> ({$roomType}). A member of our team will contact you shortly via phone or WhatsApp at <strong>{$guestPhone}</strong> to assist with availability, customized options, and our guaranteed best direct rates.
      </p>
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:20px 0;font-size:13px;line-height:1.6;">
        <strong>Need immediate assistance?</strong><br>
        &bull; 24/7 Reception Desk: <a href="tel:+918860081999" style="color:#c8922e;text-decoration:none;">+91 88600 81999</a> (Grand Godwin) / <a href="tel:+918860081992" style="color:#c8922e;text-decoration:none;">+91 88600 81992</a> (Godwin Deluxe)<br>
        &bull; WhatsApp Concierge: <a href="https://wa.me/918860081994" style="color:#25d366;text-decoration:none;">+91 88600 81994</a><br>
        &bull; Address: 8501-8502, Arakashan Road, Ram Nagar, Paharganj, New Delhi 110055 (500m from New Delhi Railway Station)
      </div>
    </div>
    <div class="footer">
      Godwin Hotels &bull; Hotel Grand Godwin &bull; Hotel Godwin Deluxe<br>
      <a href="https://godwinhotels.com" style="color:#c8922e;text-decoration:none;">www.godwinhotels.com</a>
    </div>
  </div>
</body>
</html>
HTML;

    if (!empty($config['smtp']['enabled'])) {
        $smtpGuest = new SimpleSMTP($config['smtp']);
        $smtpGuest->send(
            $guestEmail,
            $guestName,
            $config['from_email'],
            $config['from_name'],
            $config['to_email'],
            $guestSubject,
            $guestHtml
        );
    }
}

// Log mail result
$mailAudit = sprintf(
    "[%s] REF: %s | Delivered: %s | Logs: %s\n",
    date('Y-m-d H:i:s'),
    $bookingRef,
    $mailSent ? 'YES' : 'NO',
    implode(' ; ', $mailLogs)
);
@file_put_contents($logDir . '/mail.log', $mailAudit, FILE_APPEND);

// Response to frontend
echo json_encode([
    'status'     => 'success',
    'bookingRef' => $bookingRef,
    'mailSent'   => $mailSent,
    'message'    => 'Booking query received successfully. Our concierge will contact you shortly.'
]);
