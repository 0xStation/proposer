module.exports = {
  extends: [require.resolve("@blitzjs/next/eslint")],
  rules: {
    "@next/next/no-img-element": "off",
    "react-hooks/exhaustive-deps": "off",
    "@typescript-eslint/no-floating-promises": "off",
  },
}
