
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
  const sendMail = document.getElementById('sendMail')
  const useremail = document.getElementById('emailInput')

  sendMail.onclick = function () {
    const reEmail = new RegExp(
      '^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$'
    )

    if (!reEmail.test(useremail.value)) {
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: 'Please enter your correct email !'
      }).show()
    } else {
      // send the verify email
      sendVerifyCode(useremail.value)
        .then((response) => {
          if (response == 'done') {
            new Noty({
              type: 'success',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '22000',
              text: 'Email sent ! Please check your inbox/spam to reset your password.'
            })
              .on('onClose', () => {
                window.location.href = 'login.html'
              })
              .show()
            console.log(response)
          } else {
            new Noty({
              type: 'error',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '6000',
              text: 'Unable to reset password. Try again!'
            }).show()
          }
        })
        .catch((error) => {
          new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: JSON.parse(error.message).error
          }).show()
        })
    }
  }
})
