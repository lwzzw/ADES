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


window.addEventListener('DOMContentLoaded', function () {
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
  uidGenerate()// generate the uid for public
  showCartAmount()// show the amount of cart
  displayCart()

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
const pricearr = []
const id = []

function count () {
  let price = 0
  $('.qty').each(function (index) {
    price += this.value * pricearr[index]
  })
  $('#p').empty().append('Total price: <b>' + price.toFixed(2) + '</b>')
}

function displayCart () {
  getShoppingCart().then(result => {
    document.getElementById('cart').innerHTML = ''
    result.cart.forEach(cart => {
      id.push(cart.game_id)
      const string = `
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
                                    <h6><strong><span class="text-muted price">${cart.g_discount ? cart.g_discount : cart.g_price}SGD</span></strong></h6>
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
      document.getElementById('cart').insertAdjacentHTML('beforeend', string)
    })
    $('.price').each(function () {
      pricearr.push(parseFloat(this.innerText.replace('SGD', '').trim()))
    })
    count()
  })
}

// save the cart
function saveCart () {
  // document.getElementById("update").disabled = true;
  const cartArr = []
  for (let i = 0; i < id.length; i++) {
    cartArr.push({
      id: id[i],
      amount: $(`#amount-${id[i]}`).val()
    })
  }
  addShoppingCart(cartArr, 'true').then(result => {
    // alert("Save cart");
    // document.getElementById("update").disabled = false;
  }).catch(err => {
    console.log(err)
    // document.getElementById("update").disabled = false;
  })
}

// delete cart
function delete_cart (id) {
  const n = new Noty({
    text: 'Do you want to delete item from cart ?',
    theme: 'sunset',
    buttons: [
      Noty.button(
        'YES',
        'btn btn-success',
        function () {
          console.log('button 1 clicked')
          n.close()
          deleteCart(id).then(result => {
            // alert(err)
            new Noty({
              type: 'success',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '6000',
              text: 'Delete success'
            })
              .show()
            displayCart()
          }).catch(err => {
            // alert(err)
            new Noty({
              type: 'error',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '6000',
              text: err
            })
              .show()
          })
        },
        { id: 'button1', 'data-status': 'ok' }
      ),

      Noty.button('NO', 'btn btn-danger', function () {
        console.log('button 2 clicked')
        n.close()
      })
    ]
  })
  n.show()
}

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