/**
 * Performance Optimization Utilities
 * @version 1.0.0
 * @date 2025-10-20
 *
 * Provides helper functions for runtime performance optimizations
 */

/**
 * Adds passive event listeners for better scroll performance
 * Passive listeners tell the browser that preventDefault() won't be called
 * This allows the browser to optimize scrolling performance
 *
 * @param {HTMLElement} element - DOM element to attach listener to
 * @param {string} eventName - Event name (e.g., 'scroll', 'touchstart')
 * @param {Function} handler - Event handler function
 * @param {object} options - Additional options
 * @returns {Function} cleanup function to remove listener
 */
export function addPassiveEventListener(element, eventName, handler, options = {}) {
  const passiveOptions = {
    ...options,
    passive: true
  };

  element.addEventListener(eventName, handler, passiveOptions);

  // Return cleanup function
  return () => {
    element.removeEventListener(eventName, handler, passiveOptions);
  };
}

/**
 * Debounce function for expensive operations
 * Delays execution until after wait milliseconds have elapsed
 * since the last time it was invoked
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for rate-limiting expensive operations
 * Ensures function is called at most once per wait milliseconds
 *
 * @param {Function} func - Function to throttle
 * @param {number} wait - Milliseconds between calls
 * @returns {Function} throttled function
 */
export function throttle(func, wait = 300) {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
}

/**
 * requestAnimationFrame wrapper for smooth animations
 * Ensures animations run at optimal frame rate
 *
 * @param {Function} callback - Animation callback
 * @returns {number} animation frame ID
 */
export function rafSchedule(callback) {
  let rafId = null;

  return function scheduledCallback(...args) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      callback(...args);
      rafId = null;
    });
  };
}

/**
 * Lazy load images using Intersection Observer
 * Images should have data-src attribute with actual image URL
 * and a placeholder src
 *
 * @param {string} selector - CSS selector for images to lazy load
 * @param {object} options - IntersectionObserver options
 */
export function lazyLoadImages(selector = 'img[data-src]', options = {}) {
  const images = document.querySelectorAll(selector);

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01,
      ...options
    });

    images.forEach(img => imageObserver.observe(img));

    return () => imageObserver.disconnect();
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
      }
    });
  }
}

/**
 * Prefetch resources for faster navigation
 * Useful for preloading next page or critical resources
 *
 * @param {string} url - URL to prefetch
 * @param {string} type - Resource type ('fetch', 'document', 'script', 'style')
 */
export function prefetchResource(url, type = 'fetch') {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
}

/**
 * Preconnect to external domains for faster resource loading
 * Establishes early connection to improve load time
 *
 * @param {string} url - Domain URL to preconnect
 * @param {boolean} crossorigin - Whether to use CORS
 */
export function preconnect(url, crossorigin = false) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * Check if device prefers reduced motion
 * Useful for disabling animations for accessibility
 *
 * @returns {boolean} true if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get device memory if available (Chrome only)
 * Useful for adaptive performance strategies
 *
 * @returns {number|null} device memory in GB, or null if unavailable
 */
export function getDeviceMemory() {
  return navigator.deviceMemory || null;
}

/**
 * Check if connection is slow (Save-Data or slow effective connection)
 * Useful for serving lighter content on slow connections
 *
 * @returns {boolean} true if connection is slow
 */
export function isSlowConnection() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) return false;

  // Check if user enabled data saver
  if (connection.saveData) return true;

  // Check effective connection type (2g, 3g, 4g)
  const slowTypes = ['slow-2g', '2g'];
  return slowTypes.includes(connection.effectiveType);
}

/**
 * Adaptive loading strategy based on device capabilities
 * Returns recommended quality level for resources
 *
 * @returns {string} 'high', 'medium', or 'low'
 */
export function getAdaptiveQuality() {
  const memory = getDeviceMemory();
  const slowConnection = isSlowConnection();

  if (slowConnection || (memory && memory <= 2)) {
    return 'low';
  }

  if (memory && memory <= 4) {
    return 'medium';
  }

  return 'high';
}
