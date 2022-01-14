// const {queryString} = require("query-string");

window.addEventListener('DOMContentLoaded', function () {
  // Get reference to relevant elements
  const checkLoginBtn = document.getElementById('submitButton');
  const email = document.getElementById('emailInput');
  const password = document.getElementById('passwordInput');
  const showPassword = document.getElementById('showPass');
  const googlebutton = document.getElementById('googleButton');
  uidGenerate();


// const stringifiedParams = queryString.stringify({
//   client_id: process.env.GOOGLE_CLIENT_ID,
//   redirect_uri: 'https://www.example.com/authenticate/google',
//   scope: [
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile',
//   ].join(' '), // space seperated string
//   response_type: 'code',
//   access_type: 'offline',
//   prompt: 'consent',
// });
// const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;

// googlebutton.onclick() = function(){
//   window.location.href = googleLoginUrl;
// }

// const urlParams = queryString.parse(window.location.search);

// if (urlParams.error) {
//   console.log(`An error occurred: ${urlParams.error}`);

// } else {
//   console.log(`The code is: ${urlParams.code}`);
//   getAccessTokenFromCode(code).then( response => {
//     getGoogleUserInfo(response).then(response => {
//       if(response.id != null){
//         localStorage.setItem('uid', response.id);
//         window.location.href = "index.html";
//       }
//     }).catch(error => {
//       console.log(error)
//     })
//   }).catch(error => {
//                   console.log(error)
//                 })
// }

  showPassword.onclick = function () {
    if (password.type === "password") {
      password.type = "text";
    } else {
      password.type = "password";
    }
  }
  checkLogin().then(response => {
    new Noty({
      type: 'success',
      layout: 'topCenter',
      theme: 'sunset',
      timeout: '3000',
      text: 'You have been login as ' + response.name,
    }).show();
    // setTimeout(() => {
    //   window.location.href = "index.html";
    // }, 3000);
  })
  .catch(err => {
    console.log(err);
  })

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
                let secretCode = prompt('Enter Secret Code');
                // validate user's secret code
                validateSecretKey(secretCode, enabledAuth).then(authenticatorResult => {
                  //if secret code is correct, proceed
                  if (authenticatorResult == 'True') {
                    localStorage.setItem('token', response);
                    window.location.href = "index.html";
                  } else {
                    new Noty({
                      type: 'error',
                      layout: 'topCenter',
                      theme: 'sunset',
                      timeout: '6000',
                      text: 'Wrong secret code, please try again.',
                    }).show();
                  }
                }).catch(error => {
                  console.log(error)
                })
              }
            }).catch(error => {
              console.log(error)
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
