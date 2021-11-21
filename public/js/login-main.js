window.addEventListener('DOMContentLoaded', function () {
    // Get reference to relevant elements
    const checkLogin= document.getElementById('submitButton');
    const email = document.getElementById('emailInput');
    const password = document.getElementById('passwordInput');
    const showPassword = document.getElementById('showPass');

    if(showPassword.checked) {
        if (password.type === "password") {
          password.type = "text";
        } else {
          password.type = "password";
        }
    }

    checkLogin.onclick = function () {
      // To ensure login input is correct in the input is valid

      reEmail = new RegExp(`^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$`);
      rePassword = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$`);

      
        
      if (rePassword.test(password) && reEmail.test(email)) {
          if(email == "abc123@gmail.com" && password == "AbcedefG12"){
              alert("yay!");
          }
          else{
              alert("invalid email or password!");
          }
      }
      else{
          alert("invalid email or password!"+ email + password);
      }


    
    };
});


