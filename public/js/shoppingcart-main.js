window.addEventListener('DOMContentLoaded', function () {
    uidGenerate();
    displayCart();
})
var pricearr = [],
    id = [];

function count() {
    var price = 0;
    $(".qty").each(function (index) {
        price += this.value * pricearr[index];
    });
    $("#p").empty().append("Total price: <b>" + price.toFixed(2) + "</b>")
}

function displayCart() {
    getShoppingCart().then(result => {
        document.getElementById("cart").innerHTML = "";
        result.cart.forEach(cart => {
            id.push(cart.game_id);
            let string = `
                <div class="col-12 col-sm-12 col-md-2 text-center pb-5 shoppingCart">
                                <img class="img-responsive" src="${cart.g_image}" onerror="this.onerror=null;this.src='/images/noimage.png';" alt="preview" width="120" height="155px">
                            </div>
                            <div class="col-12 text-sm-left col-sm-12  col-md-6">
                                <h4 class="product-name"><strong>${cart.g_name}</strong></h4>
                                <h6>
                                    ${cart.g_description}
                                </h6>
                            </div>
                            <div class="col-12 col-sm-12 text-sm-center col-md-4 text-md-right row">
                                <div class="col-3 col-sm-3 col-md-6 text-md-right" style="padding-top: 5px">
                                    <h6><strong><span class="text-muted price">${cart.g_discount?cart.g_discount:cart.g_price}SGD</span></strong></h6>
                                </div>
                                <div class="col-4 col-sm-4 col-md-4">
                                    <div class="quantity">
                                        <input onclick="this.parentNode.querySelector('input[type=number]').stepUp();count();saveCart();"
                                            type="button" value="+" class="plus">
                                        <input id="amount-${cart.game_id}" onkeyup="count()" type="number" step="1" max="99" min="1" value="${cart.amount}"
                                            title="Qty" class="qty" size="4">
                                        <input onclick="this.parentNode.querySelector('input[type=number]').stepDown();count();saveCart();"
                                            type="button" value="-" class="minus">
                                            
                                    </div>
                                </div>
                                <div class="col-2 col-sm-2 col-md-2 text-right">
                                    <button onclick="delete_cart(${cart.game_id})" type="button" class="btn btn-outline-danger btn-xs">
                                        <i class="fa fa-trash" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                `
            document.getElementById("cart").insertAdjacentHTML("beforeend", string);
        });
        $(".price").each(function () {
            pricearr.push(parseFloat(this.innerText.replace("SGD", "").trim()));
        });
        count();
    })
}

function saveCart() {
    // document.getElementById("update").disabled = true;
    var cartArr = [];
    for (let i = 0; i < id.length; i++) {
        cartArr.push({
            id: id[i],
            amount: $(`#amount-${id[i]}`).val()
        });
    }
    addShoppingCart(cartArr, 'true').then(result => {
        // alert("Save cart");
        // document.getElementById("update").disabled = false;
    }).catch(err => {
        console.log(err);
        // document.getElementById("update").disabled = false;
    })
}

function delete_cart(id) {
    if (confirm("You are deleting cart ", id)) {
        deleteCart(id).then(result => {
            // alert(err)
            new Noty({
                type: "success",
                layout: "topCenter",
                theme: "sunset",
                timeout: "6000",
                text: "Delete success"
            })
                .show();
            displayCart();
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
}