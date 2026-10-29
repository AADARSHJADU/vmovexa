/**
 * Universal clipboard copy utility with cross-browser fallback
 * Supports HTTPS, HTTP localhost, mobile webviews, and legacy browsers
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  const strText = String(text);

  // 1. Modern navigator.clipboard API if available and secure
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(strText);
      return true;
    } catch (_) {
      // Fall through to legacy fallback on permission rejection or non-secure context
    }
  }

  // 2. Fallback using hidden in-viewport textarea & document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = strText;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0.01';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, strText.length);
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return Boolean(successful);
  } catch (err) {
    return false;
  }
}
