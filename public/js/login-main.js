
window.addEventListener('DOMContentLoaded', function () {
    // Get reference to relevant elements
    const checkLogin= document.getElementById('submitButton');
    const email = document.getElementById('emailInput');
    const password = document.getElementById('passwordInput');
    const showPassword = document.getElementById('showPass');


    showPassword.onclick = function(){
      if (password.type === "password") {
        password.type = "text";
      } else {
        password.type = "password";
      }
    }

    checkLogin.onclick = function () {
      // To ensure login input is correct in the input is valid
      login(email.value, password.value).then(response => {
        if(response != 0){
         localStorage.setItem('user_id', response);
         window.location.replace('html/index.html');
        }
        else{
          new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: 'Unable to login. Check your email and password',
        }).show();
        }
      })

    
    };
});


