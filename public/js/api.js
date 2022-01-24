//all function that will use in front end

function googleLogin() {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/authenticate/google`, methods)
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



function register(username, useremail, userpassword, usergender, userphone,code){
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
        userphone : userphone,
        code: code
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

function login(email, password, secretCode, token) {
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = {
        email,
        password,
        secretCode,
        captcha:token
    }
    return axios
        .post(`/user/login`, body, methods)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error);
            }
            return error.response.data.error;
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

//getBestsellers function gets fixed amount of products or unfixed amount depending on the params that is passed in.
function getBestsellers(params) {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/getBSellers/${params}`, methods)
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

//getPreOrders function gets fixed amount of products or unfixed amount depending on the params that is passed in.
function getPreOrders(params) {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/getPreorders/${params}`, methods)
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

function getCategoryCountByPlatform(platform) {
    // if(!maincat)rejects;
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/category/countOfGameByPlatform/${platform}`, methods)
        .then(response => {
            console.log(response.data);
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
    if(!localStorage.getItem("token"))return;
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
            // console.log(error);
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
                        console.log(response)
                        return response;
                    }).catch (err => {
                        throw new Error(err.message)
                    })
                })
                .catch(function (error) {
                    if (error) {
                        throw new Error(error)
                    }
                    return error
                });
        }
    }).catch(error => {
        if (error) {
            throw new Error(error.message)
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
                throw new Error(error.response.data.error);
            }
            return error.response.data.error;
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
            return response.data;
        }).catch(error => {
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data));
            }
            return error.response.data;
        })
}

function getPageCount(params){

    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/gameDetailFilterPageCount?${params || ""}`, methods)
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

function getKeys(){
    const methods ={
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (localStorage.getItem("token")) {
        methods.headers.Authorization = "Bearer " + localStorage.getItem("token")
    }
    return axios
        .get(`/key/getkeys`, methods)
        .then(response => {
            return response.data.keys
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}


function getShoppingBadge() {
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
        .post(`/cart/getShoppingBadge`, body, methods)
        .then(response => {
            console.log(response.data.items);
            return response.data.items
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function resetPass(email, code, password){
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = {
        email,
        code,
        password
    }
    return axios
        .post(`/user/verifyResetPass`, body, methods)
        .then(response => {
            return response.data.status
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function sendVerifyCode(email){
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = {
        email
    }
    return axios
        .post(`/user/forgetPass`, body, methods)
        .then(response => {
            return response.data.status
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}

function verifyEmail(email){
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const body = {
        email
    }
    return axios
        .post(`/user/verifyEmail`, body, methods)
        .then(response => {
            return response.data.status
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })

}

function getSearchAC(){
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/gameNameDes`, methods)
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

function saveUserDetails(username, phone, gender) {
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    const body = {
        username: username,
        phone: phone,
        gender: gender
    }
    return axios
        .post(`/user/saveUserInfo`, body, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function supportRequest(email, subject, message){
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    const body = {
        email: email,
        subject: subject,
        message: message
    }
    return axios
        .post(`/user/supportRequest`, body, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function getAllCategory(){
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    return axios
        .get(`/admin/getAllCategory`, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function addGame(game){
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    const body = {
        game
    }
    return axios
        .post(`/admin/addGame`, body, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function getRegion(){
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    return axios
        .get(`/admin/region`, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function adminGetGame(id){
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    return axios
        .get(`/admin/adminGetGame/${id}`, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function saveGame(game, id){
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    const body = {
        game
    }
    return axios
        .post(`/admin/saveGame/${id}`, body, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function delGame(id){
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    return axios
        .post(`/admin/delGame/${id}`, {}, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
} 

//Function to get create/log user in via paypal
function getPaypal(params) {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    //params is passed into the url
    return axios
        .get(`/user/login/callback?code=${params}`, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function getRequest(){
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    return axios
        .get(`/admin/requests`, methods)
        .then(response => {
            return response.data
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function updateRequest(requestid, status){
    const methods = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    const body = {
        id: requestid,
        status, status
    }
    return axios
        .post(`/admin/updaterequests`, body, methods)
        .then(response => {
            return response.data.result
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
}

function getSignedRequest(file, originUrl){
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        }
    }
    return axios
        .get(`/admin/sign-s3?file-name=${file.name}&file-type=${file.type}&origin-url=${originUrl}`, methods)
        .then(response => {
            // console.log(response);
            return response.data;
        })
        .catch(error => {
            if (error.response) {
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })
  }

  function uploadFile(file, signedRequest){
      file.name = file.name+"test"
    const methods = {
        method: 'PUT'
    }
    console.log(file);
    return axios
        .put(signedRequest, file, methods)
        .then(response => {
            console.log(response);
            return response.status
        })
        .catch(error => {
            if (error.response) {
                console.log(error);
                throw new Error(error.response.data.error)
            }
            return error.response.data
        })

  }