const {override} = require('customize-cra');
const cspHtmlWebpackPlugin = require("csp-html-webpack-plugin");

const cspConfigPolicy = {
    "default-src":  ['*  data: blob: filesystem: about: ws: wss:', "'unsafe-inline'", "'unsafe-eval'", "'unsafe-dynamic'"],
    "script-src": ['* data: blob:', "'unsafe-inline'", "'unsafe-eval'"],
    "connect-src": ['* data: blob:', "'unsafe-inline'"],
    "img-src": ['* data: blob:', "'unsafe-inline'"],
    "frame-src": ['* data: blob:'],
    "style-src": ['* data: blob:', "'unsafe-inline'"],
    "font-src": ['* data: blob:', "'unsafe-inline'"]
};

function addCspHtmlWebpackPlugin(config) {
    if(process.env.NODE_ENV === 'production') {
        config.plugins.push(new cspHtmlWebpackPlugin(cspConfigPolicy));
    }

    return config;
}

module.exports = {
    webpack: override(addCspHtmlWebpackPlugin),
};