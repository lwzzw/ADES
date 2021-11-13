window.addEventListener('DOMContentLoaded', function () {
    const dropDownButton = document.getElementById('dropDownCategory');
    const headerCategory = document.getElementById('header-categories')

    getAllCategories().then(response => {
        for (let i=0; i < response.length; i++) {
            const category = response[i];
            const postHtml = `<option value='${category.category_name}' '>${category.category_name}</option>`
            dropDownButton.insertAdjacentHTML('beforeend', postHtml)
            const postHeaderCategory = `<li class='navbar-category'><a href="#">${category.category_name}</a></li>`
            headerCategory.insertAdjacentHTML('beforeend', postHeaderCategory)
        }
    })

})

