import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import prettier from "eslint-plugin-prettier/recommended"

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, prettier, {
  languageOptions: {
    globals: {
      ...globals.node,
    },
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  rules: {
    "prettier/prettier": "error",
  },
  ignores: ["**/dist/**", "**/node_modules/**"],
})
