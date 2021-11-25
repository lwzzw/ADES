window.addEventListener('DOMContentLoaded', function () {
  // Get reference to relevant elements
  const checkLoginBtn = document.getElementById('submitButton');
  const email = document.getElementById('emailInput');
  const password = document.getElementById('passwordInput');
  const showPassword = document.getElementById('showPass');
  uidGenerate();

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
    setTimeout(() => {
      window.location.href = "index.html";
    }, 3000);
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
          console.log(response)
          if (response) {
            localStorage.setItem('token', response);
            window.location.href = "index.html";
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


async function uidGenerate() {
  if (!localStorage.getItem("uid")) {
    const uid = await biri();
    localStorage.setItem("uid", uid);
  }
}