const check = require('validator');

const validationFn = {
    userInfoValidator: function (req, res, next) {
        //Regex to check for special characters
        checkUserInput = new RegExp(/^[\w\s]+$/);
        //Regex to check if the phone length is exactly 8
        checkPhoneLength = new RegExp(/^[89]\d{7}$/);
        //Sanitize user's input before allowing it to be passed into the database.
        if (checkUserInput.test(req.body.username) && (check.isNumeric(req.body.phone) && checkPhoneLength.test(req.body.phone))) {
            next();
        } else {
            res.status(400).json({error: 'validation failed, check your input.'})
        }
    },
    searchValdiator: function(req,res, next) {
        //Regex to check that only numbers and aphlabets only
        checkUserInput = new RegExp( /^[a-zA-Z0-9-]+$/);
        if (checkUserInput.test(req.body.input)) {
            next();
        } else {
            res.status(400).json({error: 'validation failed, check your input.'})
        }

    },
    supportformValidator: function(req, res, next){
        checkUserInput = new RegExp(/^[\w\s]+$/);
        checkUserEmail = new RegExp(`^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$`);
        if(checkUserInput.test(req.body.subject) && checkUserEmail.test(req.body.email) && checkUserInput.test(req.body.message)){
            next();
        }else {
            res.status(400).json({error: 'validation failed, check your input. Only alphabets and digits for subject and message!'})
        }
    },
    
    validateRegister: function (req, res, next) {

        var fullname = req.body.username;
        var email = req.body.email;
        var password = req.body.password;

        refullname = new RegExp(`^[a-zA-Z\s,']+$`);
        reEmail = new RegExp(`^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$`);
        rePassword = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$`);
    

        
        if (refullname.test(fullname) && rePassword.test(password) && reEmail.test(email)) {

            next();
        } else {

            res.status(500);
            res.send(`{"Message":"Error!!"}`);
            logger.error(`500 error ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        }
    },

};

module.exports = validationFn;