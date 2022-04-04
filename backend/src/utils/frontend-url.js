export const frontendUrl = path => {
  return `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}${path}`
}
