window.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    document.getElementById('googleAuthenticatorBtn').addEventListener('click', () => {
        getSecret().then(response => {
            document.getElementById(`authText`).innerHTML = 'Download Google Authenticator and scan the QR Code below. (QR Code will not be saved, please ensure that you have scanned it)' 
            document.getElementById('qr-code').src = response
            checkAuth();
        }).catch(error => {
            showNotification(error);
        })
    })
})

//Checks if the user has 2FA enabled.
function checkAuth() {
    authenticateSecretKey(localStorage.getItem('token')).then(enabledAuth => {
        if (enabledAuth.message != false) {
            document.getElementById(`googleAuthenticatorBtn`).innerHTML = 'Renew 2FA'
        }
    }).catch(error => {
        showNotification(error);
    })
}

//Shows notification
function showNotification(error) {
    new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: error.message,
      }).show();
}