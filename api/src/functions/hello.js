const { app } = require('@azure/functions');

// GET /api/hello
app.http('hello', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`hello requested: ${request.url}`);
        return {
            jsonBody: { message: 'hola desde Azure' }
        };
    }
});
