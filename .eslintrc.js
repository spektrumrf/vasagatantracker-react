module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "browser": true
    },
    "parser": "@babel/eslint-parser",
    "parserOptions": {
      "requireConfigFile": false,
      "babelOptions": {
        "presets": ["@babel/preset-react"]
      }
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "eqeqeq": "error",
        "no-trailing-spaces": "error",
        "object-curly-spacing": [
            "error", "always"
        ],
        "arrow-spacing": [
            "error", { "before": true, "after": true }
        ],
        "no-console": 0
    },
    "globals": {
        "test": true,
        "expect": true,
        "describe": true,
        "beforeAll": true,
        "afterAll": true
    }
};