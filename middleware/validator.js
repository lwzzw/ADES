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
        checkUserEmail = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$/);
        if(checkUserInput.test(req.body.subject) && checkUserEmail.test(req.body.email) && checkUserInput.test(req.body.message)){
            next();
        }else {
            res.status(400).json({error: 'validation failed, check your input. Only alphabets and digits for subject and message!'})
        }
    },
    
    validateRegister: function (req, res, next) {

        refullname = new RegExp(/^[a-zA-Z\s,']+$/);
        reEmail = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/);
        rePassword = new RegExp(/^(?=.[A-Za-z])(?=.\d)[A-Za-z\d]{8,}$/);
        rePhone = new RegExp(/[8|9]\d{7}|\[8|9]\d{7}|\\s[8|9]\d{7}/);
        
        if (refullname.test(req.body.username) && rePassword.test(req.body.userpassword) && reEmail.test(req.body.useremail) && rePhone.test(req.body.userphone)) {

            next();
        } else {

            res.status(500);
            res.send(`{"Message":"Error!! "}`);
        }
    },

    verifyemail : function(req, res,next){
        reEmail = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/);
                
        if (reEmail.test(req.body.email)) {

            next();
        } else {
            res.status(400).json({error: 'validation failed, check your email.'})
        }
    },

    verifypassword : function(req,res, next){
        rePassword = new RegExp(/^(?=.[A-Za-z])(?=.\d)[A-Za-z\d]{8,}$/);
        reEmail = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/);

        if (rePassword.test(req.body.password) && reEmail.test(req.body.email) ) {

            next();
        } else {
            res.status(400).json({error: 'validation failed, check your password.'})
        }
    },
    verifylogin: function(req, res, next){
        rePassword = new RegExp(/^(?=.[A-Za-z])(?=.\d)[A-Za-z\d]{8,}$/);

        if (rePassword.test(req.body.password)) {

            next();
        } else {
            res.status(400).json({error: 'validation failed, check your password.'})
        }
    }

};

module.exports = validationFn;