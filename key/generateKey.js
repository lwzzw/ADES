module.exports = (length) => {
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";//generate the key from these characters
  var charactersLength = characters.length;
  let string = "";
  for (var i = 0; i < length; i++) {
    string += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return string;
};
