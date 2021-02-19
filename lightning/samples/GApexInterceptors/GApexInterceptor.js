$define('gInterceptor', [], function() {
    return {
        beforeExecute: (query, requestId) => {
            console.time(`G.apex ${requestId}`);
            return query;
        },

        execute: (query, requestId) => {
            // Return a promise to replace the old request
            return null;
        },

        afterExecute: (data, query, requestId) => {
            console.log(`Query ${requestId}: `, query);
            console.log(`Data ${requestId}: `, data);
            console.timeEnd(`G.apex ${requestId}`);
            return data;
        },
    };
});
