let dealsArray;
let dealsArrayi = 0;
let duration = 250;
let toFirst, toSecond;
let row = 1;
const params = new URLSearchParams(window.location.search);
var recognition = new webkitSpeechRecognition();
var recording = false;
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "EN";
recognition.onerror = function (event) {
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
  }).show();
};
window.addEventListener("DOMContentLoaded", async function () {
  if (params.get("token")) {
    localStorage.setItem("token", params.get("token"));
    window.history.pushState(
      {
        page: "same",
      },
      "same page",
      "/index.html"
    );
  }
  //if params contain query string code
  if (params.get("code")) {
    //getPaypal function is invoked to log/create user's account
    getPaypal(params.get("code"))
      .then((res) => {
        localStorage.setItem("token", res.token);
        window.history.pushState(
          {
            page: "same",
          },
          "same page",
          "/index.html"
        );
        location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  if (localStorage.getItem("token")) {
    checkLogin()
      .then((response) => {
        console.log(response);
        if (response.role == 1) {
          document
            .getElementById("adminPage")
            .insertAdjacentHTML(
              "beforeend",
              `<a href="admin_page">Admin Page</a>`
            );
        }
        let myAccBtn = `<a href='dashboard.html' style="color: white!important;">My Account</a>`;
        document.getElementById("login").innerHTML = "log out";
        document
          .getElementById("myAccount")
          .insertAdjacentHTML("beforeend", myAccBtn);
        document.getElementById("login").addEventListener("click", () => {
          localStorage.removeItem("token");
        });
      })
      .catch((err) => {
        new Noty({
          type: "error",
          layout: "topCenter",
          theme: "sunset",
          timeout: "6000",
          text: "Your session has expired, please login again",
        }).show();
        localStorage.removeItem("token");
        document.getElementById("login").innerHTML = "Login";
        // console.log(err);
      });
  }
  uidGenerate();
  showCartAmount();

  const getAllProducts = async () => {
    // const result = await getAllCategories()

    await getBestsellers(true).then((response) => {
      console.log(response);
      for (let i = 0; i < response.length; i++) {
        let bestsellers = response[i];
        let bestseller = `                        
                <a href='game.html?id=${bestsellers.g_id}'>
                <div class="row products">
                <div class="col-3 col-image">
                <img src='${
                  bestsellers.g_image
                }' onerror="this.onerror=null;this.src='/images/noimage.png';" />
                </div>
                <div class="col-9 product-details">
                <h6 class="m-0" style="display: -webkit-box; max-width: 400px; height: 40px; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${
                  bestsellers.g_name
                }</h6>
                <div><span>PRICE</span></div>
                <div>
                ${
                  parseFloat(bestsellers.g_discount) <
                  parseFloat(bestsellers.g_price)
                    ? `
                    <span> ${
                      bestsellers.g_discount
                    } <sup class='sub-script-striked'> SGD </sup></span>
                    <br>
                    <div>
                    <span class='slash-price'>${
                      bestsellers.g_price
                    }</span><sup class='sub-script-striked'> SGD </sup><span class='discount-percentage'> -${discountPercentage(
                        bestsellers.g_price,
                        bestsellers.g_discount
                      )}%</span>
                    </div>`
                    : `<span>${bestsellers.g_price}</span><sup class='sub-script-striked'> SGD </sup>`
                }
                    </div>
                    </div>
                    </div>
                    </a>
                    `;
        document
          .getElementById("bs-product")
          .insertAdjacentHTML("beforeend", bestseller);
      }
      document.getElementById("bsloading").remove();
    });

    await getPreOrders(true).then((response) => {
      for (let i = 0; i < response.length; i++) {
        let preorders = response[i];
        let preorder = `                        
                <a href='game.html?id=${preorders.g_id}'>
                    <div class="row products">
                        <div class="col-3 col-image">
                            <img src='${preorders.g_image}' onerror="this.onerror=null;this.src='/images/noimage.png';" />
                        </div>
                    <div class="col-9 product-details">
                        <h6 class="m-0" style="display: -webkit-box; max-width: 400px; height: 40px; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${preorders.g_name}</h6>
                        <div class="justify-content-between d-flex ">
                            <span>PRICE</span> 
                        </div>
                    <div>
                ${parseFloat(preorders.g_discount) < parseFloat(preorders.g_price) ? `
                    <span> ${preorders.g_discount} 
                        <sup class='sub-script-striked'> SGD </sup>
                    </span>
                    <br>
                    <div>
                        <span class='slash-price'>${preorders.g_price}</span>
                        <sup class='sub-script-striked'> SGD </sup>
                        <span class='discount-percentage'> -${discountPercentage(preorders.g_price, preorders.g_discount)}%</span>
                    </div>`
                    : `<span>${preorders.g_price}</span> <sup class='sub-script-striked'> SGD </sup>`
                  }
                            </div>
                        </div>
                    </div>
                </a>
                    `;
        document
          .getElementById("pre-product")
          .insertAdjacentHTML("beforeend", preorder);
      }
      document.getElementById("poloading").remove();
    });

    await getLRelease().then((response) => {
      for (let i = 0; i < response.length; i++) {
        let lreleases = response[i];
        let lrelease = `                        
                <a href='game.html?id=${lreleases.g_id}'>
                    <div class="row products">
                        <div class="col-3 col-image">
                            <img src='${lreleases.g_image}' onerror="this.onerror=null;this.src='/images/noimage.png';" />
                        </div>
                    <div class="col-9 product-details">
                        <h6 class="m-0" style="display: -webkit-box; max-width: 400px; height: 40px; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${lreleases.g_name}</h6>
                        <div class="justify-content-between d-flex ">
                            <span>PRICE</span> 
                            <span class="font-weight-bold"> Release Date ${lreleases.date}</span>
                        </div>
                    <div>
                ${parseFloat(lreleases.g_discount) < parseFloat(lreleases.g_price) ? `
                    <span> ${lreleases.g_discount} 
                        <sup class='sub-script-striked'> SGD </sup>
                    </span>
                    <br>
                    <div>
                        <span class='slash-price'>${lreleases.g_price}</span>
                        <sup class='sub-script-striked'> SGD </sup>
                        <span class='discount-percentage'> -${discountPercentage(lreleases.g_price, lreleases.g_discount)}%</span>
                    </div>`
                    : `<span>${lreleases.g_price}</span> <sup class='sub-script-striked'> SGD </sup>`
                  }
                            </div>
                        </div>
                    </div>
                </a>
                    `;
        document
          .getElementById("latest-release")
          .insertAdjacentHTML("beforeend", lrelease);
      }
      document.getElementById("lrloading").remove();
    });
    showCheapProducts();
    await getAllDeals();
  };
  await getAllCategories().then((response) => {
    for (let i = 0; i < response.length; i++) {
      let string = `<li class="cat-content first-cat" id="${response[i].id}"><a href="/category.html?maincat=${encodeURI(response[i].category_name)}">${response[i].category_name}</a></li>`;
      let category = `<option value='${response[i].category_name}'>${response[i].category_name}</option>`;
      document
        .getElementById("dropDownCategory")
        .insertAdjacentHTML("beforeend", category);
      document
        .getElementById("first_cat")
        .insertAdjacentHTML("beforeend", string);
      if (!response[i].parent) break;
      string = `<div class="cat-block" id="1-${response[i].id}"><ul>`;
      for (let j = 0; j < response[i].parent.length; j++) {
        string += `<li class="cat-content second-cat" id="1-${
          response[i].parent[j].fk_main
        }-${
          response[i].parent[j].id
        }"><a href="/category.html?platform=${encodeURI(
          response[i].parent[j].category_name
        )}">${response[i].parent[j].category_name}</a></li>`;
        if (!response[i].parent[j].child) break;
        let thirdstring = `<div class="cat-content third-cat cat-block" id="2-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><ul>`;
        for (let k = 0; k < response[i].parent[j].child.length; k++) {
          thirdstring += `<li><a href="/category.html?childcat=${encodeURI(
            response[i].parent[j].child[k].category_name
          )}">${response[i].parent[j].child[k].category_name}</a></li>`;
        }
        thirdstring += `</ul></div>`;
        document
          .getElementById("third_cat")
          .insertAdjacentHTML("beforeend", thirdstring);
      }
      string += `</ul></div>`;
      document
        .getElementById("second_cat")
        .insertAdjacentHTML("beforeend", string);
    }
    addListener();
    getAllProducts();
  });

  document.getElementById("bsBtn").addEventListener("click", () => {
    window.location.href = "/bestseller";
  });
  document.getElementById("poBtn").addEventListener("click", () => {
    window.location.href = "/preorders";
  });

  const getAllDeals = async () => {
    // const result = await getAllCategories()

    getDeals(row).then((response) => {
      dealsArray = response;
      showDeals();
      let button = `<button class='btn btn-primary' id='dealsButton'>Show more</button>`;
      document.getElementById("deals").insertAdjacentHTML("afterend", button);
      let loading = `
                <div id="dealsloading" class="d-flex justify-content-center">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>`;
      document.getElementById("dealsButton").addEventListener("click", () => {
        document
          .getElementById("deals")
          .insertAdjacentHTML("afterend", loading);

        getDeals(++row)
          .then((response) => {
            let gameResult = response;
            for (let i = 0; i < gameResult.length; i++) {
              dealsArray.push(gameResult[i]);
            }
            showDeals();
          })
          .finally((res) => {
            document.getElementById("dealsloading").remove();
          });
      });
      document.getElementById("dealsloading").remove();
    });
  };
  document.getElementById("searchBtn").addEventListener("click", search);
  getSearchAC().then((response) => {
    console.log(response);
    if (!response.length > 0) return;

    var input = document.getElementById("searchProduct");

    autocomplete({
      minLength: 1,
      input: input,
      fetch: function (text, update) {
        text = text.toLowerCase();
        var suggestions = response.filter(
          (n) =>
            n.label.toLowerCase().startsWith(text) ||
            n.des.toLowerCase().startsWith(text) ||
            n.main_cat.toLowerCase().startsWith(text) ||
            n.parent_cat.toLowerCase().startsWith(text) ||
            n.child_cat.toLowerCase().startsWith(text)
        );
        update(suggestions);
      },
      onSelect: function (item) {
        input.value = item.label;
      },
    });
  });
});
function voice() {
  if (!recording) {
    recognition.start();
  } else {
    recognition.stop();
  }
  recording = !recording;
  document.getElementById("start_img").src = recording
    ? "/images/mic-animate.gif"
    : "/images/mic.png";
}

recognition.onresult = function (event) {
  var input = document.getElementById("searchProduct");
  // console.log(event);
  var transcript = "";
  if (typeof event.results == "undefined") {
    recognition.onend = null;
    recognition.stop();
    return;
  }
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    transcript += event.results[i][0].transcript;
  }
  input.value = transcript;
  input.dispatchEvent(new KeyboardEvent("keyup"));
};

function showCheapProducts() {
  let minPrice, maxPrice;
  for (let i = 1, j = 0, f = 0; i < 6; i++, f++) {
    if (j == 1) {
      minPrice = `&minprice=${50 * f + j}`;
    } else {
      minPrice = "";
    }
    let string = `
        <div class="cheap-product">
            <div><a href="category.html?&maxprice=${(maxPrice =
              50 * i)}${minPrice}"><h6>Up to ${maxPrice} SGD</h6></a></div>
        </div>
        `;
    document
      .getElementById("cheap-products")
      .insertAdjacentHTML("beforeend", string);
    j = 1;
  }
}

function showDeals() {
  for (let i = 0; i < 6; dealsArrayi++, i++) {
    let deals = dealsArray[dealsArrayi];
    // if there are no longer deals in the array, dealsButton will be removed.
    if (!deals) {
      document.getElementById("dealsButton").remove();
      return;
    }

    let deal = `
        <li>
        <a href='/game.html?id=${deals.g_id}'>
        <div class='deals-image'>
            <img src='${deals.g_image}' onerror="this.onerror=null;this.src='/images/noimage.png';" />
        </div>
        <div>
            <h3 style="display: -webkit-box; max-width: 400px; height: 40px; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${deals.g_name}</h3>
        </div>
        <div>
        <span><span class='discount-price'>${deals.g_discount}</span> <sup class='sub-script'> SGD </sup></span>
        </div>
        <div>
        <span><span class='slash-price'>${deals.g_price}</span><sup class='sub-script-striked'> SGD </sup><span class='discount-percentage'> -${discountPercentage(deals.g_price, deals.g_discount)}%</span></span>
        </div>
        </a>
        </li>
        `;
    document.getElementById("deals").insertAdjacentHTML("beforeend", deal);
  }
}
//Calculates discount percentage
function discountPercentage(originalPrice, discountedPrice) {
  return parseFloat(
    (100 * (originalPrice - discountedPrice)) / originalPrice
  ).toFixed(0);
}

function addListener() {
  var list = document.getElementsByClassName("cat-content");
  var first_cat = [],
    second_cat = [],
    third_cat = [];

  Array.from(list).forEach((e) => {
    if (e.classList.contains("first-cat")) {
      first_cat.push(e.id);
    } else if (e.classList.contains("second-cat")) {
      second_cat.push(e.id);
    } else {
      third_cat.push(e.id);
    }
  });
  Array.from(list).forEach((e) => {
    if (e.classList.contains("first-cat")) {
      e.addEventListener("mouseover", function () {
        //if mouse enter the div start the time out
        //if the mouse did not leave within duration time then the category will show
        toFirst = setTimeout(() => {
          first_cat.forEach((id) => {
            try {
              document.getElementById(`1-${id}`).style.display = "none";
            } catch (e) {}
          });
          second_cat.forEach((id) => {
            try {
              document.getElementById(`2-${id.substr(2)}`).style.display =
                "none";
            } catch (e) {}
          });
          try {
            document.getElementById("bg").style.display = "block";
            document.body.style.overflow = "hidden";
            setTimeout(function () {
              document.getElementById("bg").style.opacity = "0.8";
            }, 0);
            Array.from(document.getElementsByClassName("img-second")).forEach(
              (e) => {
                e.style.display = "block";
              }
            );
            document.getElementById(`1-${e.id}`).style.display = "block";
            Array.from(document.getElementsByClassName("img-second")).forEach(
              (e) => {
                e.style.display = "none";
              }
            );
            Array.from(document.getElementsByClassName("img-third")).forEach(
              (e) => {
                e.style.display = "block";
              }
            );
          } catch (e) {}
        }, duration);
      });
      e.addEventListener("mouseleave", function () {
        //clear the time out when mouse leave the div
        clearTimeout(toFirst);
      });
    }
    if (e.classList.contains("second-cat")) {
      e.addEventListener("mouseover", function () {
        //if mouse enter the div start the time out
        //if the mouse did not leave within duration time then the category will show
        toSecond = setTimeout(() => {
          second_cat.forEach((id) => {
            try {
              document.getElementById(`2-${id.substr(2)}`).style.display =
                "none";
            } catch (e) {}
          });
          try {
            document.getElementById(`2-${e.id.substr(2)}`).style.display =
              "block";
            Array.from(document.getElementsByClassName("img-third")).forEach(
              (e) => {
                e.style.display = "none";
              }
            );
          } catch (e) {}
        }, duration);
      });
      e.addEventListener("mouseleave", function () {
        //clear the time out when mouse leave the div
        clearTimeout(toSecond);
      });
    }
  });
  document.getElementById("bg").addEventListener("mouseover", function () {
    setTimeout(() => {
      document.getElementById("bg").style.opacity = "0";
      document.getElementById("bg").style.display = "none";
      document.body.style.overflow = "auto";
      first_cat.forEach((id) => {
        try {
          document.getElementById(`1-${id}`).style.display = "none";
        } catch (e) {}
      });
      second_cat.forEach((id) => {
        try {
          document.getElementById(`2-${id.substr(2)}`).style.display = "none";
        } catch (e) {}
      });
      Array.from(document.getElementsByClassName("img-default")).forEach(
        (e) => {
          e.style.display = "block";
        }
      );
    }, duration);
  });
}

function search() {
  var searchQuery = document.getElementById("searchProduct").value;
  var categoryMain = document.getElementById("dropDownCategory").value;
  var string = "?";
  if (searchQuery) {
    string += "&name=" + searchQuery;
  }

  string += "&maincat=" + categoryMain;
  location.href = "/category.html" + string;
}

function showCartAmount() {
  let string = 0;
  getShoppingBadge().then((response) => {
    for (var i = 0; i < response.length; i++) {
      string += response[i].amount;
    }
    document.getElementById(
      "shoppingCart"
    ).firstChild.textContent = `Shopping Cart - ${string}`;
  });
}
