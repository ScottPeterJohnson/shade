const path = require('path');
const ClosurePlugin = require('closure-webpack-plugin');

module.exports = (env : any, argv : any) => ({
    entry: './src/shade.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    devtool: argv.mode != 'development' ? 'false' : 'inline-source-map',
    output: {
        filename: argv.mode != 'development' ? 'shade-bundle-min.js' : 'shade-bundle.js',
        path: path.resolve(__dirname, '../resources/js')
    }
});