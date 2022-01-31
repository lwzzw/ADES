const params = new URLSearchParams(window.location.search)

//loading screen
function onReady(callback) {
  var intervalID = window.setInterval(checkReady, 1)

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
  const checkLoginBtn = document.getElementById('submitButton')
  const email = document.getElementById('emailInput')
  const password = document.getElementById('passwordInput')
  const showPassword = document.getElementById('showPass')
  const googlebutton = document.getElementById('googleButton')
  const loading = document.getElementById('loading')

    // if params contain query string code
    if (params.get('code')) {
      new Noty({
        type: 'success',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: 'Logging you in...'
      }).show()
      // getPaypal function is invoked to log/create user's account
      getPaypal(params.get('code'))
        .then((res) => {
          localStorage.setItem('token', res.token)
          window.history.pushState(
            {
              page: 'same'
            },
            'same page',
            '/index.html'
          )
          location.reload()
        })
        .catch((err) => {
          console.log(err)
          new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: err.message
          }).show()
        })
    }

  loading.style.display = 'none'
  uidGenerate()// generate the uid for public
  googlebutton.onclick = function () {
    window.location.href = '/authenticate/google/url'
    // googleLogin().then(response => {
    //   if (response) {
    //     localStorage.setItem('token', response)
    //     window.location.href = 'index.html'
    //   } else {
    //     new Noty({
    //       type: 'error',
    //       layout: 'topCenter',

    //       theme: 'sunset',
    //       timeout: '3000',
    //       text: 'Google Login has failed! Try again'
    //     }).show()
    //   }
    // }).catch(err => {
    //   console.log(err)
    //   new Noty({
    //     type: 'error',
    //     layout: 'topCenter',
    //     theme: 'sunset',
    //     timeout: '6000',
    //     text: 'Google Login has failed! Try again'
    //   }).show()
    // })
  }

  showPassword.onclick = function () {
    if (password.type === 'password') {
      password.type = 'text'
    } else {
      password.type = 'password'
    }
  }
  if (localStorage.getItem('token')) {
    checkLogin().then(response => {
      new Noty({
        type: 'success',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '3000',
        text: 'You have been login as ' + response.name
      }).on('close', () => {
        window.location.href = 'index.html'
      }).show()
    })
      .catch(err => {
        console.log(err)
      })
  }

  checkLoginBtn.onclick = async function () {
    checkLoginBtn.style.display = 'none'
    loading.style.display = 'inline'
    // To ensure login input is correct in the input is valid
    reEmail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    rePassword = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    const token = await grecaptcha.execute('6LczHDAeAAAAAPsiuOHlO3fBQHyORdNbxq9ipkzt', { action: 'login' }).then(token => token)
    if (!rePassword.test(password.value) || !reEmail.test(email.value)) {
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: 'Check your email and password'
      }).show()
      checkLoginBtn.style.display = 'inline'
      loading.style.display = 'none'
    } else {
      login(email.value, password.value, token).then(response => {
        if (!response.success && response.msg) {
          new Noty({
            type: 'alert',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '1000',
            text: response.msg
          }).show()
          checkLoginBtn.style.display = 'inline'
          loading.style.display = 'none'
        }
        // if login details is correct
        if (response.token) {
          localStorage.setItem('token', response.token)

          new Noty({
            type: 'success',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '1000',
            text: 'You have succesfully logged in'
          }).on('onClose', () => {
            window.location.href = 'index.html'
          }).show()
          checkLoginBtn.style.display = 'inline'
          loading.style.display = 'none'
         } else if (response.redirect)  {
            new Noty({
              type: 'success',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '1000',
              text: 'You have 2-FA enabled, please check your email'
            }).show()
            checkLoginBtn.style.display = 'inline'
            loading.style.display = 'none'
        } else {
          new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: 'Unable to login. Check your email and password'
          }).show()
          checkLoginBtn.style.display = 'inline'
          loading.style.display = 'none'
        }
      })
        .catch(err => {
          new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: err.message
          }).show()
          checkLoginBtn.style.display = 'inline'
          loading.style.display = 'none'
        })
    }
  }
})
