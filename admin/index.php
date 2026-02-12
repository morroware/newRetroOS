<?php
/**
 * IlluminatOS! Admin Panel
 * PHP-backed configuration dashboard for managing the OS.
 */
session_start();

$authenticated = $_SESSION['admin_authenticated'] ?? false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IlluminatOS! Admin Panel</title>
    <link rel="stylesheet" href="assets/admin.css">
</head>
<body>
    <div id="app">
        <!-- Login Screen -->
        <div id="loginScreen" class="screen <?php echo $authenticated ? 'hidden' : ''; ?>">
            <div class="login-box">
                <div class="login-header">
                    <h1>IlluminatOS! Admin</h1>
                    <p>Configuration Dashboard</p>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="password">Admin Password</label>
                        <input type="password" id="password" name="password" placeholder="Enter password" autofocus>
                    </div>
                    <button type="submit" class="btn btn-primary">Login</button>
                    <div id="loginError" class="error-msg hidden"></div>
                </form>
            </div>
        </div>

        <!-- Dashboard -->
        <div id="dashboard" class="screen <?php echo $authenticated ? '' : 'hidden'; ?>">
            <header class="admin-header">
                <div class="header-left">
                    <h1>IlluminatOS! Admin</h1>
                    <span class="badge">Configuration Dashboard</span>
                </div>
                <div class="header-right">
                    <button id="btnSaveAll" class="btn btn-success">Save All Changes</button>
                    <button id="btnLogout" class="btn btn-secondary">Logout</button>
                </div>
            </header>

            <div class="admin-layout">
                <nav class="sidebar">
                    <ul id="sectionNav">
                        <li class="active" data-section="branding">Branding</li>
                        <li data-section="bootTips">Boot Tips</li>
                        <li data-section="desktopIcons">Desktop Icons</li>
                        <li data-section="defaults">Default Settings</li>
                        <li data-section="quickLaunch">Quick Launch</li>
                        <li data-section="wallpapers">Wallpapers</li>
                        <li data-section="colorSchemes">Color Schemes</li>
                        <li data-section="features">Features</li>
                        <li data-section="apps">Applications</li>
                        <li data-section="password">Change Password</li>
                    </ul>
                </nav>

                <main class="content" id="editorContent">
                    <!-- Section editors rendered by JS -->
                    <div class="placeholder">
                        <p>Loading configuration...</p>
                    </div>
                </main>
            </div>

            <div id="statusBar" class="status-bar">
                <span id="statusText">Ready</span>
                <span id="statusSaved" class="hidden">All changes saved</span>
            </div>
        </div>
    </div>

    <script src="assets/admin.js" type="module"></script>
</body>
</html>
