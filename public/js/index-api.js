function getAllCategories() {
    const methods = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios
        .get(`/game/getAllCategories`, methods)
        .then(response => {
            return response.data.categories
        }).catch(error => {
            console.log(error);
            if (error.response) {
                throw new Error(JSON.stringify(error.response.data))
            }
            return error.response.data
        })
}
