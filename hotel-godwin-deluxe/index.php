<?php
// PHP Wrapper for Hotel Godwin Deluxe page (serves index.html with standard security headers)
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("Referrer-Policy: strict-origin-when-cross-origin");
require_once __DIR__ . '/index.html';
