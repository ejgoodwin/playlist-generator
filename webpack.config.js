const glob = require('glob');
const path = require('path');

module.exports = {
    entry: glob.sync("./src/js/*.js"),
    mode: 'development',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
};