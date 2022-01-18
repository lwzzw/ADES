
window.addEventListener('DOMContentLoaded', function () {
  // Get reference to relevant elements
  const checkLoginBtn = document.getElementById('submitButton');
  const email = document.getElementById('emailInput');
  const password = document.getElementById('passwordInput');
  const showPassword = document.getElementById('showPass');
  const googlebutton = document.getElementById('googleButton');
  const secretValidator = new RegExp(/^[0-9]{6}$/);
  const secretCode = document.getElementById('secretInput');
  $("#secretDiv")[0].style.display = "none";
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
      login(email.value, password.value).then(response => {
        // if login details is correct
        if (response) {
          //check if user has 2-FA enabled
          authenticateSecretKey(response).then(enabledAuth => {
            //if 2-FA not enabled, proceed as normal
            if (enabledAuth.message == false) {
              localStorage.setItem('token', response);
              window.location.href = "index.html";
            } else {
              // if 2-FA is enabled, prompt user for secret key
              
              //checks if userInput is 6 digits
              if (secretValidator.test(secretCode.value)) {
                // check if user's entered secret code is correct
                validateSecretKey(secretCode.value, enabledAuth).then(authenticatorResult => {
                  //if secret code is correct, proceed
                  if (authenticatorResult == 'True') {
                    localStorage.setItem('token', response);
                    //window.location.href = "index.html";
                  } else {
                    throw new Error('Wrong Secret Code, Try again.');
                  }
                }).catch(error => {
                  console.log(error);
                  throw new Error(error);
                })
              } else {
                throw new Error('Please enter 6-digits only');
              }
            }
          }).catch(error => {
            new Noty({
              type: 'error',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '6000',
              text: error.message,
            }).show();
          })
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


