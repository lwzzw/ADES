window.addEventListener("DOMContentLoaded", function () {
  // Get reference to relevant elements
  const loading = document.getElementById("loading");
  const checkRegisterBtn = document.getElementById("submitButton");
  const username = document.getElementById("nameInput");
  const useremail = document.getElementById("emailInput");
  const userpassword = document.getElementById("passwordInput");
  const showPassword = document.getElementById("showPass");
  const userphone = document.getElementById("phoneInput");
  const userfemale = document.getElementById("female");
  const usermale = document.getElementById("male");
  const verifyBtn = document.getElementById("verifyEmail");
  const codeLayout = document.getElementById("codeLayout");
  const form = document.getElementById("form");
  const loadingText = document.getElementById("loadingText");
  ;
  let usergender = "";


  loading.style.visibility = 'hidden';
  showPassword.onclick = function () {
    if (userpassword.type === "password") {
      userpassword.type = "text";
    } else {
      userpassword.type = "password";
    }
  };

  verifyBtn.onclick = function () {
    verifyBtn.innerHTML = `<i class="fa fa-circle-o-notch fa-spin">`;
    if (!checkEmail(useremail.value)) {
      return new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: "Please enter correct email!",
      }).show();
    }
    verifyEmail(useremail.value).then((response) => {
      verifyBtn.innerHTML = 'Code Sent';
      if (response != "done") return;
      new Noty({
        type: "success",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: "Please check your email",
      }).show();
      let codeInput = `<input class="form-control" type="text" id="codeInput" placeholder="Code" required>`;

      codeLayout.innerHTML = codeInput;
    }).catch((error) => {
      console.log(error);
      new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: error.message,
      }).show();
      verifyBtn.innerHTML = 'Send Code Again'
    });
  };

  checkRegisterBtn.onclick = function () {
    const rePassword = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$`);
    const checkPhone = new RegExp(`[8|9]\d{7}|\[8|9]\d{7}|\\s[8|9]\d{7}`);
    const codeInput = document.getElementById("codeInput") || null;
    if (userfemale.checked) {
      usergender = userfemale.value;
    } else if (usermale.checked) {
      usergender = usermale.value;
    }
    if(userpassword.value == '' || useremail.value == '' || username.value == '' || userphone.value == ''){
      return new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: "Empty Input!",
      }).show();
    }
    if (
      !rePassword.test(userpassword.value) ||
      !checkEmail(useremail.value) ||
      !codeInput
    ) {
      let string = "all your inputs"
      if(!rePassword.test(userpassword.value) && checkEmail(useremail.value) && checkPhone.test(userphone.value)){
        string = "password format";
      }
      else if(!checkEmail(useremail.value) && rePassword.test(userpassword.value) && checkPhone.test(userphone.value)){
        string = "email format"
      }
      else if(!checkPhone.test(userphone.value) && checkEmail(useremail.value) && rePassword.test(userpassword.value)){
        string = "phone number format (8 digits exact starting with 8 or 9)"
      }
      else if(!codeInput && checkEmail(useremail.value) && rePassword.test(userpassword.test) && checkPhone.test(userphone.value)){
        string = "code";
      }
      new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: "Check your " + string ,
      }).show();
    } else {
      if (codeInput.value.length != 20) {
        return new Noty({
          type: "error",
          layout: "topCenter",
          theme: "sunset",
          timeout: "6000",
          text: "Please enter a valid code(the length should be 20)",
        }).show();
      }
      form.style.display = 'none';
      loadingText.innerHTML = 'creating account';
      loading.style.visibility = 'visible';
      register(
        username.value,
        useremail.value,
        userpassword.value,
        usergender,
        userphone.value,
        codeInput.value
      )
        .then((response) => {
          if (response) {
            localStorage.setItem("token", response);
            new Noty({
              type: "success",
              layout: "topCenter",
              theme: "sunset",
              timeout: "6000",
              text: "Successful register",
            })
              .on("onClose", () => {
                window.location.href = "index.html";
              })
              .show();
          } else {
            new Noty({
              type: "error",
              layout: "topCenter",
              theme: "sunset",
              timeout: "6000",
              text: "Unable To Register. Try again!",
            }).show();
            loading.style.visibility = 'hidden';
            form.style.display = 'inline';
          }
        })
        .catch((error) => {
          console.log(error);
          new Noty({
            type: "error",
            layout: "topCenter",
            theme: "sunset",
            timeout: "6000",
            text: "Unable To Register. Try again!",
          }).show();
          loading.style.visibility = 'hidden';
          form.style.display = 'inline';
        });
    }
  };
  function checkEmail(email) {
    let reEmail = new RegExp(
      `/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/`
    );
    return reEmail.test(email);
  }
});
