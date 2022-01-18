
window.addEventListener('DOMContentLoaded', function () {
  // Get reference to relevant elements
  const checkLoginBtn = document.getElementById('submitButton');
  const email = document.getElementById('emailInput');
  const password = document.getElementById('passwordInput');
  const showPassword = document.getElementById('showPass');
  const googlebutton = document.getElementById('googleButton');
  const secretCodeInput = document.getElementById('secretInput')

  uidGenerate();
  if (window.location.href == "http://localhost:5000/authenticate/google") {
    googleLogin(code).then(response => {
      if (response) {
        localStorage.setItem('token', response);
        window.location.href = "index.html";
      }
      else {
        new Noty({
          type: 'error',
          layout: 'topCenter',

          theme: 'sunset',
          timeout: '3000',
          text: 'Google Login has failed! Try again',
        }).show();
      }
    }).catch(err => {
      console.log(err)
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: 'Google Login has failed! Try again',
      }).show();

    })
  }
  
  googlebutton.onclick = function () {
    window.location.href = '/authenticate/google/url';
    googleLogin().then(response => {
      if (response) {
        localStorage.setItem('token', response);
        window.location.href = "index.html";
      }
      else {
        new Noty({
          type: 'error',
          layout: 'topCenter',

          theme: 'sunset',
          timeout: '3000',
          text: 'Google Login has failed! Try again',
        }).show();
      }
    }).catch(err => {
      console.log(err)
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: 'Google Login has failed! Try again',
      }).show();

    })
  }


  showPassword.onclick = function () {
    if (password.type === "password") {
      password.type = "text";
    } else {
      password.type = "password";
    }
  }
  if(localStorage.getItem("token")){
    checkLogin().then(response => {
      new Noty({
        type: 'success',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '3000',
        text: 'You have been login as ' + response.name,
      }).on("close",()=>{
        window.location.href = "index.html";
      }).show();
      // setTimeout(() => {
      //   window.location.href = "index.html";
      // }, 3000);
    })
    .catch(err => {
      console.log(err);
    })
}

  checkLoginBtn.onclick = function () {
    // To ensure login input is correct in the input is valid
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
      login(email.value, password.value, secretCodeInput.value).then(response => {
        // if login details is correct
        if (response) {
          localStorage.setItem('token', response);
                    
          //check if user has 2-FA enabled
          new Noty({
            type: 'success',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '1000',
            text: 'You have succesfully logged in',
          }).on('onClose' ,() => {
            window.location.href = "index.html";
          }).show();
          console.log(response);
        } else {
          new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: 'Unable to login. Check your email and password',
          }).show();
        }
      }).then(res => {
        
      })
      .catch(err => {
          console.log(err)
          new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: 'Unable to login. Check your email and password',
          }).show();
        })
    }
  };
});


