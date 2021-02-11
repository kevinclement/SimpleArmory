// Consult https://www.snowpack.dev to learn about these options
module.exports = {
	extends: '@sveltejs/snowpack-config',
	
	mount: {
		'src/components': '/_components',
		'src/stores': '/_stores',
		'src/api': '/_api',
		'src/pages': '/_pages',
		'src/util': '/_util',
	},
	alias: {
		$api: './src/api',
		$components: './src/components',
		$stores: './src/stores',
		$pages: './src/pages',
		$util: './src/util',
	},
};
