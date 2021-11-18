window.addEventListener('DOMContentLoaded', function () {
    const dropDownButton = document.getElementById('dropDownCategory');
    // const headerCategory = document.getElementById('header-categories')

    getAllCategories().then(response => {
        console.log(response)
        for (let i = 0; i < response.length; i++) {
            let string = `<li class="cat-content first-cat" id="${response[i].id}"><a href="/filter?main_cat=${encodeURI(response[i].category_name)}">${response[i].category_name}</a></li>`;
            document.getElementById("first_cat").insertAdjacentHTML("beforeend", string);
            if (response[i].parent.length == 0) break;
            string = `<div class="cat-block" id="1-${response[i].id}"><ul>`;
            for (let j = 0; j < response[i].parent.length; j++) {
                console.log(response[i].parent[j].id)
                string += `<li class="cat-content second-cat" id="1-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><a href="/filter?parent_cat=${encodeURI(response[i].parent[j].category_name)}">${response[i].parent[j].category_name}</a></li>`;
                if (response[i].parent[j].child.length == 0) break;
                let thirdstring = `<div class="cat-content third-cat cat-block" id="2-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><ul>`;
                for (let k = 0; k < response[i].parent[j].child.length; k++) {
                    thirdstring += `<li><a href="/filter?child_cat=${encodeURI(response[i].parent[j].child[k].category_name)}">${response[i].parent[j].child[k].category_name}</a></li>`;
                }
                thirdstring += `</ul></div>`;
                document.getElementById("third_cat").insertAdjacentHTML("beforeend", thirdstring);
            }
            string += `</ul></div>`;
            document.getElementById("second_cat").insertAdjacentHTML("beforeend", string);
        }
        addListener();
    })
})

function addListener() {
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
                        document.getElementById(`2-${id.substr(2)}`).style.display = "none";
                    } catch (e) {}
                });
                try {
                    document.getElementById("bg").style.display = "block";
                    document.body.style.overflow = "hidden";
                    setTimeout(function () {
                        document.getElementById("bg").style.opacity = "0.8";
                    }, 0);
                    Array.from(document.getElementsByClassName("img-second")).forEach(e => {
                        e.style.display = "block";
                    })
                    document.getElementById(`1-${e.id}`).style.display = "block";
                    Array.from(document.getElementsByClassName("img-second")).forEach(e => {
                        e.style.display = "none";
                    })
                    Array.from(document.getElementsByClassName("img-third")).forEach(e => {
                        e.style.display = "block";
                    })
                } catch (e) {}
            })
        }
        if (e.classList.contains("second-cat")) {
            e.addEventListener("mouseover", function () {
                second_cat.forEach(id => {
                    try {
                        document.getElementById(`2-${id.substr(2)}`).style.display = "none";
                    } catch (e) {}
                });
                try {
                    document.getElementById(`2-${e.id.substr(2)}`).style.display = "block";
                    Array.from(document.getElementsByClassName("img-third")).forEach(e => {
                        e.style.display = "none";
                    })
                } catch (e) {}
            })
        }
    })
    document.getElementById("bg").addEventListener("mouseover", function () {
        document.getElementById("bg").style.opacity = "0";
        document.getElementById("bg").style.display = "none";
        document.body.style.overflow = "auto";
        first_cat.forEach(id => {
            try {
                document.getElementById(`1-${id}`).style.display = "none";
            } catch (e) {}
        });
        second_cat.forEach(id => {
            try {
                document.getElementById(`2-${id.substr(2)}`).style.display = "none";
            } catch (e) {}
        });
        Array.from(document.getElementsByClassName("img-default")).forEach(e => {
            e.style.display = "block";
        })
    })
    console.log(first_cat)
    console.log(second_cat)
    console.log(third_cat)
}
11222