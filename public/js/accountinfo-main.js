let username, email, phone;
window.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem("token")) {
        //Get user details
        getDetails();
    } else {
        showNotification('error', 'Your session has expired, please login again');
        disableFeatures();
    }

})

//function to get and display user details
function getDetails() {
    checkLogin().then(response => {
        username = document.getElementById('user-name').value = response.name;
        email = document.getElementById('email').value = response.email;

        if (response.phone == null) {
            phone = document.getElementById('phone').value = '';
        } else {
            phone = document.getElementById('phone').value = response.phone;
        }

        if (response.gender == 'M') {
            document.getElementById('male').checked = true;
        } else if (response.gender == 'F') {
            document.getElementById('female').checked = true;
        }


        //Save button listener
        saveInfoListener();
    }).catch(err => {
        console.log(err);
        disableFeatures();
        showNotification('error', err.message);
    })
}

//function to show notifications
function showNotification(type, message) {
    new Noty({
        type: type,
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '3000',
        text: message,
    }).show();
}

//To be executed when unauthorized user tries to access the website.
function disableFeatures() {
    document.querySelector(".whole-layout").remove();
}

function saveInfoListener() {
    document.getElementById('saveInfo').addEventListener('click', () => {

        document.getElementById('saveInfo').disabled = true;
        //gets user input
        let usernameInput = document.getElementById('user-name').value;
        let emailInput = document.getElementById('email').value;
        let phoneInput = document.getElementById('phone').value;
        
        if (document.getElementById('male').checked) {
            genderInput = document.getElementById('male').value;
          } else if (document.getElementById('female').checked) {
            genderInput = document.getElementById('female').value;
          }

        //save user details
        saveUserDetails(usernameInput, emailInput, phoneInput, genderInput).then(response => {
            localStorage.setItem('token', response.token);
            showNotification('success', 'Personal Details Updated !');
            document.getElementById('saveInfo').disabled = false;
        }).catch(err => {
            console.log(err);
            showNotification('error', err.message);
        })
    })
}