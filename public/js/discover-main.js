let duration = 250;
let toFirst, toSecond;
window.addEventListener('DOMContentLoaded', function () {
    
    //Hides the category div
    $("#categ")[0].style.display = "none";

    if (window.location.pathname == '/bestseller') {
        document.getElementById('productTitle').innerHTML = 'Discover Bestsellers';
        getBestsellers(false).then(bsGames => {
            listGames(bsGames);
        });
    } else if (window.location.pathname == '/preorders') {
        document.getElementById('productTitle').innerHTML = 'Discover Preorders';
        getPreOrders(false).then(poGames => {
            listGames(poGames);
        })
    }

});

//This function populates the website with the products that are passed into this function.
function listGames(games) {
    for (let i = 0; i < games.length; i++) {
        let game = games[i];
        //if g_di
        let discoverProduct = `
        <li>
        <a href='game.html?id=${game.g_id}' style="text-decoration: none; color: black;">
        <div style="width: 270px; height: 173px;">
            <img src="${game.g_image}" style="width: 100%; height: 100%;">
        </div>
        <div style="width: 268px; height: 142px;">
            <div style="width: 100%; height: 100%;">
                    <h3 style="font-size: 11px; font-weight: 500; padding-top: 10px; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical;">${game.g_name}</h3>
                    ${parseFloat(game.g_discount) < parseFloat(game.g_price) ? 
                        `
                        <span> ${game.g_discount} <sup class='sub-script-striked'> SGD </sup></span>
                        <br>
                        <div>
                            <span class='slash-price'>${game.g_price}</span><sup class='sub-script-striked'> SGD </sup><span class='discount-percentage'> -${discountPercentage(game.g_price, game.g_discount)}%</span>
                        </div>`  
                        : `<span>${game.g_price}</span><sup class='sub-script-striked'> SGD </sup>`}
            </div> 
        </div>
        </a>
    </li>`

        document.getElementById('discoverListings').insertAdjacentHTML('beforeend', discoverProduct);

    };
};
//
//Calculates discount percentage
function discountPercentage(originalPrice, discountedPrice) {
    return parseFloat(100 * (originalPrice - discountedPrice) / originalPrice).toFixed(0)
}
getAllCategories().then(response => {
    //add first category list
    for (let i = 0; i < response.length; i++) {
        let string = `<li class="cat-content first-cat" id="${response[i].id}"><a href="/category.html?maincat=${encodeURI(response[i].category_name)}">${response[i].category_name}</a></li>`;
        document.getElementById("first_cat").insertAdjacentHTML("beforeend", string);
        let category = `<option value='${response[i].category_name}'>${response[i].category_name}</option>`
        document.getElementById("dropDownCategory").insertAdjacentHTML('beforeend', category)
        if (!response[i].parent) break;
        string = `<div class="cat-block" id="1-${response[i].id}"><ul>`;
        //add second category list
        for (let j = 0; j < response[i].parent.length; j++) {
            string += `<li class="cat-content second-cat" id="1-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><a href="/category.html?platform=${encodeURI(response[i].parent[j].category_name)}">${response[i].parent[j].category_name}</a></li>`;
            if (!response[i].parent[j].child) break;
            let thirdstring = `<div class="cat-content third-cat cat-block" id="2-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><ul>`;
            //add third category list
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
}).catch(err => {
    alert(err)
});

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
                        } catch (e) { }
                    });
                    second_cat.forEach(id => {
                        try {
                            document.getElementById(`2-${id.substr(2)}`).style.display = "none";
                        } catch (e) { }
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
                    } catch (e) { }
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
                        } catch (e) { }
                    });
                    try {
                        document.getElementById(`2-${e.id.substr(2)}`).style.display = "block";
                        Array.from(document.getElementsByClassName("img-third")).forEach(e => {
                            e.style.display = "none";
                        })
                    } catch (e) { }
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
            } catch (e) { }
        });
        second_cat.forEach(id => {
            try {
                document.getElementById(`2-${id.substr(2)}`).style.display = "none";
            } catch (e) { }
        });
        Array.from(document.getElementsByClassName("img-default")).forEach(e => {
            e.style.display = "block";
        })
    })
}

//When catdrop bar is clicked, displays the hidden div
$("#catdrop").on("click", function () {
    let drop = $("#categ");
    if (drop.is(":visible")) {
        drop[0].style.display = "none";
        $("#bg")[0].style.display = "none";
    } else
        drop[0].style.display = "flex";
})

function showCartAmount(){
    let string = 0;
    getShoppingBadge().then(response => {
        for(var i = 0; i < response.length; i++){
             string += response[i].amount;
        }
        document.getElementById("shoppingCart").insertAdjacentHTML("beforeend", string);
    })
}