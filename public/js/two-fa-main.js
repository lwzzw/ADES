window.addEventListener('DOMContentLoaded', function () {
    //When page is loaded, runs checkAuth function
    checkAuth();
    document.getElementById('googleAuthenticatorBtn').addEventListener('click', () => {
        document.getElementById('googleAuthenticatorBtn').disabled = true;
        getSecret().then(response => {
            document.getElementById(`authText`).innerHTML = 'Download Google Authenticator and scan the QR Code below. (QR Code will not be saved, please ensure that you have scanned it)' 
            document.getElementById('qr-code').src = response;
            document.getElementById('googleAuthenticatorBtn').disabled = false;
            let message = '2-FA Enabled !'
            showNotification('success', message);
            checkAuth();
        }).catch(error => {
            showNotification('error', error.message);
        });
    })
})

//Checks if the user has 2FA enabled.
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