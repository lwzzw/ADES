const check = require('validator')
const axios = require('axios')

const validationFn = {
  validatePhoneNo: function (req, res, next) {
    // Regex to check if the phone format
    const checkPhoneLength = new RegExp(/^[689]\d{7}$/)
    // Sanitize user's input before allowing it to be passed into the database.
    if ((check.isNumeric(req.body.phone) && checkPhoneLength.test(req.body.phone))) {
      next()
    } else {
      res.status(400).json({ error: 'Invalid phone number, only 8 digit numbers allowed' })
    }
  },

  validateUsername: function (req, res, next) {
    // Regex to check for special characters
    const checkUserInput = new RegExp(/^[\w\s]+$/)
    //remove extra spacing/returns etc but retains the meaning of spaces.
    req.body.username = req.body.username.replace(/[\n\r\s\t]+/g, ' ')
    if (checkUserInput.test(req.body.username)) {
        next()
    } else {
        res.status(400).json({ error: 'Invalid name input.' })
    }
  },

  validateGender: function (req, res, next) {
    const checkGender = new RegExp(/^M$|^F$/)

    if (checkGender.test(req.body.gender)) {
        next()
    } else {
        res.status(400).json({ error: 'Invalid gender input.' })
    }
  },

  searchValdiator: function (req, res, next) {
    // Regex to check that only numbers and aphlabets only
    const checkUserInput = new RegExp(/^[a-zA-Z0-9-]+$/)
    if (checkUserInput.test(req.body.input)) {
      next()
    } else {
      res.status(400).json({ error: 'validation failed, check your input.' })
    }
  },
  supportformValidator: function (req, res, next) {
    const checkUserInput = new RegExp(/^[\w\s]+$/)
    const checkUserEmail = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$/)
    if (checkUserInput.test(req.body.subject) && checkUserEmail.test(req.body.email) && checkUserInput.test(req.body.message)) {
      next()
    } else {
      res.status(400).json({ error: 'validation failed, check your input. Only alphabets and digits for subject and message!' })
    }
  },

  validateRegister: function (req, res, next) {
    const refullname = new RegExp(/^[a-zA-Z\s,']+$/)
    const reEmail = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
    //At least one upper case letter, At least one lower case letter, At least one digit, At least one special character, Minimum eight in length .
    const rePassword = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    const rePhone = new RegExp(/[8|9]\d{7}|\[8|9]\d{7}|\\s[8|9]\d{7}/)

    if (refullname.test(req.body.username) && rePassword.test(req.body.userpassword) && reEmail.test(req.body.useremail) && rePhone.test(req.body.userphone)) {
      next()
    } else {
      res.status(500).json({ error: 'invalid registration details, please check your inputs.'})
    }
  },

  verifyemail: function (req, res, next) {
    const reEmail = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)

    if (reEmail.test(req.body.email)) {
      next()
    } else {
      res.status(400).json({ error: 'validation failed, invalid email.' })
    }
  },

  verifypassword: function (req, res, next) {
    //At least one upper case letter, At least one lower case letter, At least one digit, At least one special character, Minimum eight in length .
    const rePassword = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)

    if (rePassword.test(req.body.password)) {
      next()
    } else {
      res.status(400).json({ error: 'validation failed, invalid password.' })
    }
  },

  // Checks if the user's secret code is correct
    validateSecretKey: function (secretCodeInput, secretKey) {
    const options = {
      method: 'GET',
      url: 'https://google-authenticator.p.rapidapi.com/validate/',
      params: { code: secretCodeInput, secret: secretKey },
      headers: {
        'x-rapidapi-host': 'google-authenticator.p.rapidapi.com',
        'x-rapidapi-key': 'a7cc9771dbmshdb30f345bae847ep1fb8d8jsn5d90b789d2ea'
      }
    }
    // sends request to google authenticator API
    return axios
      .request(options)
      .then(function (response) {
        return response.data
      })
      .catch(function (error) {
        if (error.response) {
          throw new Error(JSON.stringify(error.response.data))
        }
        return error.response.data
      })
  }
  

}

module.exports = validationFn
