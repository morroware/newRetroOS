<?php
/**
 * IlluminatOS! Config Save API
 *
 * POST /api/save.php
 * Saves admin configuration changes to overrides.json.
 *
 * Expects JSON body: { "section": "branding", "data": { ... } }
 * Or for full save:  { "config": { ... } }
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

// Check authentication
if (!($_SESSION['admin_authenticated'] ?? false)) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

// Verify CSRF token
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body']);
    exit;
}

$csrfToken = $input['csrfToken'] ?? '';
$sessionToken = $_SESSION['csrf_token'] ?? '';
if (!$sessionToken || !hash_equals($sessionToken, $csrfToken)) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid CSRF token']);
    exit;
}

$configDir = __DIR__ . '/../config';
$overridesFile = $configDir . '/overrides.json';
$defaultsFile = $configDir . '/defaults.json';

// Valid config sections
$validSections = [
    'branding', 'bootTips', 'desktopIcons', 'defaults',
    'quickLaunch', 'wallpapers', 'colorSchemes', 'features',
    'filesystem', 'apps', 'plugins'
];

// Load current overrides
$overrides = [];
if (file_exists($overridesFile)) {
    $overridesData = json_decode(file_get_contents($overridesFile), true);
    if ($overridesData !== null) {
        $overrides = $overridesData;
    }
}

$action = $input['action'] ?? 'save-section';
$section = null;

switch ($action) {
    case 'save-section':
        $section = $input['section'] ?? '';
        $data = $input['data'] ?? null;

        if (!in_array($section, $validSections)) {
            http_response_code(400);
            echo json_encode(['error' => "Invalid section: $section"]);
            exit;
        }

        if ($data === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing data']);
            exit;
        }

        // Validate the section data
        $validationError = validateSection($section, $data);
        if ($validationError) {
            http_response_code(400);
            echo json_encode(['error' => $validationError]);
            exit;
        }

        $overrides[$section] = $data;
        break;

    case 'reset-section':
        $section = $input['section'] ?? '';
        if (!in_array($section, $validSections)) {
            http_response_code(400);
            echo json_encode(['error' => "Invalid section: $section"]);
            exit;
        }
        unset($overrides[$section]);
        break;

    case 'save-full':
        $config = $input['config'] ?? null;
        if ($config === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing config']);
            exit;
        }
        // Only keep valid sections
        $filtered = array_intersect_key($config, array_flip($validSections));
        // Validate each section
        foreach ($filtered as $sec => $data) {
            $validationError = validateSection($sec, $data);
            if ($validationError) {
                http_response_code(400);
                echo json_encode(['error' => "Validation failed for section '$sec': $validationError"]);
                exit;
            }
        }
        $overrides = $filtered;
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit;
}

// Atomic write: write to temp file then rename
$tmpFile = $overridesFile . '.tmp.' . getmypid();
$json = json_encode($overrides, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if (file_put_contents($tmpFile, $json, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write config']);
    exit;
}

if (!rename($tmpFile, $overridesFile)) {
    unlink($tmpFile);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save config']);
    exit;
}

echo json_encode(['success' => true, 'section' => $section ?? 'full']);

/**
 * Validate section data based on its type.
 * Returns error string or null if valid.
 */
function validateSection(string $section, $data): ?string {
    switch ($section) {
        case 'branding':
            if (!is_array($data)) return 'Branding must be an object';
            foreach ($data as $key => $value) {
                if (!is_string($value)) return "Branding.$key must be a string";
                if (strlen($value) > 200) return "Branding.$key exceeds max length (200)";
                if ($value !== strip_tags($value)) return "Branding.$key contains HTML";
            }
            break;

        case 'bootTips':
            if (!is_array($data)) return 'Boot tips must be an array';
            foreach ($data as $i => $tip) {
                if (!is_string($tip)) return "Boot tip #$i must be a string";
                if (strlen($tip) > 200) return "Boot tip #$i exceeds max length (200)";
            }
            break;

        case 'desktopIcons':
            if (!is_array($data)) return 'Desktop icons must be an array';
            foreach ($data as $i => $icon) {
                if (!is_array($icon)) return "Desktop icon #$i must be an object";
                if (empty($icon['id'])) return "Desktop icon #$i missing id";
                if (empty($icon['label'])) return "Desktop icon #$i missing label";
                if (isset($icon['url']) && !filter_var($icon['url'], FILTER_VALIDATE_URL)) {
                    return "Desktop icon #$i has invalid URL";
                }
            }
            break;

        case 'defaults':
            if (!is_array($data)) return 'Defaults must be an object';
            break;

        case 'quickLaunch':
            if (!is_array($data)) return 'Quick launch must be an array';
            foreach ($data as $i => $item) {
                if (!is_array($item)) return "Quick launch #$i must be an object";
                if (empty($item['type'])) return "Quick launch #$i missing type";
                if (isset($item['url']) && !filter_var($item['url'], FILTER_VALIDATE_URL)) {
                    return "Quick launch #$i has invalid URL";
                }
            }
            break;

        case 'wallpapers':
            if (!is_array($data)) return 'Wallpapers must be an object';
            foreach ($data as $key => $wp) {
                if (!is_array($wp)) return "Wallpaper '$key' must be an object";
                if (isset($wp['css'])) {
                    // Block dangerous CSS values
                    $css = strtolower($wp['css']);
                    if (strpos($css, 'url(') !== false) return "Wallpaper '$key' CSS cannot contain url()";
                    if (strpos($css, 'expression(') !== false) return "Wallpaper '$key' CSS cannot contain expression()";
                    if (strpos($css, 'javascript:') !== false) return "Wallpaper '$key' CSS cannot contain javascript:";
                }
            }
            break;

        case 'colorSchemes':
            if (!is_array($data)) return 'Color schemes must be an object';
            foreach ($data as $key => $scheme) {
                if (!is_array($scheme)) return "Color scheme '$key' must be an object";
                if (isset($scheme['window']) && !preg_match('/^#[0-9a-fA-F]{3,6}$/', $scheme['window'])) {
                    return "Color scheme '$key' window color is not valid hex";
                }
                if (isset($scheme['titlebar']) && !preg_match('/^#[0-9a-fA-F]{3,6}$/', $scheme['titlebar'])) {
                    return "Color scheme '$key' titlebar color is not valid hex";
                }
            }
            break;

        case 'features':
        case 'filesystem':
        case 'apps':
        case 'plugins':
            // Basic type check
            if (!is_array($data)) return "$section must be an object or array";
            break;
    }

    return null;
}
