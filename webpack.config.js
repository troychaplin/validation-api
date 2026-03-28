const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry,
		'validation-api': [path.resolve(__dirname, 'src/script.js')],
	},
	output: {
		...defaultConfig.output,
		path: path.resolve(__dirname, 'build'),
		filename: '[name].js',
	},
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...defaultConfig.resolve.alias,
			'@': path.resolve(__dirname, 'src/'),
			'@editor': path.resolve(__dirname, 'src/editor/'),
			'@shared': path.resolve(__dirname, 'src/shared/'),
		},
	},
};
