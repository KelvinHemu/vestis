/**
 * Custom Black Dot Cursor for Shop Pages
 * 
 * Replicates the NOOON-style custom cursor — a small filled
 * black circle instead of the default arrow pointer.
 * 
 * Usage: Apply SHOP_CURSOR_STYLE to the root container's style prop,
 * and SHOP_CURSOR_CLASS to its className for nested overrides.
 * 
 * The SVG data-URL creates a 20×20 viewport with a 6px radius
 * black circle centered at (10,10). Hotspot is (10,10) so the
 * click point is exactly at the dot center.
 */

// Data-URL SVG for a small black dot cursor
const CURSOR_DOT_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='6' fill='%23111111'/%3E%3C/svg%3E") 10 10, auto`;

/**
 * Inline style object to apply the custom black dot cursor.
 * Spread this into any component's style prop.
 */
export const SHOP_CURSOR_STYLE: React.CSSProperties = {
  cursor: CURSOR_DOT_SVG,
};

/**
 * Raw cursor CSS value for use in template literals or
 * places where you need just the string.
 */
export const SHOP_CURSOR_VALUE = CURSOR_DOT_SVG;

