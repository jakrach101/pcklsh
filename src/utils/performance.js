/**
 * Performance Optimization Utilities
 * Tools for optimizing application performance
 */

/**
 * Lazy loading utility for components
 * @param {Function} loader - Component loader function
 * @returns {Promise} Loaded component
 */
export function lazyLoad(loader) {
    return new Promise((resolve, reject) => {
        const loadComponent = async () => {
            try {
                const component = await loader();
                resolve(component);
            } catch (error) {
                reject(error);
            }
        };

        // Load immediately if already available
        if (document.readyState === 'complete') {
            loadComponent();
        } else {
            // Wait for DOM to be ready
            document.addEventListener('DOMContentLoaded', loadComponent);
        }
    });
}

/**
 * Intersection Observer for lazy loading elements
 * @param {Element} element - Element to observe
 * @param {Function} callback - Callback when element is visible
 * @param {Object} options - Intersection observer options
 * @returns {IntersectionObserver} Observer instance
 */
export function createIntersectionObserver(element, callback, options = {}) {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry);
                observer.unobserve(entry.target);
            }
        });
    }, { ...defaultOptions, ...options });

    observer.observe(element);
    return observer;
}

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource URLs
 * @param {string} type - Resource type ('script', 'style', 'image')
 */
export function preloadResources(resources, type = 'script') {
    resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = type;
        document.head.appendChild(link);
    });
}

/**
 * Optimize images with lazy loading
 * @param {string} selector - CSS selector for images
 */
export function optimizeImages(selector = 'img[data-src]') {
    const images = document.querySelectorAll(selector);
    
    images.forEach(img => {
        createIntersectionObserver(img, (entry) => {
            const image = entry.target;
            image.src = image.dataset.src;
            image.classList.remove('lazy');
            image.classList.add('loaded');
        });
    });
}

/**
 * Memory management utility
 */
export class MemoryManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
        this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
        this.startCleanup();
    }

    /**
     * Set cache item with expiration
     * @param {string} key - Cache key
     * @param {any} value - Cache value
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, value, ttl = 10 * 60 * 1000) {
        if (this.cache.size >= this.maxSize) {
            this.cleanup();
        }

        this.cache.set(key, {
            value,
            expires: Date.now() + ttl
        });
    }

    /**
     * Get cache item
     * @param {string} key - Cache key
     * @returns {any} Cache value or null
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Clean up expired items
     */
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expires) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Start automatic cleanup
     */
    startCleanup() {
        setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
        this.init();
    }

    /**
     * Initialize performance monitoring
     */
    init() {
        if ('PerformanceObserver' in window) {
            this.observeMetrics();
        }
    }

    /**
     * Observe performance metrics
     */
    observeMetrics() {
        // Observe navigation timing
        if ('navigation' in performance.getEntriesByType('navigation')[0]) {
            this.recordNavigationMetrics();
        }

        // Observe resource loading
        const resourceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                this.recordResourceMetric(entry);
            });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Observe layout shifts
        if ('LayoutShift' in window) {
            const clsObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordLayoutShift(entry);
                });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }

        // Observe largest contentful paint
        if ('LargestContentfulPaint' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordLCP(entry);
                });
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    /**
     * Record navigation metrics
     */
    recordNavigationMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        this.metrics.set('navigationTiming', {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            request: navigation.responseStart - navigation.requestStart,
            response: navigation.responseEnd - navigation.responseStart,
            domParsing: navigation.domComplete - navigation.domLoading,
            pageLoad: navigation.loadEventEnd - navigation.navigationStart
        });
    }

    /**
     * Record resource loading metrics
     * @param {PerformanceResourceTiming} entry - Resource timing entry
     */
    recordResourceMetric(entry) {
        const resourceMetrics = this.metrics.get('resources') || [];
        resourceMetrics.push({
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            type: entry.initiatorType
        });
        this.metrics.set('resources', resourceMetrics);
    }

    /**
     * Record layout shift
     * @param {LayoutShift} entry - Layout shift entry
     */
    recordLayoutShift(entry) {
        const cls = this.metrics.get('cls') || 0;
        this.metrics.set('cls', cls + entry.value);
    }

    /**
     * Record largest contentful paint
     * @param {LargestContentfulPaint} entry - LCP entry
     */
    recordLCP(entry) {
        this.metrics.set('lcp', entry.startTime);
    }

    /**
     * Get all metrics
     * @returns {Object} Performance metrics
     */
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    /**
     * Get specific metric
     * @param {string} key - Metric key
     * @returns {any} Metric value
     */
    getMetric(key) {
        return this.metrics.get(key);
    }

    /**
     * Log performance summary
     */
    logSummary() {
        const metrics = this.getMetrics();
        console.group('Performance Summary');
        console.log('Navigation Timing:', metrics.navigationTiming);
        console.log('Cumulative Layout Shift:', metrics.cls);
        console.log('Largest Contentful Paint:', metrics.lcp);
        console.log('Resource Count:', metrics.resources?.length || 0);
        console.groupEnd();
    }
}

/**
 * Bundle analyzer utility
 */
export class BundleAnalyzer {
    constructor() {
        this.modules = new Map();
        this.init();
    }

    /**
     * Initialize bundle analysis
     */
    init() {
        if (typeof __webpack_require__ !== 'undefined') {
            this.analyzeWebpack();
        }
    }

    /**
     * Analyze webpack bundles
     */
    analyzeWebpack() {
        // This would be implemented with webpack specific APIs
        console.log('Bundle analysis not available in this environment');
    }

    /**
     * Get bundle size information
     * @returns {Object} Bundle size data
     */
    getBundleSize() {
        return {
            total: this.calculateTotalSize(),
            modules: Array.from(this.modules.entries())
        };
    }

    /**
     * Calculate total bundle size
     * @returns {number} Total size in bytes
     */
    calculateTotalSize() {
        let total = 0;
        for (const [, size] of this.modules) {
            total += size;
        }
        return total;
    }
}

// Create global instances
export const memoryManager = new MemoryManager();
export const performanceMonitor = new PerformanceMonitor();
export const bundleAnalyzer = new BundleAnalyzer();

// Start performance monitoring in development
if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
        performanceMonitor.logSummary();
    }, 5000);
}