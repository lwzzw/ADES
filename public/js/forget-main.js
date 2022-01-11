window.addEventListener("DOMContentLoaded", function () {
    // Get reference to relevant elements
    const sendMail = document.getElementById("sendMail");
    const useremail = document.getElementById("emailInput");

  
    sendMail.onclick = function () {
      let reEmail = new RegExp(`^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$`);
  
      if (
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
        sendVerifyCode(useremail.value)
          .then((response) => {
            if (response=="done") {
              new Noty({
                  type: "success",
                  layout: "topCenter",
                  theme: "sunset",
                  timeout: "20000",
                  text: "We have send you the reset password link via email, if the email did't exist please go to spam/junk email",
                }).show();
              setTimeout(()=>{
                window.location.href = "login.html"
              },22000)
            console.log((response));
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
  });
  