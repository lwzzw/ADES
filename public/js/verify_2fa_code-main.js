window.addEventListener('DOMContentLoaded', function () {
    // Get reference to relevant elements
    const verifyBtn = document.getElementById('verifyBtn')
    const code = document.getElementById('codeInput')  
    const params = new URLSearchParams(window.location.search)

    verifyBtn.onclick = function () {
      const reEmail = new RegExp('^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$')
  
      if (!reEmail.test(params.get('email'))) {
        new Noty({
          type: 'error',
          layout: 'topCenter',
          theme: 'sunset',
          timeout: '6000',
          text: 'Wrong email!'
        })
      } else {
        verifyAuthCode(params.get('email'), code.value)
          .then((response) => {
            localStorage.setItem('token', response)
            new Noty({
              type: 'success',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '3000',
              text: 'Verified !'
            }).on('onClose', () => {
              window.location.href = 'index.html'
            })
            .show()
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
  