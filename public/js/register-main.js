const { response } = require("express");

window.addEventListener('DOMContentLoaded', function () {
  // Get reference to relevant elements
  const checkRegisterBtn = document.getElementById('submitButton');
  const username = document.getElementById('nameInput');
  const useremail = document.getElementById('emailInput');
  const userpassword = document.getElementById('passwordInput');
  const showPassword = document.getElementById('showPass');
  const usergender = document.getElementsByName('gender');
  const userphone = document.getElementById('phoneInput');

  showPassword.onclick = function () {
    if (password.type === "password") {
      password.type = "text";
    } else {
      password.type = "password";
    }
  }

  checkLoginBtn.onclick = function () {
    reEmail = new RegExp(`^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$`);
    rePassword = new RegExp(`^.{8,}$`);
    if (!rePassword.test(password.value) || !reEmail.test(email.value)) {
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: 'Check your email and password',
      }).show();
    } else {
        register(username, useremail, userpassword, usergender, userphone).then(response => {

            
        })
  }
}

})
