
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
  // Get reference to relevant elements
  const gameName = document.getElementById('gameName')
  const gameDes = document.getElementById('gameDes')
  const gamePrice = document.getElementById('gamePrice')
  const gameDiscount = document.getElementById('gameDiscount')
  const mainCat = document.getElementById('mainCat')
  const secCat = document.getElementById('secCat')
  const thirdCat = document.getElementById('thirdCat')
  const gamePic = document.getElementById('gamePic')
  const saveGameBtn = document.getElementById('saveGame')
  const delGameBtn = document.getElementById('delGame')
  const region = document.getElementById('region')
  const showImg = document.getElementById('img')
  const params = new URLSearchParams(window.location.search)
  const uploadBtn = document.getElementById('uploadImg')
  const imageFile = document.getElementById('imgFile')
  let main = []
  let sec = []
  let third = []// array for categories

  $('#datepicker').datepicker({
    uiLibrary: 'bootstrap4'
  })// declare the datepicker

  await getAllCategory()
    .then((response) => {
      // set category options
      main = response.main
      sec = response.sub
      third = response.child
      main.forEach((e) => {
        const mainOp = document.createElement('option')
        mainOp.setAttribute('value', e.id)
        const t = document.createTextNode(e.category_name)
        mainOp.appendChild(t)
        mainCat.appendChild(mainOp)
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

  await getRegion()
    .then((result) => {
      // set the region options
      const regionData = result.result
      regionData.forEach((e) => {
        const regionOp = document.createElement('option')
        regionOp.setAttribute('value', e.id)
        const t = document.createTextNode(e.region_name)
        regionOp.appendChild(t)
        region.appendChild(regionOp)
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

  adminGetGame(params.get('id')).then((response) => {
    // get the game details and add it to the placeholder
    const game = response.result[0]
    // console.log(game);
    gameName.value = game.g_name
    region.value = game.g_region
    gameDes.value = game.g_description
    gamePic.value = game.g_image
    showImg.src = game.g_image
    gamePrice.value = game.g_price
    gameDiscount.value = game.g_discount
    mainCat.value = game.g_maincategory
    mainCatChange()
    secCat.value = game.g_parentsubcategory
    secCatChange()
    thirdCat.value = game.g_childsubcategory
    $('#datepicker').val(game.g_publishdate)
  })
  function mainCatChange () {
    // when main category change, change second category
    secCat.innerHTML = "<option value='0' selected>Second Category</option>"
    sec
      .filter((e) => e.fk_main == mainCat.value)
      .forEach((e) => {
        const secOp = document.createElement('option')// create option
        secOp.setAttribute('value', e.id)// value
        const t = document.createTextNode(e.category_name)// name
        secOp.appendChild(t)
        secCat.appendChild(secOp)
      })
    secCatChange()// change third category
  }

  function secCatChange () {
    // when sec category change, change third category
    thirdCat.innerHTML = "<option value='0' selected>Third Category</option>"
    third
      .filter((e) => e.fk_parent == secCat.value)
      .forEach((e) => {
        const thirdOp = document.createElement('option')// create option
        thirdOp.setAttribute('value', e.id)// value
        const t = document.createTextNode(e.category_name)// name
        thirdOp.appendChild(t)
        thirdCat.appendChild(thirdOp)
      })
  }
  mainCat.onchange = () => {
    mainCatChange()
  }
  secCat.onchange = () => {
    secCatChange()
  }
  thirdCat.onchange = () => {
    console.log(thirdCat.value)
  }

  gamePrice.onchange = () => {
    try {
      if (gamePrice.value <= 0) {
        gamePrice.value = 1// if game price below 0 or is 0 then game price is 1
      }
      gamePrice.value = Number.parseFloat(gamePrice.value).toFixed(2)
    } catch (err) {
      gamePrice.value = 0.0
    }
  }

  gamePic.onchange = () => {
    showImg.src = `${gamePic.value.trim()}?${Math.random()}`// display the preview image
  }

  gameDiscount.onchange = () => {
    try {
      if (!gamePrice.value) {
        gamePrice.value = 1// if game price does not exist set it to 1
      }
      if (gameDiscount.value < 0 || gameDiscount.value >= gamePrice.value) {
        gameDiscount.value = gamePrice.value// if game discount is more than game price or below 0 set it to game price
      }
      gameDiscount.value = Number.parseFloat(gameDiscount.value).toFixed(2)
    } catch (err) {
      gameDiscount.value = 0.0
    }
  }

  saveGameBtn.onclick = () => {
    // save game
    saveGameBtn.disabled = true
    if (
      !gameName.value.trim() ||
      !gameDes.value.trim() ||
      !gamePic.value.trim() ||
      !gamePrice.value ||
      gamePrice.value == 0 ||
      gameDiscount.value < 0 ||
      gameDiscount.value > gamePrice.value ||
      mainCat.value == 0 ||
      secCat.value == 0 ||
      thirdCat.value == 0 ||
      region.value == 0 ||
      !$('#datepicker').val()
    ) {
      new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: 'Please check your input'
      }).show()
      saveGameBtn.disabled = false
    } else {
      saveGame(
        {
          gameName: gameName.value.trim(),
          gameDes: gameDes.value.trim(),
          gamePic: gamePic.value.trim(),
          gamePrice: gamePrice.value,
          gameDiscount: gameDiscount.value,
          mainCat: mainCat.value,
          secCat: secCat.value,
          thirdCat: thirdCat.value,
          region: region.value,
          date: $('#datepicker').val()
        },
        params.get('id')
      )
        .then((response) => {
          console.log(response)
          if (response.success) {
            new Noty({
              type: 'success',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '6000',
              text: 'Success save game'
            }).show()
            showImg.src = `${gamePic.value.trim()}?${Math.random()}`
            saveGameBtn.disabled = false
          } else {
            new Noty({
              type: 'error',
              layout: 'topCenter',
              theme: 'sunset',
              timeout: '6000',
              text: response
            }).show()
            saveGameBtn.disabled = false
          }
        })
        .catch((err) => {
          console.log(err)
          new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: err.message
          }).show()
          saveGameBtn.disabled = false
        })
    }
  }

  delGameBtn.onclick = () => {
    // delete game
    var n = new Noty({
      text: 'Do you want to continue?',
      theme: 'sunset',
      buttons: [
        Noty.button(
          'YES',
          'btn btn-success',
          function () {
            console.log('button 1 clicked')
            n.close()
            delegame()
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

  function delegame () {
    // delete game
    delGameBtn.disabled = true
    delGame(params.get('id'))
      .then((response) => {
        console.log(response)
        if (response.success) {
          new Noty({
            type: 'success',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: 'Success delete game'
          })
            .on('onClose', () => {
              window.location = document.referrer
            })
            .show()
          delGameBtn.disabled = false
        } else {
          new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '6000',
            text: response
          }).show()
          delGameBtn.disabled = false
        }
      })
      .catch((err) => {
        console.log(err)
        new Noty({
          type: 'error',
          layout: 'topCenter',
          theme: 'sunset',
          timeout: '6000',
          text: err.message
        }).show()
        delGameBtn.disabled = false
      })
  }

  uploadBtn.onclick = () => {
    imageFile.click()// show upload file ui
  }

  imageFile.onchange = async () => {
    try {
      const files = imageFile.files
      const file = files[0]
      const originUrl = gamePic.value.trim()// if the game picture url exist
      if (file == null) {
        return new Noty({
          type: 'error',
          layout: 'topCenter',
          theme: 'sunset',
          timeout: '6000',
          text: 'No file selected'
        }).show()
      }
      const signRequest = await getSignedRequest(file, originUrl).then((res) => res.result)// get the signRequest to upload file to aws s3 bucket
      const changedFile = file.slice(0, file.size, signRequest.fileType)
      newFile = new File([changedFile], signRequest.fileName, { type: signRequest.fileType })// change the file name
      const uploadStatus = await uploadFile(newFile, signRequest.signedRequest)// upload file to aws s3 bucket
      if (uploadStatus == 200) {
        new Noty({
          type: 'success',
          layout: 'topCenter',
          theme: 'sunset',
          timeout: '6000',
          text: 'Upload success'
        }).show()
        showImg.src = `${signRequest.url}?${Math.random()}`// show the image
        gamePic.value = signRequest.url
      } else {
        return new Noty({
          type: 'error',
          layout: 'topCenter',
          theme: 'sunset',
          timeout: '6000',
          text: 'Upload unsuccess'
        }).show()
      }
    } catch (err) {
      console.log(err)
      return new Noty({
        type: 'error',
        layout: 'topCenter',
        theme: 'sunset',
        timeout: '6000',
        text: err
      }).show()
    }
  }
})
