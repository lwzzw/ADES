let dealsArray;
let dealsArrayi = 0;
let duration = 250;
let toFirst, toSecond;
let keepCall = true;
window.addEventListener('DOMContentLoaded', function () {
    const dropDownButton = document.getElementById('dropDownCategory');
    // const headerCategory = document.getElementById('header-categories')

    getAllCategories().then(response => {
        console.log(response)
        for (let i = 0; i < response.length; i++) {
            let string = `<li class="cat-content first-cat" id="${response[i].id}"><a href="/category.html?maincat=${encodeURI(response[i].category_name)}">${response[i].category_name}</a></li>`;
            document.getElementById("first_cat").insertAdjacentHTML("beforeend", string);
            if (response[i].parent.length == 0) break;
            string = `<div class="cat-block" id="1-${response[i].id}"><ul>`;
            for (let j = 0; j < response[i].parent.length; j++) {
                console.log(response[i].parent[j].id)
                string += `<li class="cat-content second-cat" id="1-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><a href="/category.html?platform=${encodeURI(response[i].parent[j].category_name)}">${response[i].parent[j].category_name}</a></li>`;
                if (response[i].parent[j].child.length == 0) break;
                let thirdstring = `<div class="cat-content third-cat cat-block" id="2-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><ul>`;
                for (let k = 0; k < response[i].parent[j].child.length; k++) {
                    thirdstring += `<li><a href="/category.html?childcat=${encodeURI(response[i].parent[j].child[k].category_name)}">${response[i].parent[j].child[k].category_name}</a></li>`;
                }
                thirdstring += `</ul></div>`;
                document.getElementById("third_cat").insertAdjacentHTML("beforeend", thirdstring);
            }
            string += `</ul></div>`;
            document.getElementById("second_cat").insertAdjacentHTML("beforeend", string);
        }
        addListener();
    })

    getDeals().then(response => {
        console.log(response)
        dealsArray = response
        showDeals();
        let button = `<button class='btn' id='dealsButton'>Show more</button>`
        document.getElementById("deals").insertAdjacentHTML("afterend", button);
        document.getElementById('dealsButton').addEventListener('click', showDeals)
    })

})

function showDeals() {
    for (let i = 0; i < 6; dealsArrayi++, i++) {
        let deals = dealsArray[dealsArrayi]
        if (!deals) return
        let deal =
            `
        <li>
        <a href='/game.html?gameid=${deals.g_id}'>
        <div class='deals-image'>
            <img src='${deals.g_image}' />
        </div>
        <div>
            <h3>${deals.g_name}</h3>
        </div>
        <div>
        <span><span class='discount-price'>${deals.g_discount}</span> <sup class='sub-script'> SGD </sup></span>
        </div>
        <div>
            <span><span class='slash-price'>${deals.g_price}</span><sup class='sub-script-striked'> SGD </sup><span class='discount-percentage'> -${parseFloat(discount_percentage = 100 * (deals.g_price - deals.g_discount) / deals.g_price).toFixed(0)}%</span></span>
        </div>
        </a>
        </li>
        `
        document.getElementById("deals").insertAdjacentHTML("beforeend", deal);
    }
}

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
                //if mouse enter the div start the time out
                //if the mouse did not leave within duration time then the category will show
                toFirst = setTimeout(() => {
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
                }, duration)
            })
            e.addEventListener("mouseleave", function () {
                //clear the time out when mouse leave the div
                clearTimeout(toFirst);
            })
        }
        if (e.classList.contains("second-cat")) {
            e.addEventListener("mouseover", function () {
                //if mouse enter the div start the time out
                //if the mouse did not leave within duration time then the category will show
                toSecond = setTimeout(() => {
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
                }, duration)
            })
            e.addEventListener("mouseleave", function () {
                //clear the time out when mouse leave the div
                clearTimeout(toSecond);
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