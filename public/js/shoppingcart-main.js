window.addEventListener('DOMContentLoaded', function () {
    uidGenerate();
    $(".price").each(function () {
        console.log(this.innerText);
        pricearr.push(parseFloat(this.innerText.replace("SGD", "").trim()));
    });
    count()
})
var pricearr = [];

async function uidGenerate() {
    if (!localStorage.getItem("uid")) {
        const uid = await biri();
        localStorage.setItem("uid", uid);
    }
}

function count() {
    var price = 0;
    $(".qty").each(function (index) {
        price += this.value * pricearr[index];
    });
    $("#p").empty().append("Total price: <b>" + price.toFixed(2) + "</b>")
}