module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/airbnb", "prettier"],
  plugins: ["prettier"],
  parserOptions: {
    parser: "babel-eslint"
  },
  rules: {
    "prettier/prettier": ["error"],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    camelcase: "off",
    "no-plusplus": "off"
  }
};
