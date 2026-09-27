<?php
/**
 * Godwin Hotels & Resorts - Standalone Lightweight SMTP Client
 * 
 * Provides native direct socket SMTP delivery over SSL/TLS without external dependencies.
 */

class SimpleSMTP
{
    private $host;
    private $port;
    private $encryption;
    private $auth;
    private $username;
    private $password;
    private $timeout;
    private $socket = null;
    private $lastLog = [];

    public function __construct(array $config)
    {
        $this->host       = $config['host'] ?? 'localhost';
        $this->port       = (int)($config['port'] ?? 25);
        $this->encryption = strtolower($config['encryption'] ?? 'none');
        $this->auth       = (bool)($config['auth'] ?? true);
        $this->username   = $config['username'] ?? '';
        $this->password   = $config['password'] ?? '';
        $this->timeout    = (int)($config['timeout'] ?? 10);
    }

    public function getLogs(): array
    {
        return $this->lastLog;
    }

    private function log($msg): void
    {
        $this->lastLog[] = date('[Y-m-d H:i:s] ') . $msg;
    }

    private function readResponse(): string
    {
        $response = '';
        while ($line = fgets($this->socket, 515)) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        $this->log("SERVER: " . trim($response));
        return $response;
    }

    private function sendCommand(string $command, string $expectedCode): bool
    {
        $this->log("CLIENT: " . (stripos($command, 'AUTH') !== false || strlen($command) > 50 ? substr($command, 0, 15) . '...' : $command));
        fwrite($this->socket, $command . "\r\n");
        $res = $this->readResponse();
        $code = substr($res, 0, 3);
        if ($code !== $expectedCode) {
            $this->log("ERROR: Expected $expectedCode but received: $res");
            return false;
        }
        return true;
    }

    public function send(string $to, string $toName, string $from, string $fromName, string $replyTo, string $subject, string $htmlBody, string $textBody = ''): bool
    {
        $this->lastLog = [];
        $context = stream_context_create([
            'ssl' => [
                'verify_peer'       => false,
                'verify_peer_name'  => false,
                'allow_self_signed' => true,
            ]
        ]);

        $prefix = ($this->encryption === 'ssl') ? 'ssl://' : '';
        $target = $prefix . $this->host . ':' . $this->port;
        $this->log("Connecting to $target (timeout {$this->timeout}s)...");

        $errno = 0;
        $errstr = '';
        $this->socket = @stream_socket_client(
            $target,
            $errno,
            $errstr,
            $this->timeout,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if (!$this->socket) {
            $this->log("Connection failed: $errstr ($errno)");
            return false;
        }

        stream_set_timeout($this->socket, $this->timeout);

        // Server greeting
        $greet = $this->readResponse();
        if (substr($greet, 0, 3) !== '220') {
            $this->close();
            return false;
        }

        // EHLO
        $heloHost = !empty($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'godwinhotels.com';
        if (!$this->sendCommand("EHLO " . $heloHost, '250')) {
            if (!$this->sendCommand("HELO " . $heloHost, '250')) {
                $this->close();
                return false;
            }
        }

        // STARTTLS if requested
        if ($this->encryption === 'tls') {
            if (!$this->sendCommand("STARTTLS", '220')) {
                $this->close();
                return false;
            }
            if (!stream_socket_enable_crypto($this->socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                $this->log("TLS encryption handshake failed.");
                $this->close();
                return false;
            }
            // Repeat EHLO after TLS
            $this->sendCommand("EHLO " . $heloHost, '250');
        }

        // Authenticate
        if ($this->auth && !empty($this->username) && !empty($this->password)) {
            if (!$this->sendCommand("AUTH LOGIN", '334')) {
                $this->close();
                return false;
            }
            if (!$this->sendCommand(base64_encode($this->username), '334')) {
                $this->close();
                return false;
            }
            if (!$this->sendCommand(base64_encode($this->password), '235')) {
                $this->close();
                return false;
            }
        }

        // MAIL FROM
        if (!$this->sendCommand("MAIL FROM: <$from>", '250')) {
            $this->close();
            return false;
        }

        // RCPT TO
        if (!$this->sendCommand("RCPT TO: <$to>", '250')) {
            $this->close();
            return false;
        }

        // DATA
        if (!$this->sendCommand("DATA", '354')) {
            $this->close();
            return false;
        }

        // Build MIME payload
        $boundary = '=_Godwin_' . md5(uniqid((string)time(), true));
        $date = date('r');
        $msgId = '<' . md5(uniqid((string)microtime(), true)) . '@godwinhotels.com>';

        $headers = [];
        $headers[] = "Date: $date";
        $headers[] = "Message-ID: $msgId";
        $headers[] = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$from>";
        $headers[] = "To: =?UTF-8?B?" . base64_encode($toName) . "?= <$to>";
        if (!empty($replyTo)) {
            $headers[] = "Reply-To: <$replyTo>";
        }
        $headers[] = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=";
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: multipart/alternative; boundary=\"$boundary\"";
        $headers[] = "X-Mailer: Godwin Hotels Mail Dispatcher";

        $mimeBody  = implode("\r\n", $headers) . "\r\n\r\n";
        
        // Plain text section
        $plain = !empty($textBody) ? $textBody : strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>'], "\n", $htmlBody));
        $mimeBody .= "--$boundary\r\n";
        $mimeBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $mimeBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $mimeBody .= chunk_split(base64_encode($plain)) . "\r\n";

        // HTML section
        $mimeBody .= "--$boundary\r\n";
        $mimeBody .= "Content-Type: text/html; charset=UTF-8\r\n";
        $mimeBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $mimeBody .= chunk_split(base64_encode($htmlBody)) . "\r\n";

        $mimeBody .= "--$boundary--\r\n";

        // Write message body
        fwrite($this->socket, $mimeBody);
        
        // Final period
        $sentOk = $this->sendCommand(".", '250');

        $this->sendCommand("QUIT", '221');
        $this->close();

        return $sentOk;
    }

    private function close(): void
    {
        if ($this->socket) {
            @fclose($this->socket);
            $this->socket = null;
        }
    }
}
