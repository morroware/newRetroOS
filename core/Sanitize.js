/**
 * Sanitize - Centralized HTML/URL sanitization utilities
 *
 * Prevents DOM XSS by providing safe rendering helpers.
 * All dynamic values rendered into innerHTML must pass through
 * escapeHtml() or use setText()/setAttr() DOM helpers instead.
 */

const _escapeDiv = document.createElement('div');

/**
 * Escape a string for safe interpolation into innerHTML.
 * Uses the browser's own textContent -> innerHTML encoding.
 */
export function escapeHtml(text) {
    _escapeDiv.textContent = text == null ? '' : String(text);
    return _escapeDiv.innerHTML;
}

/**
 * Set an element's text content safely (no HTML interpretation).
 */
export function setText(el, value) {
    el.textContent = value == null ? '' : String(value);
}

/**
 * Set a DOM attribute safely (properly quoted by the browser).
 */
export function setAttr(el, attr, value) {
    el.setAttribute(attr, value == null ? '' : String(value));
}

/**
 * Returns true if the value is a safe HTTP(S) URL.
 * Rejects javascript:, data:, vbscript:, and other dangerous schemes.
 */
export function isSafeHttpUrl(value) {
    try {
        const u = new URL(value, window.location.origin);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

export default { escapeHtml, setText, setAttr, isSafeHttpUrl };
