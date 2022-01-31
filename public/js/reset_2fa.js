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
  // Get reference to relevant elements
  const sendMail = document.getElementById('2faMail')
  const useremail = document.getElementById('emailInput')

  sendMail.onclick = function () {
    // email regex
    const reEmail = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$/)

    // Check email input
    if (!reEmail.test(useremail.value)) {
      showNotification('error', 'Please verify that your email is correct!')
    } else {
      // sends the 2-fa reset link email
      requestReset2FA(useremail.value)
        .then((response) => {
          if (response == 'done') {
            new Noty({
              type: 'success',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '22000',
              text: 'Email sent ! Check your email and click on the link to reset your authenticator.'
            })
              .on('onClose', () => {
                window.location.href = 'login.html'
              })
              .show()
          } else {
            showNotification('error', 'Unable to reset the authenticator. Try again!')
          }
        })
        .catch((error) => {
          showNotification('error', error.message)
        })
    }
  }
})

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
