import path from 'path';
import adapter from '@sveltejs/adapter-static';

const config = {
	kit: {
		// By default, `npm run build` will create a standard Node app.
		// You can create optimized builds for different platforms by
		// specifying a different adapter
		adapter: adapter({
			fallback: "index.html"
		}),

		vite: {
			resolve: {
				alias: {
					'$api': path.resolve('./src/api'),
					'$components': path.resolve('./src/components'),
					'$stores': path.resolve('./src/stores'),
					'$pages': path.resolve('./src/pages'),
					'$util': path.resolve('./src/util'),
				}
			},
		},
	}
};

export default config;
