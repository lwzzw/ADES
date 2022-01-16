window.addEventListener('DOMContentLoaded', function () {
    //checks if the user is logged in
    if(localStorage.getItem("token")){ 
        checkLogin().then(response => {
            //button event listener
            authenticatorBtn();
            //if user is logged in, check if the user has 2-fa enabled
            checkAuth();
        }).catch(err => {
            showNotification('error', err.message)
            disableFeatures();
        })
    } else {
        showNotification('error', 'Your session has expired, please login again');
        disableFeatures();
    }
})

//Function to check if the user has 2FA enabled.
function checkAuth() {
    authenticateSecretKey(localStorage.getItem('token')).then(enabledAuth => {
        if (enabledAuth.message != false) {
            document.getElementById(`googleAuthenticatorBtn`).innerHTML = 'Renew 2FA'
        }
    }).catch(error => {
        showNotification('error', error.message);
    })
}

//Shows notification
function showNotification(type, message) {
    new Noty({
        type: type,
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: message,
      }).show();
}

//To be executed when unauthorized user tries to access the website.
function disableFeatures() {
    document.querySelector(".whole-layout").remove();
}

function authenticatorBtn() {
    //if button is clicked
    document.getElementById('googleAuthenticatorBtn').addEventListener('click', () => {
        //disabled button
        document.getElementById('googleAuthenticatorBtn').disabled = true;
        //gets authentication data 
        getSecret().then(response => {
            document.getElementById(`authText`).innerHTML = 'Download Google Authenticator and scan the QR Code below. (QR Code will not be saved, please ensure that you have scanned it)' 
            document.getElementById('qr-code').src = response;
            document.getElementById('googleAuthenticatorBtn').disabled = false;
            let message = '2-FA Enabled !';
            showNotification('success', message);
            //checkAuth update
            checkAuth();
        }).catch(error => {
            showNotification('error', error.message);
        });
    })
}