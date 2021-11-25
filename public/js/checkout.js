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
                            alert("Transaction done");
                            window.location.href = "/index.html";
                        } else {
                            alert("Transaction cancel");
                            window.location.href = "/shoppingCart.html";
                        }
                    })
            }).catch(err => {
                alert(err);
            })
        },
        onError: function (err) {
            alert(err);
        }
    })
    .render("#paypal")