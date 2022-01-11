window.addEventListener("DOMContentLoaded", function () {
  // Get reference to relevant elements
  const checkReset = document.getElementById("resetButton");
  const code = document.getElementById("codeInput");
  const useremail = document.getElementById("emailInput");
  const userpassword = document.getElementById("passwordInput");
  const showPassword = document.getElementById("showPass");
  const params = new URLSearchParams(window.location.search);

  showPassword.onclick = function () {
    if (userpassword.type === "password") {
      userpassword.type = "text";
    } else {
      userpassword.type = "password";
    }
  };

  checkReset.onclick = function () {
    let reEmail = new RegExp(`^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$`);
    let rePassword = new RegExp(`^.{8,}$`);

    if (
      !rePassword.test(userpassword.value) ||
      !reEmail.test(useremail.value)
    ) {
      new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: "Check your inputs!",
      }).show();
    } else {
      resetPass(useremail.value, code.value, userpassword.value)
        .then((response) => {
          if (response=="done") {
            new Noty({
                type: "success",
                layout: "topCenter",
                theme: "sunset",
                timeout: "6000",
                text: "Your password have been reset",
              }).show();
            setTimeout(()=>{
                window.location.href = "login.html"
            },6000)
          } else {
            new Noty({
              type: "error",
              layout: "topCenter",
              theme: "sunset",
              timeout: "6000",
              text: "Unable to reset password. Try again!",
            }).show();
          }
        })
        .catch((error) => {
          new Noty({
            type: "error",
            layout: "topCenter",
            theme: "sunset",
            timeout: "6000",
            text: JSON.parse(error.message).error,
          }).show();
        });
    }
  };
  code.value = params.get("code");
  useremail.value = params.get("email");
  useremail.disabled = true;
  code.disabled = true;
});
