window.addEventListener("DOMContentLoaded", function () {
const useremail = document.getElementById('emailInput');
const subject = document.getElementById('subjectInput');
const message = document.getElementById('messageInput');
const submitButton = document.getElementById('submitButton');

submitButton.onclick = function(){
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
    }
}))

}
})
