window.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    document.getElementById('googleAuthenticatorBtn').addEventListener('click', () => {
        getSecret().then(response => {
            document.getElementById('qr-code').src = response
            document.getElementById(`authText`).innerHTML = 'Download Google Authenticator and scan the QR Code below. (QR Code will not be saved, please ensure that you have scanned it)' 
            checkAuth();
        }).catch(error => {
            new Noty({
                type: 'error',
                layout: 'topCenter',
                theme: 'sunset',
                timeout: '6000',
                text: 'Unknown error has occured, please try again later.',
              }).show();
        })
    })
})

function checkAuth() {
    authenticateSecretKey(localStorage.getItem('token')).then(enabledAuth => {
        if (enabledAuth.message != false) {
            document.getElementById(`googleAuthenticatorBtn`).innerHTML = 'renew'
        }
    })
}