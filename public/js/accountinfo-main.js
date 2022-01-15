let username, email, phone;
window.addEventListener('DOMContentLoaded', function () {
    //Get user details
    getDetails();

    document.getElementById('saveInfo').addEventListener('click', () => {
        document.getElementById('saveInfo').disabled = true;
        //gets user input
        let usernameInput = document.getElementById('user-name').value;
        let emailInput = document.getElementById('email').value;
        let phoneInput = document.getElementById('phone').value;
        //save user details
        saveUserDetails(usernameInput, emailInput, phoneInput).then(response => {
            localStorage.setItem('token', response.token);
            showNotification('success', 'Personal Details Updated !');
        }).catch(err => {
            console.log(err);
            showNotification('error', err.message);
        }).finally (()=> {
            document.getElementById('saveInfo').disabled = false;
            getDetails();
        })
    })
})

//function to get user details
function getDetails() {
    checkLogin().then(response => {
        username = document.getElementById('user-name').value = response.name;
        email = document.getElementById('email').value = response.email;
        phone = document.getElementById('phone').value = response.phone;
    }).catch(err => {
        console.log(err);
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