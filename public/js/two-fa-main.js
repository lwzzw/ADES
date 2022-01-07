window.addEventListener('DOMContentLoaded', function () {
    document.getElementById('googleAuthenticatorBtn').addEventListener('click', () => {
        getSecret().then(response => {
            console.log(response)
            document.getElementById('qr-code').src = response
        })
    })
})

