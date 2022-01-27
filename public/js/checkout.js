// paypal render button
paypal
  .Buttons({
    createOrder: function () {
      // create order
      const headers = {
        'Content-Type': 'application/json'
      }
      if (localStorage.getItem('token')) {
        headers.Authorization = 'Bearer ' + localStorage.getItem('token')
      }
      return fetch('/order/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          uid: localStorage.getItem('uid')
        })
      })
        .then(res => {
          if (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
        })
        .then(({
          id
        }) => {
          return id
        })
        .catch(e => {
          console.error(e.error)
        })
    },
    onApprove: function (data, actions) {
      // after user approve the order
      console.log(data)
      return actions.order.capture().then(detail => {
        const headers = {
          'Content-Type': 'application/json'
        }
        if (localStorage.getItem('token')) {
          headers.Authorization = 'Bearer ' + localStorage.getItem('token')
        }
        return fetch('/order/save-order', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            detail,
            uid: localStorage.getItem('uid')
          })
        })
          .then(response => response.json())
          .then(result => {
            if (result.done) {
              new Noty({
                type: 'success',
                layout: 'topCenter',
                theme: 'sunset',
                timeout: '6000',
                text: 'Transaction done'
              })
                .on('onClose', () => {
                  window.location.href = '/orderhistory.html'
                })
                .show()
            } else {
              new Noty({
                type: 'error',
                layout: 'topCenter',
                theme: 'sunset',
                timeout: '10000',
                text: 'Transaction cancel'
              })
                .on('onClose', () => {
                  window.location.href = '/shoppingCart.html'
                })
                .show()
            }
          })
      }).catch(err => {
        new Noty({
          type: 'error',
          layout: 'topCenter',
          theme: 'sunset',
          timeout: '6000',
          text: err
        })
          .show()
      })
    },
    onError: function (err) {
      // if error
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: err
      })
        .show()
    }
  })
  .render('#paypal')
