module.exports = {
  "presets": ["@babel/env", "@babel/typescript"],
  "plugins": [
    "@babel/plugin-proposal-numeric-separator",
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
    ["module-resolver", {
      "root": ["./src"],
      "alias": {
        "^@/(.+)": "./src/\\1"
      }
    }]
  ]
}
