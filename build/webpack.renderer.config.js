const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push(
  { test: /\.css$/i, use: ["style-loader", "css-loader"] },
  {
    test: /\.ts$/i,
    use: ["ts-loader", "@aurelia/webpack-loader"],
    exclude: /node_modules/,
  },
  {
    test: /\.html$/i,
    use: "@aurelia/webpack-loader",
    exclude: /node_modules/,
  }
);

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".css", ".json"],
  },
};
