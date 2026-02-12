<?php
/**
 * IlluminatOS! Auth API
 *
 * POST /api/auth.php
 * Actions: login, logout, check, change-password
 *
 * Uses PHP sessions for authentication.
 */

session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

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
        return [
            'password_hash' => password_hash('admin', PASSWORD_BCRYPT),
            'force_change' => true
        ];
    }
    return require $credFile;
}

function handleLogin(array $input): void {
    $password = $input['password'] ?? '';
    $credentials = getCredentials();

    if (password_verify($password, $credentials['password_hash'])) {
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_login_time'] = time();

        // Generate CSRF token
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        echo json_encode([
            'success' => true,
            'forcePasswordChange' => $credentials['force_change'] ?? false,
            'csrfToken' => $_SESSION['csrf_token']
        ]);
    } else {
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
