const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production', // or 'production'
    entry: './src/scripts/app.cjs',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'src/dist'),
        publicPath: 'src/dist/',
    },
    devServer: {
        contentBase: path.join(__dirname, 'src/'), // Your public directory
        port: 3000,
        hot: true, // Enable HMR
    },
};