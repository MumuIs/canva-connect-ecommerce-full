import * as path from "path";
import * as TerserPlugin from "terser-webpack-plugin";
import type { Configuration } from "webpack";
import { DefinePlugin } from "webpack";

export function buildProdConfig({
  appEntry = path.join(__dirname, "src", "index.tsx"),
}: {
  appEntry?: string;
} = {}): Configuration {
  return {
    mode: "production",
    context: path.resolve(__dirname, "./"),
    entry: {
      app: appEntry,
    },
    target: "web",
    resolve: {
      alias: {
        styles: path.resolve(__dirname, "styles"),
        src: path.resolve(__dirname, "src"),
      },
      extensions: [".ts", ".tsx", ".js", ".css", ".svg", ".woff", ".woff2"],
    },
    infrastructureLogging: {
      level: "error",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: true,
              },
            },
            "postcss-loader",
          ],
        },
        {
          test: /\.(png|jpg|jpeg)$/i,
          type: "asset/inline",
        },
        {
          test: /\.(woff|woff2)$/,
          type: "asset/inline",
        },
        {
          test: /\.svg$/,
          oneOf: [
            {
              issuer: /\.[jt]sx?$/,
              resourceQuery: /react/, // *.svg?react
              use: ["@svgr/webpack", "url-loader"],
            },
            {
              type: "asset/resource",
              parser: {
                dataUrlCondition: {
                  maxSize: 200,
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          include: /node_modules/,
          use: [
            "style-loader",
            "css-loader",
            "postcss-loader",
          ],
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              ascii_only: true,
            },
          },
        }),
      ],
    },
    output: {
      filename: `bundle.js`,
      path: path.resolve(__dirname, "dist"),
      clean: true,
      publicPath: "/",
    },
    plugins: [
      new DefinePlugin({
        "process.env": JSON.stringify({
          BACKEND_URL: process.env.BACKEND_URL,
          BASE_CANVA_CONNECT_API_URL: process.env.BASE_CANVA_CONNECT_API_URL,
        }),
      }),
    ],
    devtool: false,
  };
}

export default buildProdConfig;
