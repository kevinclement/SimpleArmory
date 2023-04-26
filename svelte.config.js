import adapter from '@sveltejs/adapter-static';

const config = {
    kit: {
        // By default, `npm run build` will create a standard Node app.
        // You can create optimized builds for different platforms by
        // specifying a different adapter
        adapter: adapter({
            fallback: "index.html"
        }),

        alias: {
            '$api': 'src/api',
            '$components': 'src/components',
            '$stores': 'src/stores',
            '$pages': 'src/pages',
            '$util': 'src/util',
        }
    }
};

export default config;
