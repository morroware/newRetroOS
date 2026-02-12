<?php
/**
 * Admin credentials for IlluminatOS! Admin Panel
 *
 * IMPORTANT: Change the default password on first login!
 * This file should be gitignored in production.
 *
 * Password is stored as a bcrypt hash.
 * Default password: 'admin' (CHANGE THIS!)
 */

return [
    'password_hash' => password_hash('admin', PASSWORD_BCRYPT),
    'force_change' => true
];
