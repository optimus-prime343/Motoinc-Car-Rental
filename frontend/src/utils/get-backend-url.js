export const getBackendUrl = () => {
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000/api'
    : 'https://hidden-earth-49483.herokuapp.com/api'
}
