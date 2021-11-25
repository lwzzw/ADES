window.addEventListener('DOMContentLoaded', async function () {

    const getOrderHistory = async () => {
        getOrderID().then(async response => {
            console.log(response)
            for (let i = 0; i < response.length; i++) {
                let orders = response[i];

                let order = `
                <div class="order-header">
                <h3 id="order-id">Order ID - ${orders.id}</h3>
                <div>
                    <h3 id="order-date">Date - ${orders.buydate}</h3>
                </div>
            </div>
            <div>
                    <Details>
                        <ul id="${orders.id}-order-details">
                        </ul>
                    </Details>
            </div>
                `
                document.getElementById('all-orders').insertAdjacentHTML('beforeend', order)
                await getOrderDetailsByID(orders.id).then(response => {
                    console.log(response)
                    for (let i = 0; i < response.length; i++) {
                        let orderDetails = response[i];
                        let orderDetail = `<li>GAMEID: ${orderDetails.g_id} | GAMENAME: ${orderDetails.g_name} | AMOUNT: ${orderDetails.amount} </li>`
                        document.getElementById(`${orders.id}-order-details`).insertAdjacentHTML('beforeend', orderDetail)
                    }

                })
            }

        })

    }



    uidGenerate();
    getOrderHistory();

})

async function uidGenerate() {
    if (!localStorage.getItem("uid")) {
        const uid = await biri();
        localStorage.setItem("uid", uid);
    }
}