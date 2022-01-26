window.addEventListener("DOMContentLoaded", async function () {
  // Get reference to relevant elements
  const gameName = document.getElementById("gameName");
  const gameDes = document.getElementById("gameDes");
  const gamePrice = document.getElementById("gamePrice");
  const gameDiscount = document.getElementById("gameDiscount");
  const mainCat = document.getElementById("mainCat");
  const secCat = document.getElementById("secCat");
  const thirdCat = document.getElementById("thirdCat");
  const gamePic = document.getElementById("gamePic");
  const addGameBtn = document.getElementById("addGame");
  const region = document.getElementById("region");
  const showImg = document.getElementById("img");
  const uploadBtn = document.getElementById("uploadImg");
  const imageFile = document.getElementById("imgFile");

  let main = [],
    sec = [],
    third = [];//array for categories

  $("#datepicker").datepicker({
    uiLibrary: "bootstrap4",
  });//declare the datepicker

  await getAllCategory()
    .then((response) => {
      main = response.main;
      sec = response.sub;
      third = response.child;
      main.forEach((e) => {
        let mainOp = document.createElement("option");//create option
        mainOp.setAttribute("value", e.id);//value
        let t = document.createTextNode(e.category_name);//name
        mainOp.appendChild(t);
        mainCat.appendChild(mainOp);
      });
    })
    .catch((err) => {
      new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: err,
      }).show();
    });

  await getRegion()
    .then((result) => {
      let regionData = result.result;
      regionData.forEach((e) => {
        let regionOp = document.createElement("option");//create option
        regionOp.setAttribute("value", e.id);//value
        let t = document.createTextNode(e.region_name);//name
        regionOp.appendChild(t);
        region.appendChild(regionOp);
      });
    })
    .catch((err) => {
      new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: err,
      }).show();
    });
  function mainCatChange() {
    //when main category change, change second category
    secCat.innerHTML = "<option value='0' selected>Second Category</option>";
    sec
      .filter((e) => e.fk_main == mainCat.value)
      .forEach((e) => {
        let secOp = document.createElement("option");//create option
        secOp.setAttribute("value", e.id);//value
        let t = document.createTextNode(e.category_name);//name
        secOp.appendChild(t);
        secCat.appendChild(secOp);
      });
    secCatChange();//change third category
  }

  function secCatChange() {
    //when sec category change, change third category
    thirdCat.innerHTML = "<option value='0' selected>Third Category</option>";
    third
      .filter((e) => e.fk_parent == secCat.value)
      .forEach((e) => {
        let thirdOp = document.createElement("option");//create option
        thirdOp.setAttribute("value", e.id);//value
        let t = document.createTextNode(e.category_name);//name
        thirdOp.appendChild(t);
        thirdCat.appendChild(thirdOp);
      });
  }
  mainCat.onchange = () => {
    mainCatChange();
  };
  secCat.onchange = () => {
    secCatChange();
  };
  thirdCat.onchange = () => {
    console.log(thirdCat.value);
  };

  gamePrice.onchange = () => {
    try {
      if (gamePrice.value <= 0) {
        gamePrice.value = 1;//if game price below 0 or is 0 then game price is 1
      }
      gamePrice.value = Number.parseFloat(gamePrice.value).toFixed(2);
    } catch (err) {
      gamePrice.value = 0.0;
    }
  };
  gameDiscount.onchange = () => {
    try {
      if (!gamePrice.value) {
        gamePrice.value = 1;//if game price does not exist set it to 1
      }
      if (gameDiscount.value < 0 || gameDiscount.value >= gamePrice.value) {
        gameDiscount.value = gamePrice.value;//if game discount is more than game price or below 0 set it to game price
      }
      gameDiscount.value = Number.parseFloat(gameDiscount.value).toFixed(2);
    } catch (err) {
      gameDiscount.value = 0.0;
    }
  };

  gamePic.onchange = () => {
    showImg.src = gamePic.value.trim();//display the preview image
  };

  addGameBtn.onclick = () => {
    //add game
    addGameBtn.disabled = true;
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
      !$("#datepicker").val()
    ) {
      new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: "Please check your input",
      }).show();
      addGameBtn.disabled = false;
    } else {
      addGame({
        gameName: gameName.value.trim(),
        gameDes: gameDes.value.trim(),
        gamePic: gamePic.value.trim(),
        gamePrice: gamePrice.value,
        gameDiscount: gameDiscount.value,
        mainCat: mainCat.value,
        secCat: secCat.value,
        thirdCat: thirdCat.value,
        region: region.value,
        date: $("#datepicker").val(),
      })
        .then((response) => {
          console.log(response);
          if (response.success) {
            new Noty({
              type: "success",
              layout: "topCenter",
              theme: "sunset",
              timeout: "6000",
              text: "Success add game",
            }).show();
            addGameBtn.disabled = false;
          } else {
            new Noty({
              type: "error",
              layout: "topCenter",
              theme: "sunset",
              timeout: "6000",
              text: response,
            }).show();
            addGameBtn.disabled = false;
          }
        })
        .catch((err) => {
          console.log(err);
          new Noty({
            type: "error",
            layout: "topCenter",
            theme: "sunset",
            timeout: "6000",
            text: err.message,
          }).show();
          addGameBtn.disabled = false;
        });
    }
  };

  uploadBtn.onclick = () => {
    imageFile.click();//show upload file ui
  };

  imageFile.onchange = async () => {
    try {
      const files = imageFile.files;
      const file = files[0];
      const originUrl = gamePic.value.trim();//if the game picture url exist
      if (file == null) {
        return new Noty({
          type: "error",
          layout: "topCenter",
          theme: "sunset",
          timeout: "6000",
          text: "No file selected",
        }).show();
      }
      let signRequest = await getSignedRequest(file, originUrl).then((res) => res.result);//get the signRequest to upload file to aws s3 bucket
      var changedFile = file.slice(0, file.size, signRequest.fileType);
      newFile = new File([changedFile], signRequest.fileName, {type: signRequest.fileType});//change the file name
      let uploadStatus = await uploadFile(newFile, signRequest.signedRequest);//upload file to aws s3 bucket
      if(uploadStatus==200){
        new Noty({
          type: "success",
          layout: "topCenter",
          theme: "sunset",
          timeout: "6000",
          text: "Upload success",
        }).show();
        showImg.src = `${signRequest.url}?${Math.random()}`;//show the image
        gamePic.value = signRequest.url;
      }else{
        return new Noty({
          type: "error",
          layout: "topCenter",
          theme: "sunset",
          timeout: "6000",
          text: "Upload unsuccess",
        }).show();
      }
    } catch (err) {
      console.log(err);
      return new Noty({
        type: "error",
        layout: "topCenter",
        theme: "sunset",
        timeout: "6000",
        text: err,
      }).show();
    }
  };
});
