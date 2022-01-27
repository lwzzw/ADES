window.addEventListener('DOMContentLoaded', function () {

  // checks if the user is logged in
  if (localStorage.getItem('token')) {
    checkLogin().then(response => {
      if (response) {
        getKeys().then(keys => {
          let string = ''
          for (let i = 0; i < keys.length; i++) {
            string += `
                <li>
                    <div class="individual-key">
                        <div>Game Name:</h6> ${keys[i].g_name}</div>
                        <div>Steam Key:</h6> ${keys[i].key}</div>
                    </div>
                    <br><br>
                    </li>`
          }
          if (keys.length > 0) {
            document.getElementById('nokeys').remove()
            document.getElementById('keys').insertAdjacentHTML('beforeend', string)
          }
        }).catch(err => {
          showNotification('error', err.message)
        })
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
function showNotification(type, message) {
  new Noty({
    type: type,
    layout: 'topCenter',
    theme: 'sunset',
    timeout: '6000',
    text: message
  }).show()
}

function disableFeatures() {
  document.querySelector('.whole-layout').remove()
}