<?php
/**
 * Nexus Matrix — Contact Form Handler
 * Receives POST from /contact.html, validates, sends email, returns JSON.
 */

// ─── CORS: same-origin only ───────────────────────────────────────────────────
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed = 'https://nexusmatrix.com'; // TODO: update to real domain
if ($origin === $allowed) {
    header('Access-Control-Allow-Origin: ' . $allowed);
}
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Only allow POST ──────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function respond(bool $success, string $message, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

function clean(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

// ─── Honeypot check ───────────────────────────────────────────────────────────
$honeypot = isset($_POST['website']) ? $_POST['website'] : '';
if (!empty($honeypot)) {
    // Silently accept to avoid revealing bot detection
    respond(true, 'Thank you! We will be in touch within 24 hours.');
}

// ─── Rate limiting (file-based, per session) ──────────────────────────────────
session_start();
$now = time();
if (isset($_SESSION['nm_last_submit'])) {
    $elapsed = $now - (int)$_SESSION['nm_last_submit'];
    if ($elapsed < 60) {
        respond(false, 'Please wait a moment before submitting again.', 429);
    }
}
$_SESSION['nm_last_submit'] = $now;

// ─── Collect & validate fields ───────────────────────────────────────────────
$full_name      = clean(isset($_POST['full_name'])      ? $_POST['full_name']      : '');
$email_raw      = isset($_POST['email'])                ? trim($_POST['email'])     : '';
$email          = filter_var($email_raw, FILTER_SANITIZE_EMAIL);
$phone          = clean(isset($_POST['phone'])          ? $_POST['phone']          : '');
$company        = clean(isset($_POST['company'])        ? $_POST['company']        : '');
$service        = clean(isset($_POST['service'])        ? $_POST['service']        : '');
$project_details = clean(isset($_POST['project_details']) ? $_POST['project_details'] : '');
$privacy_policy = isset($_POST['privacy_policy'])       ? (int)$_POST['privacy_policy'] : 0;

// Required fields
if (empty($full_name)) {
    respond(false, 'Full Name is required.');
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'A valid email address is required.');
}
if (empty($service)) {
    respond(false, 'Please select the service you are interested in.');
}
if (empty($project_details)) {
    respond(false, 'Please describe your project.');
}
if ($privacy_policy !== 1) {
    respond(false, 'You must accept the Privacy Policy to proceed.');
}

// ─── Configuration — TODO: replace with real values ──────────────────────────
$to_email     = 'info@nexusmatrix.com'; // TODO: replace with real email
$from_email   = 'noreply@nexusmatrix.com'; // TODO: replace with real domain
$from_name    = 'Nexus Matrix Website';
$subject      = 'New AI Project Enquiry — ' . $service;
$reply_to     = $email;

// ─── Build email body (notification to team) ─────────────────────────────────
$email_body = "New contact form submission from nexusmatrix.com\n";
$email_body .= str_repeat('─', 60) . "\n\n";
$email_body .= "Name:            {$full_name}\n";
$email_body .= "Email:           {$email}\n";
$email_body .= "Phone:           " . (!empty($phone) ? $phone : 'Not provided') . "\n";
$email_body .= "Company:         " . (!empty($company) ? $company : 'Not provided') . "\n";
$email_body .= "Service:         {$service}\n\n";
$email_body .= "Project Details:\n{$project_details}\n\n";
$email_body .= str_repeat('─', 60) . "\n";
$email_body .= "Submitted:       " . date('Y-m-d H:i:s T') . "\n";
$email_body .= "IP Address:      " . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown') . "\n";

// ─── Build auto-reply body ────────────────────────────────────────────────────
$auto_reply_subject = 'We received your enquiry — Nexus Matrix';
$auto_reply_body  = "Hello {$full_name},\n\n";
$auto_reply_body .= "Thank you for reaching out to Nexus Matrix. We have received your enquiry about {$service} and will respond within 24 business hours.\n\n";
$auto_reply_body .= "Here is a summary of what you submitted:\n\n";
$auto_reply_body .= "  Service:  {$service}\n";
$auto_reply_body .= "  Project:  {$project_details}\n\n";
$auto_reply_body .= "In the meantime, you can learn more about our services at https://nexusmatrix.com/services\n\n";
$auto_reply_body .= "Best regards,\nThe Nexus Matrix Team\nhttps://nexusmatrix.com\n\n";
$auto_reply_body .= "───\nThis is an automated confirmation. Please do not reply to this message.\n";
$auto_reply_body .= "For urgent matters, email us directly at {$to_email}\n"; // TODO: real email

// ─── Send via PHPMailer if available, else PHP mail() fallback ───────────────
$phpmailer_path = __DIR__ . '/../vendor/autoload.php';
$use_phpmailer  = file_exists($phpmailer_path);

if ($use_phpmailer) {
    require_once $phpmailer_path;

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    // Notification email
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        // TODO: configure SMTP credentials for Bluehost
        // $mail->Host       = 'mail.nexusmatrix.com';
        // $mail->SMTPAuth   = true;
        // $mail->Username   = 'noreply@nexusmatrix.com';
        // $mail->Password   = 'YOUR_SMTP_PASSWORD';
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        // $mail->Port       = 587;
        $mail->isMail(); // Use PHP mail() until SMTP configured
        $mail->setFrom($from_email, $from_name);
        $mail->addAddress($to_email);
        $mail->addReplyTo($reply_to, $full_name);
        $mail->Subject = $subject;
        $mail->Body    = $email_body;
        $mail->send();
    } catch (Exception $e) {
        // Log silently; do not expose error to user
        error_log('Nexus Matrix contact form — notification email failed: ' . $e->getMessage());
    }

    // Auto-reply email
    try {
        $reply = new PHPMailer(true);
        $reply->isMail();
        $reply->setFrom($from_email, $from_name);
        $reply->addAddress($email, $full_name);
        $reply->Subject = $auto_reply_subject;
        $reply->Body    = $auto_reply_body;
        $reply->send();
    } catch (Exception $e) {
        error_log('Nexus Matrix contact form — auto-reply failed: ' . $e->getMessage());
    }

} else {
    // Fallback: PHP mail()
    $headers  = "From: {$from_name} <{$from_email}>\r\n";
    $headers .= "Reply-To: {$full_name} <{$email}>\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $sent = @mail($to_email, $subject, $email_body, $headers);

    if (!$sent) {
        error_log('Nexus Matrix contact form — mail() failed for notification.');
    }

    // Auto-reply
    $auto_headers  = "From: {$from_name} <{$from_email}>\r\n";
    $auto_headers .= "MIME-Version: 1.0\r\n";
    $auto_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    @mail($email, $auto_reply_subject, $auto_reply_body, $auto_headers);
}

// ─── Success response ─────────────────────────────────────────────────────────
respond(true, 'Thank you, ' . $full_name . '! Your message has been sent. We will respond within 24 business hours.');
