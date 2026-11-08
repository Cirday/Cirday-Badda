/* Goobta: khaanad qofku ka doorto meesha uu joogo. Waxay ku kaydsantaa "cirday-dayax-loc",
   oo ay wada isticmaalaan dhammaan bogagga Kal-tirsiyada Soomaalida. */
(function(){
  var KEY = "cirday-dayax-loc";
  var GROUPS = [
    ["Soomaaliya", [
      ["Muqdisho", 2.046, 45.318], ["Hargeysa", 9.560, 44.065], ["Boosaaso", 11.285, 49.182], ["Berbera", 10.435, 45.016],
      ["Garoowe", 8.406, 48.483], ["Gaalkacyo", 6.769, 47.431], ["Kismaayo", -0.358, 42.546], ["Baydhabo", 3.114, 43.649],
      ["Beledweyne", 4.736, 45.204], ["Burco", 9.522, 45.534], ["Laascaanood", 8.476, 47.360], ["Ceerigaabo", 10.616, 47.369],
      ["Boorama", 9.936, 43.183], ["Caluula", 11.963, 50.758], ["Qandala", 11.474, 49.872], ["Hobyo", 5.351, 48.527],
      ["Dhuusamareeb", 5.535, 46.386], ["Jowhar", 2.782, 45.500], ["Marka", 1.714, 44.770], ["Baraawe", 1.113, 44.030],
      ["Ceelwaaq", 2.800, 41.000], ["Garbahaarey", 3.327, 42.221], ["Xudur", 4.121, 43.888], ["Buulobarde", 3.852, 45.567]
    ]],
    ["Geeska Afrika", [
      ["Jabuuti", 11.589, 43.145], ["Jigjiga", 9.350, 42.800], ["Godey", 5.952, 43.552], ["Qabridahare", 6.739, 44.267],
      ["Diridhabe", 9.593, 41.866], ["Addis Ababa", 9.030, 38.740], ["Nayroobi", -1.286, 36.817], ["Gaarisa", -0.453, 39.646],
      ["Wajeer", 1.748, 40.057], ["Mandheera (Kenya)", 3.937, 41.856], ["Mombasa", -4.043, 39.668]
    ]],
    ["Carabta", [
      ["Buraydah", 26.330, 43.970], ["Riyaad", 24.713, 46.675], ["Jiddah", 21.485, 39.193], ["Makka", 21.389, 39.858],
      ["Madiina", 24.470, 39.611], ["Dammaam", 26.420, 50.088], ["Cadan", 12.786, 45.019], ["Sanca", 15.369, 44.191],
      ["Doha", 25.285, 51.531], ["Kuwayt", 29.376, 47.977]
    ]]
  ];
  function get(){ try{ var v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v && isFinite(v.lat) && isFinite(v.lon)) return v; }catch(e){} return {lat:26.33, lon:43.97, name:"Buraydah"}; }
  function set(l){ try{ localStorage.setItem(KEY, JSON.stringify(l)); }catch(e){} if (typeof window.cirdayGoob === "function") window.cirdayGoob(l); else location.reload(); }
  var css = document.createElement("style");
  css.textContent = ".goob{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:.9rem}" +
    ".goob label{color:#93A0BD;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase}" +
    ".goob select,.goob button{font:inherit;color:#E8ECF5;background:#18223D;border:1px solid #26324F;border-radius:8px;padding:6px 10px;max-width:100%}" +
    ".goob button{cursor:pointer}.goob button:hover,.goob select:hover{border-color:#93A0BD}" +
    ".goob .gm{color:#93A0BD;font-size:.8rem;flex-basis:100%}";
  document.head.appendChild(css);
  var n = 0;
  document.querySelectorAll("[data-goob]").forEach(function(box){
    var cur = get(), id = "goob-sel-" + (n++), html = '<label for="' + id + '">Goobta</label><select id="' + id + '">';
    var found = false;
    GROUPS.forEach(function(g){
      html += '<optgroup label="' + g[0] + '">';
      g[1].forEach(function(p){
        var on = Math.abs(p[1] - cur.lat) < 0.01 && Math.abs(p[2] - cur.lon) < 0.01;
        if (on) found = true;
        html += '<option value="' + p[1] + "," + p[2] + '"' + (on ? " selected" : "") + ">" + p[0] + "</option>";
      });
      html += "</optgroup>";
    });
    if (!found) html += '<option value="' + cur.lat + "," + cur.lon + '" selected>' + (cur.name || "Goobtaada") + " (" + (+cur.lat).toFixed(2) + ", " + (+cur.lon).toFixed(2) + ")</option>";
    html += '</select><button type="button">Goobtaada adeegso</button><span class="gm" hidden></span>';
    box.className = (box.className ? box.className + " " : "") + "goob";
    box.innerHTML = html;
    var sel = box.querySelector("select"), btn = box.querySelector("button"), msg = box.querySelector(".gm");
    sel.addEventListener("change", function(){
      var o = sel.options[sel.selectedIndex], v = o.value.split(",");
      set({lat:+v[0], lon:+v[1], name:o.textContent.replace(/ \(.*\)$/, "")});
    });
    btn.addEventListener("click", function(){
      if (!navigator.geolocation){ msg.hidden = false; msg.textContent = "Qalabkaagu ma bixin karo goobta. Ka dooro liiska."; return; }
      msg.hidden = false; msg.textContent = "Goobta waa la raadinayaa…";
      navigator.geolocation.getCurrentPosition(function(pos){
        set({lat:+pos.coords.latitude.toFixed(3), lon:+pos.coords.longitude.toFixed(3), name:"Goobtaada"});
      }, function(){ msg.textContent = "Goobta lama helin. Ka dooro liiska."; }, {timeout:15000, maximumAge:3600000});
    });
  });
})();
