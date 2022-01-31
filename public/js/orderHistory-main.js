const recognition = new webkitSpeechRecognition()
const duration = 250
let toFirst, toSecond
let recording = false
recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'EN'
recognition.onerror = function (event) {
  // if recognition error
  console.log(event)
  recording = false
  recognition.stop()
  document.getElementById('start_img').src = '/images/mic.png'
  new Noty({
    type: 'error',
    layout: 'topCenter',
    theme: 'sunset',
    timeout: '6000',
    text: event.error
  })
    .show()
}
//loading screen
function onReady(callback) {
  var intervalID = window.setInterval(checkReady, 1000)

  function checkReady() {
      if (document.getElementsByTagName('body')[0] !== undefined) {
          window.clearInterval(intervalID)
          callback.call(this)
      }
  }
}

function show(id, value) {
  document.getElementById(id).style.display = value ? 'block' : 'none'
}

onReady(function () {
  show('page', true)
  show('load', false)
})


window.addEventListener('DOMContentLoaded', async function () {

  if (localStorage.getItem('token')) {
    // if user is logged in, display buttons that only registered users can access
    checkLogin().then(response => {
      const myAccBtn = '<a href=\'dashboard.html\' style="color: white!important;">My Account</a>'
      document.getElementById('login').innerHTML = 'log out'
      document.getElementById('myAccount').insertAdjacentHTML('beforeend', myAccBtn)
      document.getElementById('login').addEventListener('click', () => {
        localStorage.removeItem('token')
      })
    })
      .catch(err => {
        // handles error
        showNotification('error', err.message)
      })
  }
  const overlayLoading = document.getElementById('loading')

  const getOrderHistory = async () => {
    getOrderID().then(async response => {
      if (response[0]) {} else {
        // displays when order history not found
        document.getElementById('all-orders').innerHTML = 'You have no order history'
      }
      for (let i = 0; i < response.length; i++) {
        const orders = response[i]

        const order = `
                <div class="order-header">
                <h3 id="order-id">Order ID - ${orders.id}</h3>
                <h3>${orders.total}<sup class='sub-script'> SGD </sup></h3>
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
            const orderDetails = response[i]
            const orderDetail = `<li>GAMEID: ${orderDetails.g_id} | GAMENAME: ${orderDetails.g_name} | AMOUNT: ${orderDetails.amount} </li>`
            document.getElementById(`${orders.id}-order-details`).insertAdjacentHTML('beforeend', orderDetail)
          }
        })
      }
    }).finally(res => {
      overlayLoading.hidden = true
    })
  }

  uidGenerate()// generate the uid for public
  // gets order history
  showCartAmount()// show the amount of cart
  getOrderHistory()

  getAllCategories().then(response => {
    // add first category list
    for (let i = 0; i < response.length; i++) {
      let string = `<li class="cat-content first-cat" id="${response[i].id}"><a href="/category.html?maincat=${encodeURI(response[i].category_name)}">${response[i].category_name}</a></li>`
      document.getElementById('first_cat').insertAdjacentHTML('beforeend', string)
      const category = `<option value='${response[i].category_name}'>${response[i].category_name}</option>`
      document.getElementById('dropDownCategory').insertAdjacentHTML('beforeend', category)
      if (!response[i].parent) break
      string = `<div class="cat-block" id="1-${response[i].id}"><ul>`
      // add second category list
      for (let j = 0; j < response[i].parent.length; j++) {
        string += `<li class="cat-content second-cat" id="1-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><a href="/category.html?platform=${encodeURI(response[i].parent[j].category_name)}">${response[i].parent[j].category_name}</a></li>`
        if (!response[i].parent[j].child) break
        let thirdstring = `<div class="cat-content third-cat cat-block" id="2-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><ul>`
        // add third category list
        for (let k = 0; k < response[i].parent[j].child.length; k++) {
          thirdstring += `<li><a href="/category.html?childcat=${encodeURI(response[i].parent[j].child[k].category_name)}">${response[i].parent[j].child[k].category_name}</a></li>`
        }
        thirdstring += '</ul></div>'
        document.getElementById('third_cat').insertAdjacentHTML('beforeend', thirdstring)
      }
      string += '</ul></div>'
      document.getElementById('second_cat').insertAdjacentHTML('beforeend', string)
    }
    addListener()// add the listeners
  }).catch(err => {
    showNotification('error', err.message)
  })
  
  function addListener () {
    const list = document.getElementsByClassName('cat-content')
    const first_cat = []
    const second_cat = []
    const third_cat = []
  
    Array.from(list).forEach(e => {
      if (e.classList.contains('first-cat')) {
        first_cat.push(e.id)
      } else if (e.classList.contains('second-cat')) {
        second_cat.push(e.id)
      } else {
        third_cat.push(e.id)
      }
    })
    Array.from(list).forEach(e => {
      if (e.classList.contains('first-cat')) {
        e.addEventListener('mouseover', function () {
          // if mouse enter the div start the time out
          // if the mouse did not leave within duration time then the category will show
          toFirst = setTimeout(() => {
            first_cat.forEach(id => {
              try {
                document.getElementById(`1-${id}`).style.display = 'none'
              } catch (e) { }
            })
            second_cat.forEach(id => {
              try {
                document.getElementById(`2-${id.substr(2)}`).style.display = 'none'
              } catch (e) { }
            })
            try {
              document.getElementById('bg').style.display = 'block'
              document.body.style.overflow = 'hidden'
              setTimeout(function () {
                document.getElementById('bg').style.opacity = '0.8'
              }, 0)
              Array.from(document.getElementsByClassName('img-second')).forEach(e => {
                e.style.display = 'block'
              })
              document.getElementById(`1-${e.id}`).style.display = 'block'
              Array.from(document.getElementsByClassName('img-second')).forEach(e => {
                e.style.display = 'none'
              })
              Array.from(document.getElementsByClassName('img-third')).forEach(e => {
                e.style.display = 'block'
              })
            } catch (e) { }
          }, duration)
        })
        e.addEventListener('mouseleave', function () {
          // clear the time out when mouse leave the div
          clearTimeout(toFirst)
        })
      }
      if (e.classList.contains('second-cat')) {
        e.addEventListener('mouseover', function () {
          // if mouse enter the div start the time out
          // if the mouse did not leave within duration time then the category will show
          toSecond = setTimeout(() => {
            second_cat.forEach(id => {
              try {
                document.getElementById(`2-${id.substr(2)}`).style.display = 'none'
              } catch (e) { }
            })
            try {
              document.getElementById(`2-${e.id.substr(2)}`).style.display = 'block'
              Array.from(document.getElementsByClassName('img-third')).forEach(e => {
                e.style.display = 'none'
              })
            } catch (e) { }
          }, duration)
        })
        e.addEventListener('mouseleave', function () {
          // clear the time out when mouse leave the div
          clearTimeout(toSecond)
        })
      }
    })
    document.getElementById('bg').addEventListener('mouseover', function () {
      setTimeout(() => {
        document.getElementById('bg').style.opacity = '0'
        document.getElementById('bg').style.display = 'none'
        document.body.style.overflow = 'auto'
        first_cat.forEach(id => {
          try {
            document.getElementById(`1-${id}`).style.display = 'none'
          } catch (e) {}
        })
        second_cat.forEach(id => {
          try {
            document.getElementById(`2-${id.substr(2)}`).style.display = 'none'
          } catch (e) {}
        })
        Array.from(document.getElementsByClassName('img-default')).forEach(e => {
          e.style.display = 'block'
        })
      }, duration)
    })
  }
  
  // When catdrop bar is clicked, displays the hidden div
  $('#catdrop').on('click', function () {
    const drop = $('#categ')
    if (drop.is(':visible')) {
      drop[0].style.display = 'none'
      $('#bg')[0].style.display = 'none'
    } else { drop[0].style.display = 'flex' }
  })

  function search () {
    const searchQuery = document.getElementById('searchProduct').value
    const categoryMain = document.getElementById('dropDownCategory').value
    let string = '?'
    if (searchQuery) {
      string += '&name=' + searchQuery
    }
  
    string += '&maincat=' + categoryMain
    location.href = '/category.html' + string
  }
  
  // function to show total amount of items in shopping cart
  function showCartAmount () {
    let string = 0
    getShoppingBadge().then(response => {
      for (let i = 0; i < response.length; i++) {
        string += response[i].amount
      }
      document.getElementById('shoppingCart').firstChild.textContent = `Shopping Cart - ${string}`
    })
  }
  document.getElementById('searchBtn').addEventListener('click', search)
  getSearchAC().then(response => {
    // get the auto complete source
    if (!response.length > 0) return

    const input = document.getElementById('searchProduct')

    // declare autocomplete
    autocomplete({
      minLength: 1,
      input: input,
      fetch: function (text, update) {
        text = text.toLowerCase().trim()
        const suggestions = response.filter(n => n.label.toLowerCase().startsWith(text) || n.des.toLowerCase().startsWith(text) || n.main_cat.toLowerCase().startsWith(text) || n.parent_cat.toLowerCase().startsWith(text) || n.child_cat.toLowerCase().startsWith(text))
        update(suggestions)
      },
      onSelect: function (item) {
        input.value = item.label
      }
    })
  })


})


function voice () {
  // start or stop voice recognition
  if (!recording) {
    recognition.start()
  } else {
    recognition.stop()
  }
  recording = !recording
  document.getElementById('start_img').src = recording ? '/images/mic-animate.gif' : '/images/mic.png'
}

recognition.onresult = function (event) {
  const input = document.getElementById('searchProduct')
  // console.log(event);
  let transcript = ''
  if (typeof (event.results) === 'undefined') {
    recognition.onend = null
    recognition.stop()
    return
  }
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    transcript += event.results[i][0].transcript
  }
  input.value = transcript// set the input box value
  // after the input value change dispatch an event to let the auto complete work
  input.dispatchEvent(new KeyboardEvent('keyup'))
}