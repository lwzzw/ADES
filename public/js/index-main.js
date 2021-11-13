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