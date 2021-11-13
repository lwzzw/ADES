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

window.addEventListener('DOMContentLoaded', function () {
    const dropDownButton = document.getElementById('dropDownCategory');

    getAllCategories().then(response => {
        for (let i=0; i < response.length; i++) {
            const category = response[i];
            const postHtml = `<option value='${category.category_name}' '>${category.category_name}</option>`
            dropDownButton.insertAdjacentHTML('beforeend', postHtml)
        }
    })

})