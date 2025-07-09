const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = [
  {
    ignores: ["public/assets/**"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser
      }
    }
  },
  pluginJs.configs.recommended,
  {
    files: ["tests/**/*.js", "**/*.test.js", "**/*.spec.js", "jest.setup.js", "**/jest.setup.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        global: "writable",
        require: "readonly",
        process: "readonly",
        jest: "readonly"
      },
    },
  },
  {
    rules: {
      // Add your custom rules here
    }
  }
];