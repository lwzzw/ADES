window.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById('rtable');
  getRequest().then((response) => {
    response.requests.forEach(requests => {
        let status1;
        let value1;
        let status2;
        let value2;
        let selected;
        if(requests.status == '1'){
            status1 = 'pending'
            value1 = 1
            status2 = 'done'
            value2 = 2
        }
        else if(request.status == '2'){
            status1 = 'done'
            value1 = 2
            status2 = 'pending'
            value2 = 1
        }
          let string = `<tr>
         <td>${requests.request_id}</td>
         <td>${requests.email}</td>
         <td>${requests.subject}</td>
         <td>${requests.message}</td>
         <td><select name="status" id="statuses" onChange="${selected = this}">
         <option value="${value1}">${status1}</option>
         <option value="${value2}">${status2}</option></select></td>
         <td><button id="updateBtn" onclick="update(${requests.request_id, selected})">Update</button></td>
         </tr>`
         table.insertAdjacentHTML("beforeend", string);
     })
  })

 function update(requestid, reqstatus){
      updateRequest(requestid, reqstatus).then((response)=>{
          if(response){
              new Noty({
                type: 'success',
                layout: 'topCenter',
                theme: 'sunset',
                timeout: '1000',
                text: 'You have succesfully updated' + response.result[0].request_id
          })
        }
        else{
            new Noty({
                type: 'error',
                layout: 'topCenter',
                theme: 'sunset',
                timeout: '6000',
                text: 'Failure to update. Try again'
        })
    }
  }) .catch(err => {
    new Noty({
      type: 'error',
      layout: 'topCenter',
      theme: 'sunset',
      timeout: '6000',
      text: err.message,
    }).show();
  })
}

})
