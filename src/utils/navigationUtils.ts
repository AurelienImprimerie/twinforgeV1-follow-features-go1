/**
 * Navigation Utilities
 * Helper functions for smooth navigation with scroll behavior
 */

import { NavigateFunction } from 'react-router-dom';

/**
 * Navigate to a route with optional smooth scroll to element
 * @param navigate - React Router navigate function
 * @param route - Route path (e.g., '/profile')
 * @param options - Navigation options
 */
export function navigateWithScroll(
  navigate: NavigateFunction,
  route: string,
  options?: {
    hash?: string; // Element ID to scroll to (without #)
    tab?: string; // Tab to activate
    smooth?: boolean; // Use smooth scroll (default: true)
    delay?: number; // Delay before scrolling in ms (default: 100)
  }
) {
  const { hash, tab, smooth = true, delay = 100 } = options || {};

  // Build the full route with query params and hash
  let fullRoute = route;
  const params = new URLSearchParams();

  if (tab) {
    params.set('tab', tab);
  }

  const queryString = params.toString();
  if (queryString) {
    fullRoute += `?${queryString}`;
  }

  // Add hash to URL if provided
  if (hash) {
    fullRoute += `#${hash}`;
  }

  // Navigate to the route with hash
  // The target component should handle scrolling to the hash element
  navigate(fullRoute);
}

/**
 * Navigate to profile page with specific tab and optional section
 * @param navigate - React Router navigate function
 * @param tab - Tab name (e.g., 'nutrition', 'identity', 'health')
 * @param section - Optional section ID to scroll to
 */
export function navigateToProfile(
  navigate: NavigateFunction,
  tab?: string,
  section?: string
) {
  navigateWithScroll(navigate, '/profile', {
    tab,
    hash: section,
    smooth: true,
    delay: 150 // Slightly longer delay for tab switching
  });
}

/**
 * Scroll to element by ID with smooth behavior
 * @param elementId - Element ID (without #)
 * @param options - Scroll options
 */
export function scrollToElement(
  elementId: string,
  options?: {
    smooth?: boolean;
    block?: ScrollLogicalPosition;
    delay?: number;
  }
) {
  const { smooth = true, block = 'start', delay = 0 } = options || {};

  const scrollFn = () => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block,
        inline: 'nearest'
      });
    }
  };

  if (delay > 0) {
    setTimeout(scrollFn, delay);
  } else {
    scrollFn();
  }
}
