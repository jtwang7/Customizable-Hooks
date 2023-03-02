// rollup.config.js
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import scss from "rollup-plugin-scss";
import json from "@rollup/plugin-json";
const { babel } = require("@rollup/plugin-babel");

const isProd = process.env.NODE_ENV === "production";

const babelOptions = {
  presets: ["@babel/preset-env"],
  extensions: [".js", ".jsx", ".ts", ".tsx", ".less"],
  exclude: "**/node_modules/**",
};

const options = {
  // 文件入口
  input: "src/index.ts",
  // 文件出口: 此处输出了 commonJS 和 ES 两种模块的打包结果
  output: [
    {
      file: "build/index.js",
      // file: packageJson.main, 
      format: "cjs",
    },
    {
      file: "build/index.esm.js",
      // file: packageJson.module, // 也可以在 package.json 中声明一个 module 自定义字段，通过 require('package.json') 引入
      format: "es",
    },
  ],
  // 常见插件注册
  plugins: [
    peerDepsExternal({ includeDependencies: !isProd }),
    resolve(),
    commonjs({ sourceMap: !isProd }),
    typescript({ useTsconfigDeclarationDir: true }),
    scss(),
    babel(babelOptions),
    json(),
  ],
};

export default options;