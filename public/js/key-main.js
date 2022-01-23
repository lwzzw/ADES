window.addEventListener('DOMContentLoaded', function () {
    getKeys().then(keys => {
        let string = '';
        for(var i = 0; i< keys.length; i++){
          string += `
          <li>
              <div class="individual-key">
                  <div>Game Name:</h6> ${keys[i].g_name}</div>
                  <div>Steam Key:</h6> ${keys[i].key}</div>
              </div>
              <br><br>
              </li>`
        }
        if(keys.length > 0){
            document.getElementById("nokeys").remove();
            document.getElementById("keys").insertAdjacentHTML("beforeend", string);
        }
    })

    
})