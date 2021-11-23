function login(email, password){
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
                return response.data.user_id;
        })
        .catch(error => {
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}
