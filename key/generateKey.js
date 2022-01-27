module.exports = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'// generate the key from these characters
  const charactersLength = characters.length
  let string = ''
  for (let i = 0; i < length; i++) {
    string += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return string
}
