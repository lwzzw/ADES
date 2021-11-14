window.addEventListener('DOMContentLoaded', function () {
    const dropDownButton = document.getElementById('dropDownCategory');
    // const headerCategory = document.getElementById('header-categories')

    getAllCategories().then(response => {
        for (let i = 0; i < response.length; i++) {
            const category = response[i];
            const postHtml = `<option value='${category.category_name}' '>${category.category_name}</option>`
            dropDownButton.insertAdjacentHTML('beforeend', postHtml)
            // const postHeaderCategory = `<li class='navbar-category'><a href="#">${category.category_name}</a></li>`
            // headerCategory.insertAdjacentHTML('beforeend', postHeaderCategory)
        }
    })

})

var list = document.getElementsByClassName("cat-content");
var first_cat = [],
    second_cat = [],
    third_cat = [];

Array.from(list).forEach(e => {
    if (e.classList.contains("first-cat")) {
        first_cat.push(e.id);
    } else if (e.classList.contains("second-cat")) {
        second_cat.push(e.id);
    } else {
        third_cat.push(e.id);
    }
})
Array.from(list).forEach(e => {
    if (e.classList.contains("first-cat")) {
        e.addEventListener("mouseover", function () {
            first_cat.forEach(id => {
                try {
                    document.getElementById(`1-${id}`).style.display = "none";
                } catch (e) {}
            });
            second_cat.forEach(id => {
                try {
                    document.getElementById(`2-${id}`).style.display = "none";
                } catch (e) {}
            });
            try {
                document.getElementById("bg").style.display = "block";
                setTimeout(function(){
                    document.getElementById("bg").style.opacity = "0.8";
                }, 0);
                document.getElementById(`1-${e.id}`).style.display = "block";
            } catch (e) {}
        })
    }
    if (e.classList.contains("second-cat")) {
        e.addEventListener("mouseover", function () {
            second_cat.forEach(id => {
                try {
                    document.getElementById(`2-${id}`).style.display = "none";
                } catch (e) {}
            });
            try {
                document.getElementById(`2-${e.id}`).style.display = "block";
            } catch (e) {}
            document.getElementById(`2-${e.id}`).style.display = "block";
        })
    }
})
document.getElementById("bg").addEventListener("mouseover",function(){
    document.getElementById("bg").style.opacity = "0";
    document.getElementById("bg").style.display = "none";

})