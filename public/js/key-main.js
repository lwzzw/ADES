const { response } = require("express");

window.addEventListener('DOMContentLoaded', function () {
    checkLogin().then(response => {
        document.getElementById("login").innerHTML = "log out";
        document.getElementById("login").addEventListener("click", () => {
            localStorage.removeItem("token");
        })
    })
    .catch(err => {
        console.log(err);
    })
    // const getAllkeys = async () => {
    //     await getkeys().then(response => {
    //         for(var i = 0; i< response.length; i++){
    //             let string = `<li>${response[i].g_id}</li>`
    //         }
    //     })
    //     }

})