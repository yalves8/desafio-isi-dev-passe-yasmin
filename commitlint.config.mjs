/** Conventional Commits puro, sem prefixo de ticket: feat(bookings): bloqueia reservas sobrepostas */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'kebab-case'],
  },
}
