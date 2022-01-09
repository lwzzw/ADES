
//all function that will use in front end
function register(username, useremail, userpassword, usergender, userphone){
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = {
        username: username,
        useremail: useremail,
        userpassword : userpassword,
        usergender: usergender,
        userphone : userphone
    }
    return axios
    .post(`/user/register`, body, methods)
    .then(response => {
        return response.data.token;
    })
    .catch(error => {
        if (error.response) {
            throw new Error(JSON.stringify(error.response.data))
        }
        return error.response.data
    })
}

function login(email, password) {
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = {
        email: email,
        password: password
    }
    return axios
        .post(`/user/login`, body, methods)
        .then(response => {
            return response.data.token;
        })
        .catch(error => {
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getAllCategories() {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/category/getAllCategories`, methods)
        .then(response => {
            return response.data.categories
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getDeals(params) {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/getDeals/${params ? params : ''}`, methods)
        .then(response => {
            return response.data.deals
        })
        .catch(error => {
            console.log(error)
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getBestsellers() {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/getBSellers/`, methods)
        .then(response => {
            return response.data.bsellers
        })
        .catch(error => {
            console.log(error)
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getPreOrders() {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/getPreorders`, methods)
        .then(response => {
            return response.data.preorders
        })
        .catch(error => {
            console.log(error)
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getLRelease() {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/getLRelease`, methods)
        .then(response => {
            return response.data.lrelease
        })
        .catch(error => {
            console.log(error)
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getGame(params) {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/gameDetailById/${params}`, methods)
        .then(response => {
            return response.data.game
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getGames(params) {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/gameDetailFilter?${params || ""}`, methods)
        .then(response => {
            return response.data.games
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getCategoryCount(maincat) {
    // if(!maincat)rejects;
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/category/countOfGame/${maincat}`, methods)
        .then(response => {
            return response.data.count
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function checkLogin() {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    return axios
        .get(`/user/checkLogin`, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getShoppingCart() {
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (localStorage.getItem("token")) {
        methods.headers.Authorization = "Bearer " + localStorage.getItem("token")
    }
    const body = {
        uid: localStorage.getItem("uid")
    }
    return axios
        .post(`/cart/getShoppingCart`, body, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function addShoppingCart(cart, edit) {
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (localStorage.getItem("token")) {
        methods.headers.Authorization = "Bearer " + localStorage.getItem("token")
    }
    const body = {
        uid: localStorage.getItem("uid"),
        cart: cart,
        edit
    }
    return axios
        .post(`/cart/editShoppingCart`, body, methods)
        .then(response => {
            return true
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function deleteCart(id) {
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (localStorage.getItem("token")) {
        methods.headers.Authorization = "Bearer " + localStorage.getItem("token")
    }
    let cart = {
        id,
        amount: 0
    }
    const body = {
        uid: localStorage.getItem("uid"),
        cart: [cart],
        edit: false
    }
    return axios
        .post(`/cart/editShoppingCart`, body, methods)
        .then(response => {
            return true
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

async function getOrderID() {
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (localStorage.getItem("token")) {
        methods.headers.Authorization = "Bearer " + localStorage.getItem("token")
    }
    const body = {
        uid: localStorage.getItem("uid")
    }
    return axios
        .post(`/order/orderHistory`, body, methods)
        .then(response => {
            return response.data.orderhistory
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function getOrderDetailsByID(oid) {
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = {
        uid: localStorage.getItem("uid"),
        oid: oid
    }
    return axios
        .post(`/order/orderDetails`, body, methods)
        .then(response => {
            return response.data.orderdetails
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

async function uidGenerate() {
    //if unique id does not exists generate a new id
    if (!localStorage.getItem("uid")) {
        const uid = await biri();
        localStorage.setItem("uid", uid);
    }
}

//GET secret key for authentication
function getSecret() {
    //checks if user is logged in, then gets userDetails which contains name and id
    return checkLogin().then(userDetails => {
        if (userDetails) {
            var options = {
                method: 'GET',
                url: 'https://google-authenticator.p.rapidapi.com/new_v2/',
                headers: {
                    'x-rapidapi-host': 'google-authenticator.p.rapidapi.com',
                    'x-rapidapi-key': 'a7cc9771dbmshdb30f345bae847ep1fb8d8jsn5d90b789d2ea'
                }
            };
            //sends GET request to google-authenticator API and gets secret key
            return axios
                .request(options)
                .then(function (secret) {
                    //after getting the secret key, the secret key is saved into the database
                    return saveSecret(userDetails, secret.data).then(response => {
                        return response;
                    });
                })
                .catch(function (error) {
                    if (error.response) {
                        throw new Error(JSON.stringify(error.response.data))
                    }
                    return error.response.data
                });
        }
    }).catch(error => {
        console.log(error.message)
        if (error) {
            throw new Error(JSON.stringify(error.message))
        }
        return error.message
    })

}

//GET QR Code for user to scan
function getQRCode(secretKey, userDetails) {
    const userName = userDetails.name;
    var options = {
        method: 'GET',
        url: 'https://google-authenticator.p.rapidapi.com/enroll/',
        params: { secret: secretKey, account: 'F2A', issuer: userName },
        headers: {
            'x-rapidapi-host': 'google-authenticator.p.rapidapi.com',
            'x-rapidapi-key': 'a7cc9771dbmshdb30f345bae847ep1fb8d8jsn5d90b789d2ea'
        }
    };
    //sends GET request to google-authenticatator api with the user's name and secretkey that is stored inside the database
    return axios
        .request(options)
        .then(function (response) {
            return response.data;
        }).catch(function (error) {
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        });
}

//Upload user's secret key to database
function saveSecret(userDetails, secretKey) {
    const userID = userDetails.id;
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const body = {
        uid: userID,
        secretkey: secretKey
    };
    return axios
        .post(`/twofa/secretDetail`, body, methods)
        .then(response => {
            //After saving user's secretkey into the database succesfully, getQRCode will be invoked
            if (response.status == 200) {
                return getQRCode(secretKey, userDetails);
            } else {
                return response.data;
            }
        })
        .catch(error => {
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data));
            }
            return error.response.data;
        })
}

//GET user's secret key if it exists
function authenticateSecretKey(token) {
    const methods = {
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/twofa/getSecret`, methods)
        .then(response => {
            console.log(response);
            return response.data;
        }).catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data));
            }
            return error.response.data;
        })
}

//validate user input secret code
function validateSecretKey(secretCodeInput, secretKey) {
    var options = {
        method: 'GET',
        url: 'https://google-authenticator.p.rapidapi.com/validate/',
        params: { code: secretCodeInput, secret: secretKey },
        headers: {
            'x-rapidapi-host': 'google-authenticator.p.rapidapi.com',
            'x-rapidapi-key': 'a7cc9771dbmshdb30f345bae847ep1fb8d8jsn5d90b789d2ea'
        }
    };
    return axios.request(options).then(function (response) {
        console.log(response.data);
        return response.data;
    }).catch(function (error) {
        if (error.response) {
            throw new Error(JSON.stringify(error.response.data))
        }
        return error.response.data
    });
}