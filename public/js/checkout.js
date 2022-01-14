paypal
    .Buttons({
        createOrder: function () {
            let headers = {
                "Content-Type": "application/json",
            }
            if (localStorage.getItem("token")) {
                headers.Authorization = "Bearer " + localStorage.getItem("token")
            }
            return fetch("/order/create-order", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        uid: localStorage.getItem("uid")
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
            console.log(data)
            return actions.order.capture().then(detail => {
                let headers = {
                    "Content-Type": "application/json",
                }
                if (localStorage.getItem("token")) {
                    headers.Authorization = "Bearer " + localStorage.getItem("token")
                }
                return fetch("/order/save-order", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({
                            detail,
                            uid: localStorage.getItem("uid")
                        }),
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.done) {
                            // alert("Transaction done");
                            new Noty({
                                type: "success",
                                layout: "topCenter",
                                theme: "sunset",
                                timeout: "6000",
                                text: "Transaction done",
                              })
                                .on("onClose", () => {
                                  window.location.href = "/orderhistory.html";
                                })
                                .show();
                        } else {
                            // alert("Transaction cancel");
                            new Noty({
                                type: "error",
                                layout: "topCenter",
                                theme: "sunset",
                                timeout: "10000",
                                text: "Transaction cancel",
                              })
                                .on("onClose", () => {
                                  window.location.href = "/shoppingCart.html";
                                })
                                .show();
                        }
                    })
            }).catch(err => {
                // alert(err);
                new Noty({
                    type: "error",
                    layout: "topCenter",
                    theme: "sunset",
                    timeout: "6000",
                    text: err,
                  })
                    .show();
            })
        },
        onError: function (err) {
            // alert(err);
            new Noty({
                type: "error",
                layout: "topCenter",
                theme: "sunset",
                timeout: "6000",
                text: err
              })
                .show();
        }
    })
    .render("#paypal")