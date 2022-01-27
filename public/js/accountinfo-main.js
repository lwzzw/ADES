let username, email, phone
window.addEventListener('DOMContentLoaded', function () {
  document.getElementById('email').disabled = true
  if (localStorage.getItem('token')) {
    // Get user details
    getDetails()
  } else {
    showNotification('error', 'Your session has expired, please login again')
    disableFeatures()
  }
})

// function to get and display user details
function getDetails () {
  checkLogin().then(response => {
    // display user details
    username = document.getElementById('user-name').value = response.name
    email = document.getElementById('email').value = response.email
    phone = document.getElementById('phone').value = response.phone || null
    // check radio button depending on gender
    if (response.gender == 'M') {
      document.getElementById('male').checked = true
    } else if (response.gender == 'F') {
      document.getElementById('female').checked = true
    }

    // Save button listener
    saveInfoListener()
  }).catch(err => {
    console.log(err)
    // removes whole layout if user is not logged in
    disableFeatures()
    showNotification('error', err.message)
  })
}

// function to show notifications
function showNotification (type, message) {
  document.getElementById('saveInfo').disabled = false
  new Noty({
    type: type,
    layout: 'topCenter',
    theme: 'sunset',
    timeout: '3000',
    text: message
  }).show()
}

// To be executed when unauthorized user tries to access the website.
function disableFeatures () {
  document.querySelector('.whole-layout').remove()
}

function saveInfoListener () {
  document.getElementById('saveInfo').addEventListener('click', () => {
    document.getElementById('saveInfo').disabled = true
    try {
      // gets user input
      const usernameInput = document.getElementById('user-name').value
      const phoneInput = document.getElementById('phone').value

      if (document.getElementById('male').checked) {
        genderInput = document.getElementById('male').value
      } else if (document.getElementById('female').checked) {
        genderInput = document.getElementById('female').value
      }

      // save user details
      saveUserDetails(usernameInput, phoneInput, genderInput).then(response => {
        localStorage.setItem('token', response.token)
        showNotification('success', 'Personal Details Updated !')
      }).catch(err => {
        console.log(err)
        showNotification('error', err.message)
      })
    } catch (error) {
      showNotification('error', err.message)
    }
  })
}
