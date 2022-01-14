let duration = 250;
let toFirst, toSecond;
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

window.addEventListener('DOMContentLoaded', function () {
    checkLogin().then(response => {
            document.getElementById("login").innerHTML = "log out";
            document.getElementById("login").addEventListener("click", () => {
                localStorage.removeItem("token");
            })
        })
        .catch(err => {
            console.log(err);
        })
    $("#categ")[0].style.display = "none";
    uidGenerate();
    showCartAmount();
    getAllCategories().then(response => {
        //add first category list
        for (let i = 0; i < response.length; i++) {
            let string = `<li class="cat-content first-cat" id="${response[i].id}"><a href="/category.html?maincat=${encodeURI(response[i].category_name)}">${response[i].category_name}</a></li>`;
            document.getElementById("first_cat").insertAdjacentHTML("beforeend", string);
            if (!response[i].parent.length) break;
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
        // alert(err)
        new Noty({
            type: "error",
            layout: "topCenter",
            theme: "sunset",
            timeout: "6000",
            text: err
        })
            .show();
        })

    getGame(id).then(response => {
        showGame(response[0]);
    }).catch(err => {
        // alert(err)
        new Noty({
            type: "error",
            layout: "topCenter",
            theme: "sunset",
            timeout: "6000",
            text: err
        })
            .show();
        })

    getSearchAC().then(response=>{
        console.log(response.length);
        if(!response.length>0)return
        
        var input = document.getElementById("searchProduct");

        autocomplete({
            input: input,
            fetch: function(text, update) {
                text = text.toLowerCase();
                var suggestions = response.filter(n => n.label.toLowerCase().startsWith(text)||n.value.toLowerCase().startsWith(text))
                update(suggestions);
            },
            onSelect: function(item) {
                input.value = item.label;
            }
        });
    })

})

function showGame(game) {
    document.getElementById('web-title').innerHTML = `${game.g_name}`
    let gameString = `
        <div class="individual-game">
        <div class="individual-game-image">
           <img src='${game.g_image}' /> 
        </div>
        <div class="individual-game-container">
            <div>
                <h1>${game.g_name}</h1>
            </div>
            <div class="individual-game-details">
                <div><h6>Category:</h6> ${game.category_name}</div>
                <div><h6>Region:</h6> ${game.region_name}</div>
                <div><h6>Published Date:</h6> ${game.g_publishdate}</div>
            </div>

            <div class="individual-game-description">
            <h6>Description:</h6>
            ${game.g_description}
            </div>
        </div>

        <div class="individual-game-price-section">
            <h5>PRICE</h5>
            <h4>${game.g_discount ? `${game.g_discount}<sup class='sub-script'> SGD </sup><br><span class='slash-price'>${game.g_price}</span><sup class='sub-script-striked'> SGD </sup><span class='discount-percentage'> -${discountPercentage(game.g_price, game.g_discount)}%</span>`
            : `${game.g_price}<sup class='sub-script'> SGD </sup>`}</h4>
            <button onclick="addCart(${game.g_id})" id="addcartbtn">Add to cart</button>
        </div>
        </div>
    `
    document.getElementById('game-container').insertAdjacentHTML('beforeend', gameString);

}

//Calculates discount percentage
function discountPercentage(originalPrice, discountedPrice) {
    return parseFloat(100 * (originalPrice - discountedPrice) / originalPrice).toFixed(0)
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

$("#catdrop").on("click", function () {
    let drop = $("#categ");
    if (drop.is(":visible")) {
        drop[0].style.display = "none";
        $("#bg")[0].style.display = "none";
    } else
        drop[0].style.display = "flex";
})

function addCart(id) {
    document.getElementById("addcartbtn").disabled = true;
    document.getElementById("addcartbtn").textContent="Adding"
    addShoppingCart([{
            id,
            amount: 1
        }], 'false')
        .then(result => {
            // alert("Add success");
            // window.location.reload();
            showCartAmount();
            new Noty({
                type: "success",
                layout: "topCenter",
                theme: "sunset",
                timeout: "6000",
                text: "Add success",
              })
                .show();
                document.getElementById("addcartbtn").disabled = false;
                document.getElementById("addcartbtn").textContent="Add to cart"
        }).catch(err => {
            // alert(err)
            new Noty({
                type: "error",
                layout: "topCenter",
                theme: "sunset",
                timeout: "6000",
                text: err
            })
                .show();
                })
        
}

function showCartAmount(){
    let string = 0;
    getShoppingBadge().then(response => {
        for(var i = 0; i < response.length; i++){
             string += response[i].amount;
        }  
        document.getElementById("shoppingCart").firstChild.textContent=`Shopping Cart - ${string}`;
    })
}