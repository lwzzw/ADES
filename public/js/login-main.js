const validator = require('validator');

let $loginFormContainer = $('#loginFormContainer');
if ($loginFormContainer.length != 0) {
    console.log('Login form detected. Binding event handling logic to form elements.');
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit registration details
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function(event) {
        event.preventDefault();

        // const baseUrl = 'https://localhost:5000';
        const baseUrl = '';
        let email = $('#emailInput').val();
        let password = $('#passwordInput').val();
        let webFormData = new FormData();
        webFormData.append('email', email);
        webFormData.append('password', password);
        reEmail = new RegExp(`^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$`);
        rePassword = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$`);
    
        if (rePassword.test(password) && reEmail.test(email)) {
            
        } else {
            alert("Invalid Email or Password. Try again");
            $('#emailInput').val() = '';
            $('#passwordInput').val() = '';
        }
    });

} //End of checking for $loginFormContainer jQuery object