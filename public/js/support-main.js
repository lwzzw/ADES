window.addEventListener("DOMContentLoaded", function () {
const useremail = document.getElementById('emailInput');
const subject = document.getElementById('subjectInput');
const message = document.getElementById('messageInput');
const submitButton = document.getElementById('submitButton');
const loading = document.getElementById('loading');

loading.style.display = 'none';
submitButton.onclick = function(){
loading.style.display = 'inline';
submitButton.style.display = 'none';
supportRequest(useremail.value, subject.value, message.value).then((response => {
    if(response) {
        new Noty({
            type: 'success',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '3000',
            text: 'You have submitted a request',
          }).show();
     useremail.value = '';
     subject.value = '';
     message.value = '';
     loading.style.display = 'none';
     submitButton.style.display = 'inline';
    }
    else{
        new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: 'Submission failed. Try again!',
          }).show();
          useremail.value = '';
          subject.value = '';
          message.value = '';
          loading.style.display = 'none';
         submitButton.style.display = 'inline';
    }
})).catch(err => {
    new Noty({
      type: 'error',
      layout: 'topCenter',
      theme: 'sunset',
      timeout: '6000',
      text: err.message,
    }).show();
    useremail.value = '';
    subject.value = '';
    message.value = '';
    loading.style.display = 'none';
   submitButton.style.display = 'inline';
  })

}
})
