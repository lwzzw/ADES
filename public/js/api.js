function login(email, password) {
    // alert(email + password);
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

function getDeals() {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/getDeals/`, methods)
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
        .get(`/game/gameDetailFilter?${params||""}`, methods)
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