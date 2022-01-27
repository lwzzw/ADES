window.addEventListener("DOMContentLoaded", function () {
  // Get reference to relevant elements
  const sendMail = document.getElementById("2faMail");
  const useremail = document.getElementById("emailInput");

  sendMail.onclick = function () {
    //email regex
    let reEmail = new RegExp(
      `^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$`
    );
    //Check email input
    if (!reEmail.test(useremail.value)) {
      new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: "Please verify that your email is correct !",
      }).show();
    } else {
      //sends the 2-fa reset link email
      requestReset2FA(useremail.value)
        .then((response) => {
          if (response == "done") {
            new Noty({
              type: "success",
              layout: "topCenter",
              theme: "sunset",
              timeout: "22000",
              text: "Email sent !, Check your email and click on the link to reset your authenticator.",
            })
              .on("onClose", () => {
                window.location.href = "login.html";
              })
              .show();
          } else {
            new Noty({
              type: "error",
              layout: "topCenter",
              theme: "sunset",
              timeout: "6000",
              text: "Unable to reset the authenticator. Try again!",
            }).show();
          }
        })
        .catch((error) => {
          new Noty({
            type: "error",
            layout: "topCenter",
            theme: "sunset",
            timeout: "6000",
            text: error.message
          }).show();
        });
    }
  };
});
