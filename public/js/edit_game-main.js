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
  const saveGameBtn = document.getElementById("saveGame");
  const delGameBtn = document.getElementById("delGame");
  const region = document.getElementById("region");
  const img = document.getElementById("img");
  const params = new URLSearchParams(window.location.search);
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

  adminGetGame(params.get("id")).then((response) => {
    const game = response.result[0];
    // console.log(game);
    gameName.value = game.g_name;
    region.value = game.g_region;
    gameDes.value = game.g_description;
    gamePic.value = game.g_image;
    img.src = game.g_image;
    gamePrice.value = game.g_price;
    gameDiscount.value = game.g_discount;
    mainCat.value = game.g_maincategory;
    mainCatChange();
    secCat.value = game.g_parentsubcategory;
    secCatChange();
    thirdCat.value = game.g_childsubcategory;
    $("#datepicker").val(game.g_publishdate);
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

  saveGameBtn.onclick = () => {
    saveGameBtn.disabled = true;
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
      saveGameBtn.disabled = false;
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
          date: $("#datepicker").val(),
        },
        params.get("id")
      )
        .then((response) => {
          console.log(response);
          if (response.success) {
            new Noty({
              type: "success",
              layout: "topCenter",
              theme: "sunset",
              timeout: "6000",
              text: "Success save game",
            }).show();
            img.src = gamePic.value.trim();
            saveGameBtn.disabled = false;
          } else {
            new Noty({
              type: "error",
              layout: "topCenter",
              theme: "sunset",
              timeout: "6000",
              text: response,
            }).show();
            saveGameBtn.disabled = false;
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
          saveGameBtn.disabled = false;
        });
    }
  };

  delGameBtn.onclick = () => {
    var n = new Noty({
      text: "Do you want to continue?",
      theme: "sunset",
      buttons: [
        Noty.button(
          "YES",
          "btn btn-success",
          function () {
            console.log("button 1 clicked");
            n.close();
            delegame();
          },
          { id: "button1", "data-status": "ok" }
        ),

        Noty.button("NO", "btn btn-error", function () {
          console.log("button 2 clicked");
          n.close();
        }),
      ],
    });
    n.show();
  };

  function delegame() {
    delGameBtn.disabled = true;
    delGame(params.get("id"))
      .then((response) => {
        console.log(response);
        if (response.success) {
          new Noty({
            type: "success",
            layout: "topCenter",
            theme: "sunset",
            timeout: "6000",
            text: "Success delete game",
          })
            .on("onClose", () => {
              window.location = document.referrer;
            })
            .show();
          delGameBtn.disabled = false;
        } else {
          new Noty({
            type: "error",
            layout: "topCenter",
            theme: "sunset",
            timeout: "6000",
            text: response,
          }).show();
          delGameBtn.disabled = false;
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
        delGameBtn.disabled = false;
      });
  }
});
