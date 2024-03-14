module.exports = {
  '*.{ts,tsx}': (filenames) => [
    `eslint --no-error-on-unmatched-pattern ${filenames.join(' ')}; echo "ESLint completed with exit code $?"`,
    `prettier --write ${filenames.join(' ')}`
  ]
}
