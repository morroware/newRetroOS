<?php
/**
 * IlluminatOS! Auth API
 *
 * POST /api/auth.php
 * Actions: login, logout, check, change-password
 *
 * Uses PHP sessions for authentication.
 */

// Harden session cookie parameters before starting the session
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Strict');
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    ini_set('session.cookie_secure', '1');
}

session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// Enforce max session age (8 hours) for admin sessions
$maxSessionAge = 28800; // 8 hours in seconds
if (isset($_SESSION['admin_login_time']) && (time() - $_SESSION['admin_login_time'] > $maxSessionAge)) {
    unset($_SESSION['admin_authenticated']);
    unset($_SESSION['admin_login_time']);
    unset($_SESSION['csrf_token']);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin($input);
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        handleCheck();
        break;
    case 'change-password':
        handleChangePassword($input);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

function getCredentials(): array {
    $credFile = __DIR__ . '/../config/admin-credentials.php';
    if (!file_exists($credFile)) {
        // Only allow insecure fallback in explicit dev mode (ILLUMINATOS_DEV=1 env var)
        if (getenv('ILLUMINATOS_DEV') === '1') {
            // Static bcrypt hash of 'admin' - dev-only fallback
            return [
                'password_hash' => '$2y$12$5SwhxLazB5TD89J6GS9Gvu9aLVRIJxnD0BYeQKVGJfnPE9.4WXDIO',
                'force_change' => true
            ];
        }
        // Fail closed: refuse to authenticate without a credentials file
        http_response_code(500);
        echo json_encode(['error' => 'Admin credentials not configured. Create config/admin-credentials.php or set ILLUMINATOS_DEV=1 for development.']);
        exit;
    }
    return require $credFile;
}

function handleLogin(array $input): void {
    $password = $input['password'] ?? '';

    // Basic rate limiting: track failed attempts in the session
    $attempts = $_SESSION['login_attempts'] ?? 0;
    $lastAttempt = $_SESSION['last_attempt_time'] ?? 0;

    // Reset attempt counter after 15 minutes of inactivity
    if (time() - $lastAttempt > 900) {
        $attempts = 0;
    }

    // Block after 10 failed attempts within the window
    if ($attempts >= 10) {
        $retryAfter = 900 - (time() - $lastAttempt);
        http_response_code(429);
        echo json_encode(['error' => 'Too many login attempts. Try again later.', 'retryAfter' => max(0, $retryAfter)]);
        return;
    }

    $credentials = getCredentials();

    if (password_verify($password, $credentials['password_hash'])) {
        // Regenerate session ID to prevent session fixation
        session_regenerate_id(true);

        // Reset attempt counter on success
        unset($_SESSION['login_attempts']);
        unset($_SESSION['last_attempt_time']);

        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_login_time'] = time();

        // Generate CSRF token (always fresh after session regeneration)
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

        echo json_encode([
            'success' => true,
            'forcePasswordChange' => $credentials['force_change'] ?? false,
            'csrfToken' => $_SESSION['csrf_token']
        ]);
    } else {
        // Track failed attempt
        $_SESSION['login_attempts'] = $attempts + 1;
        $_SESSION['last_attempt_time'] = time();

        http_response_code(401);
        echo json_encode(['error' => 'Invalid password']);
    }
}

function handleLogout(): void {
    session_destroy();
    echo json_encode(['success' => true]);
}

function handleCheck(): void {
    $authenticated = $_SESSION['admin_authenticated'] ?? false;
    echo json_encode([
        'authenticated' => $authenticated,
        'csrfToken' => $_SESSION['csrf_token'] ?? null
    ]);
}

function handleChangePassword(array $input): void {
    if (!($_SESSION['admin_authenticated'] ?? false)) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        return;
    }

    // Verify CSRF token (constant-time comparison)
    $csrfToken = $input['csrfToken'] ?? '';
    $sessionToken = $_SESSION['csrf_token'] ?? '';
    if (!$sessionToken || !hash_equals($sessionToken, $csrfToken)) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid CSRF token']);
        return;
    }

    $currentPassword = $input['currentPassword'] ?? '';
    $newPassword = $input['newPassword'] ?? '';

    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        return;
    }

    $credentials = getCredentials();

    if (!password_verify($currentPassword, $credentials['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Current password is incorrect']);
        return;
    }

    // Write new credentials
    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
    $credFile = __DIR__ . '/../config/admin-credentials.php';
    $content = "<?php\nreturn [\n    'password_hash' => '$newHash',\n    'force_change' => false\n];\n";

    if (file_put_contents($credFile, $content, LOCK_EX) === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save credentials']);
        return;
    }

    echo json_encode(['success' => true]);
}
