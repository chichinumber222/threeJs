export const mobileCheck = () => {
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|Opera Mini/i.test(navigator.userAgent)
}
