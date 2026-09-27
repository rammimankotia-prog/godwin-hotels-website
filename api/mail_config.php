<?php
/**
 * Godwin Hotels & Resorts - Mail, SMTP & POP3 Configuration
 * 
 * Target Email: book@godwinhotels.com
 * Domain Mail Server: mail.godwinhotels.com
 */

return [
    // ══════════════════════════════════════════════════════
    // OUTGOING EMAIL (SMTP) SETTINGS
    // Used by the website to dispatch queries to book@godwinhotels.com
    // ══════════════════════════════════════════════════════
    'smtp' => [
        'enabled'    => true,                       // Set true to use SMTP; falls back to mail() if false or on failure
        'host'       => 'mail.godwinhotels.com',    // Outgoing SMTP mail server
        'port'       => 465,                        // 465 (SSL) or 587 (TLS/STARTTLS)
        'encryption' => 'ssl',                      // 'ssl' (port 465) or 'tls' (port 587)
        'auth'       => true,                       // Authentication required
        'username'   => 'book@godwinhotels.com',    // Full email address
        'password'   => getenv('GODWIN_SMTP_PASS') ?: 'YOUR_EMAIL_PASSWORD_HERE', // Set your account password here or via environment variable
        'timeout'    => 12,                         // Connection timeout in seconds
    ],

    // ══════════════════════════════════════════════════════
    // INCOMING EMAIL (POP3 / IMAP) CLIENT CONFIGURATION REFERENCE
    // Use these settings when configuring Outlook, Thunderbird,
    // Apple Mail, or Gmail to read queries at book@godwinhotels.com:
    // ══════════════════════════════════════════════════════
    'incoming_reference' => [
        'pop3' => [
            'description' => 'POP3 (Downloads emails to your device inbox)',
            'server'      => 'mail.godwinhotels.com',
            'port'        => 995,
            'encryption'  => 'SSL / TLS',
            'username'    => 'book@godwinhotels.com',
        ],
        'imap' => [
            'description' => 'IMAP (Syncs inbox across multiple phones/PCs)',
            'server'      => 'mail.godwinhotels.com',
            'port'        => 993,
            'encryption'  => 'SSL / TLS',
            'username'    => 'book@godwinhotels.com',
        ],
        'webmail' => 'https://mail.godwinhotels.com:2096 or https://godwinhotels.com/webmail',
    ],

    // ══════════════════════════════════════════════════════
    // SENDER & NOTIFICATION RECIPIENT
    // ══════════════════════════════════════════════════════
    'from_email'     => 'book@godwinhotels.com',
    'from_name'      => 'Godwin Hotels Website Inquiries',
    'to_email'       => 'book@godwinhotels.com',
    'to_name'        => 'Godwin Hotels Reception Desk',

    // Send instant auto-acknowledgement email copy to the guest's email address
    'send_guest_ack' => true,
];
