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

  let main = [],
    sec = [],
    third = [];

  $("#datepicker").datepicker({
    uiLibrary: "bootstrap4",
  });

  await getAllCategory()
    .then((response) => {
      main = response.main;
      sec = response.sub;
      third = response.child;
      main.forEach((e) => {
        let mainOp = document.createElement("option");
        mainOp.setAttribute("value", e.id);
        let t = document.createTextNode(e.category_name);
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
      console.log(result);
      let regionData = result.result;
      regionData.forEach((e) => {
        let regionOp = document.createElement("option");
        regionOp.setAttribute("value", e.id);
        let t = document.createTextNode(e.region_name);
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
    secCat.innerHTML = "<option value='0' selected>Second Category</option>";
    sec
      .filter((e) => e.fk_main == mainCat.value)
      .forEach((e) => {
        let secOp = document.createElement("option");
        secOp.setAttribute("value", e.id);
        let t = document.createTextNode(e.category_name);
        secOp.appendChild(t);
        secCat.appendChild(secOp);
      });
    secCatChange();
  }

  function secCatChange() {
    thirdCat.innerHTML = "<option value='0' selected>Third Category</option>";
    third
      .filter((e) => e.fk_parent == secCat.value)
      .forEach((e) => {
        let thirdOp = document.createElement("option");
        thirdOp.setAttribute("value", e.id);
        let t = document.createTextNode(e.category_name);
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
        gamePrice.value = 1;
      }
      gamePrice.value = Number.parseFloat(gamePrice.value).toFixed(2);
    } catch (err) {
      gamePrice.value = 0.0;
    }
  };
  gameDiscount.onchange = () => {
    try {
      if (!gamePrice.value) {
        gamePrice.value = 1;
      }
      if (gameDiscount.value < 0 || gameDiscount.value >= gamePrice.value) {
        gameDiscount.value = gamePrice.value;
      }
      gameDiscount.value = Number.parseFloat(gameDiscount.value).toFixed(2);
    } catch (err) {
      gameDiscount.value = 0.0;
    }
  };

  addGameBtn.onclick = () => {
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
});
