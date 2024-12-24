import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"


export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "semi": ["error", "never"],
      "indent": ["error", 2, { "SwitchCase": 1 }],
    }
  },
  { ignores: ['webpack.config.js', 'tsconfig.json', 'dist/**', 'node_modules/**', 'src/shaders/**'] }
]

