window.addEventListener('DOMContentLoaded', function () {
  // Get reference to relevant elements
  const checkRegisterBtn = document.getElementById('submitButton');
  const username = document.getElementById('nameInput');
  const useremail = document.getElementById('emailInput');
  const userpassword = document.getElementById('passwordInput');
  const showPassword = document.getElementById('showPass');
  const userphone = document.getElementById('phoneInput');
  const userfemale = document.getElementById('female');
  const usermale = document.getElementById('male');
  let usergender = '';

  showPassword.onclick = function () {
    if (userpassword.type === "password") {
      userpassword.type = "text";
    } else {
      userpassword.type = "password";
    }
  }

  checkRegisterBtn.onclick = function () {
    let reEmail = new RegExp(`^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$`);
    let rePassword = new RegExp(`^.{8,}$`);

    if(userfemale.checked){
        usergender = userfemale.value;
    }
    else if(usermale.checked){
        usergender = usermale.value; 
    }

    if (!rePassword.test(userpassword.value) || !reEmail.test(useremail.value)) {
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: 'Check your inputs!',
      }).show();
    } else {
        register(username.value, useremail.value, userpassword.value, usergender, userphone.value).then(response => {
            if(response){
                localStorage.setItem('token', response);
                window.location.href = "index.html";
            }else {
                new Noty({
                  type: 'error',
                  layout: 'topCenter',
                  theme: 'sunset',
                  timeout: '6000',
                  text: 'Unable To Register. Try again!',
                }).show();
              }
            }).catch(error => {
              console.log(error)
            })
  }
}

})
