//loading screen
function onReady(callback) {
  var intervalID = window.setInterval(checkReady, 1000)

  function checkReady() {
      if (document.getElementsByTagName('body')[0] !== undefined) {
          window.clearInterval(intervalID)
          callback.call(this)
      }
  }
}

function show(id, value) {
  document.getElementById(id).style.display = value ? 'block' : 'none'
}

onReady(function () {
  show('page', true)
  show('load', false)
})

window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('googleAuthenticatorBtn').disabled = true
  // checks if the user is logged in
  if (localStorage.getItem('token')) {
    checkLogin().then(response => {
      console.log(response)
      checkAuth()
      // button event listener
      document.getElementById('googleAuthenticatorBtn').addEventListener('click', () => {
        document.getElementById('googleAuthenticatorBtn').disabled = true
        document.getElementById('googleAuthenticatorBtn').innerHTML = 'Enabling'
        enable2FA().then(response => {
          showNotification('success', response)
          checkAuth()
        }).catch(err => {
          showNotification('error', err.message)
        })
      })
    }).catch(err => {
      showNotification('error', err.message)
      disableFeatures()
    })
  } else {
    showNotification('error', 'Your session has expired, please login again')
    disableFeatures()
  }
})

// Function to check if the user has 2FA enabled.
function checkAuth () {
  getAuth(localStorage.getItem('token')).then(enabledAuth => {
    console.log(enabledAuth)
    if (enabledAuth.message != false) {
      document.getElementById('authText').innerHTML = 'You have 2-fa enabled'
      document.getElementById('googleAuthenticatorBtn').disabled = true
      document.getElementById('googleAuthenticatorBtn').innerHTML = 'Enabled'
    } else {
      document.getElementById('googleAuthenticatorBtn').disabled = false
    }
  }).catch(error => {
    showNotification('error', error.message)
  })
}

// Shows notification
function showNotification (type, message) {
  new Noty({
    type: type,
    layout: 'topCenter',
    theme: 'sunset',
    timeout: '6000',
    text: message
  }).show()
}

// To be executed when unauthorized user tries to access the website.
function disableFeatures () {
  document.querySelector('.whole-layout').remove()
}