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
  const myAccBtn = '<a href=\'dashboard.html\' >My Account</a>'
      document
          .getElementById('myAccount')
          .insertAdjacentHTML('beforeend', myAccBtn)
  const table = document.getElementById('rtable')
  getRequest().then((response) => {
    response.requests.forEach(requests => {
      let status1
      let value1
      let status2
      let value2
      if (requests.status == '1') {
        status1 = 'pending'
        value1 = 1
        status2 = 'done'
        value2 = 2
      } else if (requests.status == '2') {
        status1 = 'done'
        value1 = 2
        status2 = 'pending'
        value2 = 1
      }
      const string = `<tr>
         <td>${requests.request_id}</td>
         <td>${requests.email}</td>
         <td>${requests.subject}</td>
         <td>${requests.message}</td>
         <td><select name="status" id="statuses-${requests.request_id}">
         <option value="${value1}">${status1}</option>
         <option value="${value2}">${status2}</option></select></td>
         <td><button id="updateBtn" onclick="update('${requests.request_id}', document.getElementById('statuses-${requests.request_id}').value)">Update</button></td>
         </tr>`
      table.insertAdjacentHTML('beforeend', string)
    })
  })
})
function update (requestid, reqstatus) {
  updateRequest(requestid, reqstatus).then((response) => {
    if (response === 1) {
      new Noty({
        type: 'success',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '1000',
        text: 'You have succesfully updated ' + requestid
      }).show()
    } else {
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: 'Failure to update. Try again'
      }).show()
    }
  }).catch(err => {
    new Noty({
      type: 'error',
      layout: 'topCenter',
      theme: 'sunset',
      timeout: '6000',
      text: err.message
    }).show()
  })
}
