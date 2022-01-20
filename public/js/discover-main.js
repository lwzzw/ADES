let duration = 250;
let toFirst, toSecond;
var recognition = new webkitSpeechRecognition();
var recording = false;
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'EN';
recognition.onerror = function(event) { 
    console.log(event);
    recording = false;
    recognition.stop();
    document.getElementById("start_img").src = "/images/mic.png";
    new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: event.error,
    })
        .show();
}
window.addEventListener('DOMContentLoaded', function () {
    if(localStorage.getItem("token")){
        checkLogin().then(response => {
            let myAccBtn = `<a href='dashboard.html' style="color: white!important;">My Account</a>`
            document.getElementById("login").innerHTML = "log out";
            document.getElementById('myAccount').insertAdjacentHTML('beforeend', myAccBtn)
            document.getElementById("login").addEventListener("click", () => {
            localStorage.removeItem("token");   
            })
        })
        .catch(err => {
            showNotification('error', err.message)
        })
    }

    //shows total amount of items in shopping cart
    showCartAmount();
    //Hides the category div
    $("#categ")[0].style.display = "none";

    //Execute corresponding APIs depending on the discover url
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
    getSearchAC().then(response=>{
        console.log(response);
        if(!response.length>0)return
        
        var input = document.getElementById("searchProduct");
        
        autocomplete({
            minLength: 1,
            input: input,
            fetch: function(text, update) {
                text = text.toLowerCase();
                var suggestions = response.filter(n => n.label.toLowerCase().startsWith(text)||n.des.toLowerCase().startsWith(text)||n.main_cat.toLowerCase().startsWith(text)||n.parent_cat.toLowerCase().startsWith(text)||n.child_cat.toLowerCase().startsWith(text))
                update(suggestions);
            },
            onSelect: function(item) {
                input.value = item.label;
            }
        });
    })
});

function voice(){
    if(!recording){
        recognition.start();
    }else{
        recognition.stop();
    }
    recording=!recording;
    document.getElementById("start_img").src=recording?"/images/mic-animate.gif":"/images/mic.png";
}

recognition.onresult = function(event) {
    var input = document.getElementById("searchProduct");
    // console.log(event);
    var transcript = "";
    if (typeof(event.results) == 'undefined') {
        recognition.onend = null;
        recognition.stop();
        return;
    }
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
    }
    input.value = transcript;
    input.dispatchEvent(new KeyboardEvent('keyup'));
};

//This function populates the website with the products that are passed into this function.
function listGames(games) {
    for (let i = 0; i < games.length; i++) {
        let game = games[i];
        let discoverProduct = `
        <li>
        <a href="/game.html?id=${game.g_id}">
        <div style="width: 270px; height: 173; margin: 0px">
            <img src="${game.g_image}" style="width: 100%; height: 100%;">
        </div>
        <div style="width: 270px; height: auto; margin: 0px;">
                    <h3 style="font-size: 15px; font-weight: 500; padding-top: 10px; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical;">${game.g_name}</h3>
                    ${parseFloat(game.g_discount) < parseFloat(game.g_price) ? 
                        `
                        <span class="span-space" style="font-size: 16px;"> ${game.g_discount} <sup class='sub-script-striked' style="font-size: 14px;"> SGD </sup></span>
                            <span class="span-space"><span style="font-size: 20px;"><span class='slash-price'>${game.g_price}</span><sup class='sub-script-striked' style="font-size: 14px;"> SGD </sup></span><span class='discount-percentage' style="font-size: 13px;"> -${discountPercentage(game.g_price, game.g_discount)}%</span></span>
                        `  
                        : `<span style="font-size: 20px;">${game.g_price}</span><sup class='sub-script-striked' style="font-size: 14px;"> SGD </sup>`}
        </div>
        </a>
    </li>`

        document.getElementById('discoverListings').insertAdjacentHTML('beforeend', discoverProduct);

    };
};

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
    showNotification('error', err.message)
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

//function to show total amount of items in shopping cart
function showCartAmount(){
    let string = 0;
    getShoppingBadge().then(response => {
        for(var i = 0; i < response.length; i++){
             string += response[i].amount;
        }
        document.getElementById("shoppingCart").firstChild.textContent=`Shopping Cart - ${string}`;
    })
}

//function to show notifications
function showNotification(type, message) {
    new Noty({
        type: type,
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '3000',
        text: message,
    }).show();
}