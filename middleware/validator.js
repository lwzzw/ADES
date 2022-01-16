const check = require('validator');

const validationFn = {
    userInfoValidator: function (req, res, next) {
        //Regex to check for special characters
        checkUserInput = new RegExp(/^[\w\s]+$/);
        //Regex to check if the phone length is exactly 8
        checkPhoneLength = new RegExp(/^[0-9]{8}$/);
        //Sanitize user's input before allowing it to be passed into the database.
        if (check.isEmail(req.body.email) && checkUserInput.test(req.body.username) && (check.isNumeric(req.body.phone) && checkPhoneLength.test(req.body.phone))) {
            next();
        } else {
            res.status(400).json({error: 'validation failed, check your input.'})
        }
    },

};

module.exports = validationFn;