function login(email, password, callback){
    const methods = {
        method: 'POST',
        data: {
            email : email,
            password : password
        },
        headers: {
            'Content-Type': 'application/json'
        }
        
    }
    return axios
        .post(`/login`, methods)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}
