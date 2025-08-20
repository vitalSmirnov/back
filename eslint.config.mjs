import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ["next", "prettier"],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "prettier/prettier": ["error"],
      "no-debugger": "warn",
      "import/newline-after-import": "warn",
      "no-console": "warn",
      "linebreak-style": "off",
      "quotes": ["error", "single"],
      "end-of-line": "lf",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "default-case": "error",
    },
  }),
]

export default eslintConfig
