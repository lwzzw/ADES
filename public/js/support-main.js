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
  const useremail = document.getElementById('emailInput')
  const subject = document.getElementById('subjectInput')
  const message = document.getElementById('messageInput')
  const submitButton = document.getElementById('submitButton')
  const loading = document.getElementById('loading')

  if (localStorage.getItem('token')) {
    checkLogin().then(response => {
      if (response) {
        loading.style.display = 'none'
        submitButton.onclick = function () {
          loading.style.display = 'inline'
          submitButton.style.display = 'none'
          supportRequest(useremail.value, subject.value, message.value).then(response => {
            if (response) {
              showNotification('success', 'You have submitted a request')
              useremail.value = ''
              subject.value = ''
              message.value = ''
              loading.style.display = 'none'
              submitButton.style.display = 'inline'
            } else {
              showNotification('error', 'Submission failed. Try again!')
              useremail.value = ''
              subject.value = ''
              message.value = ''
              loading.style.display = 'none'
              submitButton.style.display = 'inline'
            }
          }).catch(err => {
            showNotification('error', err.message)
            useremail.value = ''
            subject.value = ''
            message.value = ''
            loading.style.display = 'none'
            submitButton.style.display = 'inline'
          })
        }
      }
    }).catch(err => {
      showNotification('error', err.message)
      disableFeatures()
    })
  } else {
    showNotification('error', 'Your session has expired, please login again')
    disableFeatures()
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

function disableFeatures () {
  document.querySelector('.whole-layout').remove()
}
