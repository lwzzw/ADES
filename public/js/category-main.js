const duration = 250
let toFirst, toSecond
const recognition = new webkitSpeechRecognition()
let recording = false
const params = new URLSearchParams(window.location.search)
let min = params.get('minprice') || 0, max = params.get('maxprice') || 0
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
  }).show()
}
window.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('token')) {
    checkLogin()
      .then((response) => {
        const myAccBtn = '<a href=\'dashboard.html\' style="color: white!important;">My Account</a>'
        document.getElementById('login').innerHTML = 'log out'// if login set button to log out
        document
          .getElementById('myAccount')
          .insertAdjacentHTML('beforeend', myAccBtn)
        document.getElementById('login').addEventListener('click', () => {
          localStorage.removeItem('token')
        })
      })
      .catch((err) => {
        new Noty({
          type: 'error',
          layout: 'topCenter',
          theme: 'sunset',
          timeout: '6000',
          text: 'Your session has expired, please login again'
        }).show()
        localStorage.removeItem('token')
        document.getElementById('login').innerHTML = 'Login'
      })
  }
  $('#categ')[0].style.display = 'none'
  uidGenerate()// generate the uid for public
  showCartAmount()// show the amount of cart
  getAllCategories()
    .then((response) => {
      // add first category list
      for (let i = 0; i < response.length; i++) {
        let string = `<li class="cat-content first-cat" id="${
          response[i].id
        }"><a href="/category.html?maincat=${encodeURI(
          response[i].category_name
        )}">${response[i].category_name}</a></li>`
        document
          .getElementById('first_cat')
          .insertAdjacentHTML('beforeend', string)
        const category = `<option value='${response[i].category_name}'>${response[i].category_name}</option>`
        document
          .getElementById('dropDownCategory')
          .insertAdjacentHTML('beforeend', category)
        if (!response[i].parent) break
        string = `<div class="cat-block" id="1-${response[i].id}"><ul>`
        // add second category list
        for (let j = 0; j < response[i].parent.length; j++) {
          string += `<li class="cat-content second-cat" id="1-${
            response[i].parent[j].fk_main
          }-${
            response[i].parent[j].id
          }"><a href="/category.html?platform=${encodeURI(
            response[i].parent[j].category_name
          )}">${response[i].parent[j].category_name}</a></li>`
          if (!response[i].parent[j].child) break
          let thirdstring = `<div class="cat-content third-cat cat-block" id="2-${response[i].parent[j].fk_main}-${response[i].parent[j].id}"><ul>`
          // add third category list
          for (let k = 0; k < response[i].parent[j].child.length; k++) {
            thirdstring += `<li><a href="/category.html?childcat=${encodeURI(
              response[i].parent[j].child[k].category_name
            )}">${response[i].parent[j].child[k].category_name}</a></li>`
          }
          thirdstring += '</ul></div>'
          document
            .getElementById('third_cat')
            .insertAdjacentHTML('beforeend', thirdstring)
        }
        string += '</ul></div>'
        document
          .getElementById('second_cat')
          .insertAdjacentHTML('beforeend', string)
      }
      addListener()// add the listeners
    })
    .catch((err) => {
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: err
      }).show()
    })

  if (params.get('maincat')) {
    getCategoryCount(params.get('maincat') || null)
      .then((response) => {
        // display category count
        if (!response) return
        if (response.length <= 0) {
          document.getElementById('category').style.display = 'none'
        }
        for (let i = 0; i < response.length; i++) {
          const string = `<li class="child"><a>${response[i].category_name}</a><span>${response[i].count}</span></li>`
          document
            .getElementById('category_list')
            .insertAdjacentHTML('beforeend', string)
        }
        showlm()// show (less/more)
        document.getElementById('showmore').addEventListener('click', () => {
          showlm()
        })
        Array.from(document.getElementsByClassName('child')).forEach((e) => {
          e.addEventListener('click', () => {
            params.set('platform', e.firstChild.textContent)
            params.set('page', 1)
            showGame()
          })
        })
      })
      .catch((err) => {
        new Noty({
          type: 'error',
          layout: 'topCenter',
          theme: 'sunset',
          timeout: '6000',
          text: err
        }).show()
      })
  } else if (params.get('platform')) {
    getCategoryCountByPlatform(params.get('platform') || null)
      .then((response) => {
        // get the platform/second category count
        if (!response) return
        if (response.length <= 0) {
          document.getElementById('category').style.display = 'none'
        }
        for (let i = 0; i < response.length; i++) {
          const string = `<li class="child"><a>${response[i].category_name}</a><span>${response[i].count}</span></li>`
          document
            .getElementById('category_list')
            .insertAdjacentHTML('beforeend', string)
        }
        showlm()
        document.getElementById('showmore').addEventListener('click', () => {
          showlm()
        })
        Array.from(document.getElementsByClassName('child')).forEach((e) => {
          e.addEventListener('click', () => {
            params.set('childcat', e.firstChild.textContent)
            params.set('page', 1)
            showGame()
          })
        })
      })
      .catch((err) => {
        new Noty({
          type: 'error',
          layout: 'topCenter',
          theme: 'sunset',
          timeout: '6000',
          text: err
        }).show()
      })
  }

  // get the data again when user change the sort select
  document.getElementById('sort').addEventListener('change', () => {
    const sort = document.getElementById('sort').value
    params.set('sort', sort)
    params.set('page', 1)
    showGame()
  })

  document.getElementById('pinput_min').addEventListener('change', () => {
    min = $('#pinput_min').val()
    (min * 1 > max * 1) && max != 0 ? (max = min) : ""
    priceChange()
  })

  document.getElementById('pinput_max').addEventListener('change', () => {
    max = $('#pinput_max').val()
    (max * 1 < min * 1) && max != 0 ? (min = max) : ""
    priceChange()
  })

  document.getElementById('ppage').addEventListener('click', () => {
    document.getElementById('ppage').disabled = true
    let page = params.get('page') || 1
    page--
    page < 1 ? (page = 1) : page
    params.set('page', page)
    showGame()
  })

  document.getElementById('npage').addEventListener('click', () => {
    document.getElementById('npage').disabled = true
    let page = params.get('page') || 1
    page++
    page < 1 ? (page = 1) : page
    params.set('page', page)
    showGame()
  })
  showGame()
  document.getElementById('searchBtn').addEventListener('click', search)

  getSearchAC().then((response) => {
    // get the search auto complete source
    console.log(response)
    if (!response.length > 0) return

    const input = document.getElementById('searchProduct')

    // declare autocomplete
    autocomplete({
      minLength: 1,
      input: input,
      fetch: function (text, update) {
        text = text.toLowerCase()
        const suggestions = response.filter(
          (n) =>
            n.label.toLowerCase().startsWith(text) ||
            n.des.toLowerCase().startsWith(text) ||
            n.main_cat.toLowerCase().startsWith(text) ||
            n.parent_cat.toLowerCase().startsWith(text) ||
            n.child_cat.toLowerCase().startsWith(text)
        )
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
  document.getElementById('start_img').src = recording
    ? '/images/mic-animate.gif'
    : '/images/mic.png'
}

recognition.onresult = function (event) {
  const input = document.getElementById('searchProduct')
  let transcript = ''
  if (typeof event.results === 'undefined') {
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

function priceChange () {
  if (min && min != 0) params.set('minprice', min)
  if (max && max != 0) params.set('maxprice', max)
  params.set('page', 1)

  showGame()
}

function showGame () {
  // show the game
  $('#pinput_max').val(params.get('maxprice'))
  $('#pinput_min').val(params.get('minprice'))
  $('#sort').val(params.get('sort') || 'default')
  $('#searchProduct').val(params.get('name'))
  $('#dropDownCategory').val(params.get('maincat'))
  window.history.pushState(
    {
      page: 'same'
    },
    'same page',
    'category.html?' + params.toString()
  )
  getGames(params.toString())
    .then((response) => {
      document.getElementById('game_content').innerHTML = ''
      response.forEach((data) => {
        const string = `
                        <li>
                            <a href="/game.html?id=${data.g_id}">
                                <div class="game-container" style="height:410px;">
                                    <img class="game-image" 
                                        src="${
                                          data.g_image
                                        }" onerror="this.onerror=null;this.src='/images/noimage.png';">
                                </div>

                                <div style="display: -webkit-box; max-width: 400px; height: 50px; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                                  ${data.g_name}
                                </div>

                                <div>
                                    ${
                                      data.g_discount
                                        ? `${
                                            data.g_discount
                                          }<sup class='sub-script'> SGD </sup><br><span class='slash-price'>${
                                            data.g_price
                                          }</span><sup class='sub-script-striked'> SGD </sup><span class='discount-percentage'> -${discountPercentage(
                                            data.g_price,
                                            data.g_discount
                                          )}%</span>`
                                        : `${data.g_price}<sup class='sub-script'> SGD </sup>`
                                    }
                                </div>
                            </a>
                        </li>
                                `
        document
          .getElementById('game_content')
          .insertAdjacentHTML('beforeend', string)
      })
      document.getElementById('npage').disabled = true
      document.getElementById('ppage').disabled = true
      const pageNum = params.get('page') || 1
      // if next page got no game then disable the next page button
      getPageCount(params.toString()).then((result) => {
        if (pageNum * 18 < parseInt(result[0].count)) {
          document.getElementById('npage').disabled = false
        }
      })
      // if previous page is 0 then disable the previous page button
      if (pageNum > 1) {
        document.getElementById('ppage').disabled = false
      }
      window.scrollTo(0, 0)// scroll to top
    })
    .catch((err) => {
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: err
      }).show()
    })
}

// Calculates discount percentage
function discountPercentage (originalPrice, discountedPrice) {
  return parseFloat(
    (100 * (originalPrice - discountedPrice)) / originalPrice
  ).toFixed(0)
}

function addListener () {
  // add the event listener
  const list = document.getElementsByClassName('cat-content')
  const first_cat = []
  const second_cat = []
  const third_cat = []

  Array.from(list).forEach((e) => {
    if (e.classList.contains('first-cat')) {
      first_cat.push(e.id)
    } else if (e.classList.contains('second-cat')) {
      second_cat.push(e.id)
    } else {
      third_cat.push(e.id)
    }
  })
  Array.from(list).forEach((e) => {
    if (e.classList.contains('first-cat')) {
      e.addEventListener('mouseover', function () {
        // if mouse enter the div start the time out
        // if the mouse did not leave within duration time then the category will show
        toFirst = setTimeout(() => {
          first_cat.forEach((id) => {
            try {
              document.getElementById(`1-${id}`).style.display = 'none'
            } catch (e) {}
          })
          second_cat.forEach((id) => {
            try {
              document.getElementById(`2-${id.substr(2)}`).style.display =
                'none'
            } catch (e) {}
          })
          try {
            document.getElementById('bg').style.display = 'block'
            document.body.style.overflow = 'hidden'
            setTimeout(function () {
              document.getElementById('bg').style.opacity = '0.8'
            }, 0)
            Array.from(document.getElementsByClassName('img-second')).forEach(
              (e) => {
                e.style.display = 'block'
              }
            )
            document.getElementById(`1-${e.id}`).style.display = 'block'
            Array.from(document.getElementsByClassName('img-second')).forEach(
              (e) => {
                e.style.display = 'none'
              }
            )
            Array.from(document.getElementsByClassName('img-third')).forEach(
              (e) => {
                e.style.display = 'block'
              }
            )
          } catch (e) {}
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
          second_cat.forEach((id) => {
            try {
              document.getElementById(`2-${id.substr(2)}`).style.display =
                'none'
            } catch (e) {}
          })
          try {
            document.getElementById(`2-${e.id.substr(2)}`).style.display =
              'block'
            Array.from(document.getElementsByClassName('img-third')).forEach(
              (e) => {
                e.style.display = 'none'
              }
            )
          } catch (e) {}
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

function showlm () {
  const cat = document.getElementById('category')
  const cat_list = cat.querySelectorAll('.child')
  const num = cat_list.length
  for (let i = 0; i < num; i++) {
    // display only five cat list
    if (i < 5) {
      cat_list[i].style.display = 'flex'
    } else {
      cat_list[i].style.display != 'none'
        ? (cat_list[i].style.display = 'none')
        : (cat_list[i].style.display = 'flex')
    }
  }
  document.getElementById('showmore').textContent == 'Show More'
    ? (document.getElementById('showmore').textContent = 'Show Less')
    : (document.getElementById('showmore').textContent = 'Show More')
  if (num < 5) {
    // if the number is less than 5 then set the content to empty
    document.getElementById('showmore').textContent = ''
  }
}

$('#catdrop').on('click', function () {
  const drop = $('#categ')
  if (drop.is(':visible')) {
    drop[0].style.display = 'none'
    $('#bg')[0].style.display = 'none'
  } else drop[0].style.display = 'flex'
})

function search () {
  const searchQuery = document.getElementById('searchProduct').value
  const categoryMain = document.getElementById('dropDownCategory').value
  params.set('name', searchQuery)
  if (categoryMain) params.set('maincat', categoryMain)
  params.set('page', 1)
  showGame()
}

function showCartAmount () {
  let string = 0
  getShoppingBadge().then((response) => {
    for (let i = 0; i < response.length; i++) {
      string += response[i].amount
    }
    document.getElementById(
      'shoppingCart'
    ).firstChild.textContent = `Shopping Cart - ${string}`
  })
}
