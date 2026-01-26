export function setupLogging(environment: string) {
    // Suppress all native console outputs globally only in production (use CustomLoggerService instead)
    // Keep console.error and console.warn in development for debugging
    if (environment === 'production') {
        try {
            const noop = () => { };
            (console as any).log = noop;
            (console as any).info = noop;
            // Keep warnings and errors visible in production
            // (console as any).warn = noop;
            (console as any).debug = noop;
            // Keep console.error for critical errors even in production
            // (console as any).error = noop; // Uncomment if you want to suppress all console outputs
        } catch { }
    }
}
