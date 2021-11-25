let dealsArray;
let dealsArrayi = 0;
let duration = 250;
let toFirst, toSecond;
window.addEventListener('DOMContentLoaded', function () {
    checkLogin().then(response => {
            document.getElementById("login").innerHTML = "log out";
            document.getElementById("login").addEventListener("click", () => {
                localStorage.removeItem("token");   
                document.getElementById("orderHistory").remove()
            })
        })
        .catch(err => {
            console.log(err);
        })
    uidGenerate();
    getAllCategories().then(response => {
        for (let i = 0; i < response.length; i++) {
            let string = `<li class="cat-content first-cat" id="${response[i].id}"><a href="/category.html?maincat=${encodeURI(response[i].category_name)}">${response[i].category_name}</a></li>`;
            let category = `<option value='${response[i].category_name}'>${response[i].category_name}</option>`
            document.getElementById("dropDownCategory").insertAdjacentHTML('beforeend', category)
            document.getElementById("first_cat").insertAdjacentHTML("beforeend", string);
            if (response[i].parent.length == 0) break;
            string = `<div class="cat-block" id="1-${response[i].id}"><ul>`;
            for (let j = 0; j < response[i].parent.length; j++) {
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
        getAllProducts();
    })

    const getAllProducts = async () => {
        const result = await getAllCategories()

        await getBestsellers().then(response => {

            for (let i = 0; i < response.length; i++) {
                let bestsellers = response[i]
                let bestseller = `                        
                <a href='game.html?id=${bestsellers.g_id}'>
                    <div class="row products">
                        <div class="col-4 col-image">
                            <img src='${bestsellers.g_image}' />
                        </div>
                        <div class="col-8 product-details">
                            <h6>${bestsellers.g_name}</h6>
                            <div><span>PRICE</span></div>
                            <div>
                                <span><span>${bestsellers.bs_price}</span> <sup class='sub-script'> SGD </sup></span>
                            </div>
                            <div>
                                <span><span class='slash-price'>${bestsellers.g_price}</span><sup class='sub-script-striked'> SGD
                                    </sup></span>
                            </div>
                        </div>
                    </div>
                </a>
                `


                document.getElementById("bs-product").insertAdjacentHTML("beforeend", bestseller);
            }
        })


        await getPreOrders().then(response => {
            for (let i = 0; i < response.length; i++) {
                let preorders = response[i];
                let preorder = `
                <a href='game.html?id=${preorders.g_id}'>
                    <div class="row products">
                        <div class="col-4 col-image">
                            <img src='${preorders.g_image}' />
                        </div>
                        <div class="col-8 product-details">
                            <h6>${preorders.g_name}</h6>
                            <div><span>PRICE</span></div>
                            <div>
                                <span><span>${preorders.preorder_price}</span> <sup class='sub-script'> SGD </sup></span>
                            </div>
                            <div id='game-${preorders.g_id}'>

                            </div>
                        </div>
                    </div>
                </a>
                `
                document.getElementById("pre-product").insertAdjacentHTML("beforeend", preorder)
                if (preorders.nullif == null) {
                    document.getElementById(`game-${preorders.g_id}`).remove();
                } else {
                    let string = `<span><span class='slash-price'>${preorders.g_price}</span><sup class='sub-script-striked'> SGD </sup></span>`
                    document.getElementById(`game-${preorders.g_id}`).insertAdjacentHTML("beforeend", string)
                }
            }
        })

        await getLRelease().then(response => {
            for (let i = 0; i < response.length; i++) {
                let lreleases = response[i];
                let lrelease = `
                <a href='game.html?id=${lreleases.g_id}'>
                    <div class="row products">
                        <div class="col-4 col-image">
                            <img src='${lreleases.g_image}' />
                        </div>
                        <div class="col-8 product-details">
                            <h6>${lreleases.g_name} ${lreleases.date}</h6>
                            <div><span>PRICE</span></div>
                            <div>
                                <span><span>${lreleases.g_discount}</span> <sup class='sub-script'> SGD </sup></span>
                            </div>
                            <div id='lr-${lreleases.g_id}'>
            
                            </div>
                        </div>
                    </div>
                </a>
                `
                document.getElementById("latest-release").insertAdjacentHTML("beforeend", lrelease)
                if (lreleases.nullif == null) {
                    document.getElementById(`lr-${lreleases.g_id}`).remove();
                } else {
                    let string = `<span><span class='slash-price'>${lreleases.g_price}</span><sup class='sub-script-striked'> SGD </sup></span>`
                    document.getElementById(`lr-${lreleases.g_id}`).insertAdjacentHTML("beforeend", string)
                }
            }
        })
        showCheapProducts();
        getAllDeals();
    }

    const getAllDeals = async () => {
        const result = await getAllCategories()
        getDeals()
            .then(response => {
                dealsArray = response
                showDeals();
                let button = `<button class='btn btn-primary' id='dealsButton'>Show more</button>`
                document.getElementById("deals").insertAdjacentHTML("afterend", button);
                document.getElementById('dealsButton').addEventListener('click', showDeals)
            })

    }
    document.getElementById('searchBtn').addEventListener('click', search)


})

async function uidGenerate() {
    if (!localStorage.getItem("uid")) {
        const uid = await biri();
        localStorage.setItem("uid", uid);
    }
}

function showCheapProducts() {
    let minPrice, maxPrice;
    for (let i = 1, j = 0, f = 0; i < 6; i++, f++) {
        if (j == 1) {
            minPrice = `&minprice=${(50*f) + j}`
        } else {
            minPrice = ""
        }
        let string = `
        <div class="cheap-product">
            <div><a href="category.html?&maxprice=${maxPrice=50 * i}${minPrice}"><h6>${maxPrice}</h6></a></div>
        </div>
        `
        document.getElementById("cheap-products").insertAdjacentHTML("beforeend", string)
        j = 1
    }
}

function showDeals() {
    for (let i = 0; i < 6; dealsArrayi++, i++) {
        let deals = dealsArray[dealsArrayi]
        // if there are no longer deals in the array, dealsButton will be removed.
        if (!deals) {
            document.getElementById('dealsButton').remove()
            return
        }

        let deal =
            `
        <li>
        <a href='/game.html?id=${deals.g_id}'>
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
}

function search() {
    var searchQuery = document.getElementById("searchProduct").value;
    var categoryMain = document.getElementById("dropDownCategory").value;
    var string = "?";
    if (searchQuery) {
        string += "&name=" + searchQuery;
    }

    string += "&maincat=" + categoryMain;
    location.href = '/category.html' + string
}