const schema = {
    properties: {
        body: {
            type: 'string',
            minLength: 1,
            pattern: '\=$'
        },
    },
    requireed: ['body'],
};

export default schema;