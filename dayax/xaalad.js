/* Xaaladda caawa: kaltirsi kasta inta uu caawa marayo iyo bisha lagu jiro.
   Xisaabtu waa tan bogagga kaltirsiyada ku jirta. */
(function(){
  var box = document.getElementById("xaalad"); if (!box) return;
  var DAY = 864e5, TZ = 3 * 36e5, W = 360 / 28;
  var now = new Date(), loc = new Date(now.getTime() + TZ);
  var today = Date.UTC(loc.getUTCFullYear(), loc.getUTCMonth(), loc.getUTCDate());
  var eve = loc.getUTCHours() >= 18, night = today + (eve ? DAY : 0);
  var GREG = ["Jan","Feb","Mar","Abr","May","Jun","Lul","Ogs","Sep","Okt","Nof","Dis"];
  var fmt = function(t){ var d = new Date(t); return d.getUTCDate() + " " + GREG[d.getUTCMonth()]; };
  var rows = {};
  var X = window.CIRDAY_XAALAD = window.CIRDAY_XAALAD || {};   /* kaarka maalinta ayaa isticmaala */
  function row(id, href, name, val, sub){ X[id] = {href: href, name: name, val: val, sub: sub || ""}; rows[id] = '<a class="xr" href="' + href + '"><span class="xn">' + name + '</span><span class="xv">' + val + (sub ? '<small>' + sub + '</small>' : '') + '</span></a>'; }
  function paint(){
    box.innerHTML = '<div class="xh">' + (eve || loc.getUTCHours() < 6 ? "Caawa" : "Maanta") + '</div>' +
      ["doon","bil","dab","xil","dir","bd"].map(function(k){ return rows[k] || ""; }).join("");
    if (typeof window.renderKaar === "function") try{ window.renderKaar(); }catch(e){}
  }

  /* Sannadka Doonyaha: 15 Ogost, 12 × 30 cisho, 4 gudcur, sugidda Dabbooje-yaraha */
  (function(){
    var M = ["Soon","Soonfur","Sidetaal","Arafo","Sako","Safar","Rabiic al-awal","Rabiic al-aakhir","Jamaad al-awal","Jamaad al-aakhir","Rajab","Shacbaan"];
    var y = new Date(night).getUTCFullYear(), s = Date.UTC(y, 7, 15); if (night < s) s = Date.UTC(y - 1, 7, 15);
    var d = Math.round((night - s) / DAY) + 1, v, sub;
    if (d <= 360){ var m = Math.floor((d - 1) / 30); v = M[m] + ", cishada " + (d - m * 30); sub = (m < 6 ? "Asjab" : "Koos") + " · cishada " + d; }
    else if (d <= 364){ v = "Gudcur, cishada " + (d - 360); sub = "cishada " + d; }
    else { v = "Sugidda Dabbooje-yaraha"; sub = "cishada " + d; }
    row("doon", "doonyaha/", "Sannadka Doonyaha", v, sub);
  })();

  /* Dabshid: 365 cisho, 7 × 50 + Falag wareeg 15 */
  (function(){
    var ADJ = ["Axadaad","Isniinaad","Talaadaad","Arbacaad","Khamiisaad","Jimcaad","Sabtiyaad"], s0 = Date.UTC(2007, 6, 21);
    var days = Math.round((night - s0) / DAY), k = Math.floor(days / 365), doy = days - k * 365, wd = new Date(s0 + k * 365 * DAY).getUTCDay();
    var v = doy < 350 ? "Kontonkii " + ADJ[(wd + Math.floor(doy / 50)) % 7] + ", maalinta " + (doy % 50 + 1) : "Falag wareeg, maalinta " + (doy - 349);
    row("dab", "dabshid/", "Sannadka Dabshidka", v, "Sano " + ADJ[wd] + " · maalinta " + (doy + 1) + " / 365");
  })();

  /* Xilliyada: Afaggaallada 18/1, Dirir 19/4 aroortii; Afaggaallada 27/6, Dirir 27/9 maqribkii */
  (function(){
    var y = new Date(today).getUTCFullYear(), L = [[0,18,"Diraac/Jiilaal"],[3,19,"Gu’"],[5,27,"Xagaa"],[8,27,"Dayr"]];
    var c = ["Dayr", Date.UTC(y - 1, 8, 27)], nx = null;
    for (var i = 0; i < L.length; i++){ var t = Date.UTC(y, L[i][0], L[i][1]); if (t <= today) c = [L[i][2], t]; else if (!nx) nx = [L[i][2], t]; }
    if (!nx) nx = ["Diraac/Jiilaal", Date.UTC(y + 1, 0, 18)];
    row("xil", "xilliyada/", "Xilliyada", c[0] + ", cishada " + (Math.round((today - c[1]) / DAY) + 1), nx[0] + " · " + fmt(nx[1]));
  })();

  row("bil", "bilaha/", "Bilaha Dayaxa", "…", "waa la xisaabinayaa");
  row("dir", "bilo-dirir/", "Bilo-dirir · Bilo-dambarsame", "…", "waa la xisaabinayaa");
  row("bd", "bil-dhalasho/", "Dhalashada Bil-dayaxeedka", "…", "waa la xisaabinayaa");
  paint();

  /* Bilaha dayaxa iyo Bilo-dirir: waxay u baahan yihiin bildhalashada iyo kulammada dayaxa */
  setTimeout(function(){
    var A = window.Astronomy; if (!A) return;
    var LOC = {lat:26.33, lon:43.97};
    try{ var v = JSON.parse(localStorage.getItem("cirday-dayax-loc") || "null"); if (v && isFinite(v.lat) && isFinite(v.lon)) LOC = v; }catch(e){}
    var OB = new A.Observer(LOC.lat, LOC.lon, 0), MK = function(ms){ return A.MakeTime(new Date(ms)); }, dayKey = function(ms){ return Math.floor((ms + TZ) / DAY); };
    function rs(body, dir, ms){ try{ var r = A.SearchRiseSet(body, OB, dir, MK(ms), 1); return r ? r.date.getTime() : null; }catch(e){ return null; } }
    function okEve(dk, conj){
      var ss = rs(A.Body.Sun, -1, dk * DAY - TZ + 12 * 36e5); if (ss == null) return null;
      var T0 = MK(ss), age = (ss - conj) / 36e5, eq = A.Equator(A.Body.Moon, T0, OB, true, true), hz = A.Horizon(T0, OB, eq.ra, eq.dec, "normal");
      var ms_ = hz.altitude > 0 ? rs(A.Body.Moon, -1, ss) : rs(A.Body.Moon, -1, ss - DAY), lag = ms_ == null ? null : (ms_ - ss) / 6e4, el = A.AngleFromSun(A.Body.Moon, T0);
      return {dk:dk, ss:ss, all: conj < ss && lag != null && lag >= 29 && age >= 15 && el >= 7};
    }
    var y = new Date(night).getUTCFullYear(), T0 = Date.UTC(y - 4, 0, 1), T1 = Date.UTC(y + 2, 0, 1), ST = [], GD = [], x = T0 - 35 * DAY;
    while (x < T1){ var conj = A.SearchMoonPhase(0, MK(x), 40).date.getTime(), ev = null, k = dayKey(conj);
      for (var n = 0; n < 4; n++, k++){ var e = okEve(k, conj); if (!e) continue; ev = e; if (e.all) break; }
      ST.push((ev.dk + 1) * DAY); GD.push(Math.floor((((A.EclipticGeoMoon(MK(ev.ss)).lon - (27.6 + (ev.ss - Date.UTC(2026,0,1)) / 31557600000 * 0.01397)) % 360 + 360) % 360) / W)); x = conj + 20 * DAY; }
    var mOf = function(t){ for (var i = ST.length - 2; i >= 0; i--) if (ST[i] <= t) return i; return 0; };
    var lday = function(t){ return Math.round((t - ST[mOf(t)]) / DAY) + 1; };
    var HM = ["Sako","Safar","Mawliid","Maalmadoone","Jamaad al-awal","Anbaylo","Rajab","Shacbaan","Soon","Soonfur","Sidetaal","Arafo"], HF = null;
    try{ HF = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {month:"numeric", timeZone:"UTC"}); }catch(e){}
    var hm = function(t){ try{ return HM[+HF.formatToParts(new Date(t)).filter(function(p){ return p.type === "month"; })[0].value - 1]; }catch(e){ return ""; } };

    /* Bilaha Dayaxa (Wadaanta): bisha Afaggaalladu 18/1 ku dhacaan waa diraac 1 (29 ama ka danbe: bisha xigta) */
    (function(){
      function start(Y){ var s = Date.UTC(Y, 0, 18), i = mOf(s); return lday(s) >= 29 ? ST[i + 1] : ST[i]; }
      var Y = y + 1; while (start(Y) > night) Y--;
      var a = start(Y), b = start(Y + 1), idx = 0, i0 = mOf(a), ic = mOf(night);
      idx = ic - i0;
      var S = ["Diraac","Gu’","Xagaa","Dayr"], k = Math.min(3, Math.floor(idx / 3)), o = idx < 12 ? idx % 3 + 1 : 4;
      row("bil", "bilaha/", "Bilaha Dayaxa", hm(ST[ic] + 14 * DAY) + ", cishada " + lday(night), S[k] + " · bisha " + o + "aad" + (idx === 12 ? " (dheeraad)" : ""));
    })();

    /* Bilo-dirir iyo Bilo-dambarsame */
    (function(){
      var off = function(t){ return 27.6 + (t - Date.UTC(2026,0,1)) / 31557600000 * 0.01397; };
      var norm = function(v){ return ((v % 360) + 360) % 360; };
      var sid = function(t){ return norm(A.EclipticGeoMoon(MK(t)).lon - off(t)); };
      function passes(i){ var tg = (i + .5) * W, f = function(t){ return norm(sid(t) - tg + 180) - 180; }, out = [], a = T0, fa = f(a);
        for (var b = T0 + 3 * 36e5; b <= T1; b += 3 * 36e5){ var fb = f(b);
          if (fa < 0 && fb >= 0 && fb - fa < 90){ var lo = a, hi = b; for (var q = 0; q < 20; q++){ var m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; } out.push(hi); }
          a = b; fa = fb; }
        return out; }
      var nd = function(t){ var l = t + TZ, d = Math.floor(l / DAY) * DAY; if (l - d >= 18 * 36e5) d += DAY; return d; };
      var PD = passes(13), PR = passes(26), after = function(arr, t){ for (var i = 0; i < arr.length; i++) if (arr[i] > t) return arr[i]; };
      function ys(Y){ var a = Date.UTC(Y, 0, 18), i = 0; while (nd(PD[i]) < a) i++; if (lday(nd(PD[i])) >= 22) i++; return PD[i]; }
      var DIR = ["Lixkor","Toddob","Amminla’","Seermaweydo","Cawl","Dirir-sagaar"], DAM = ["Dabbooje","Habar-ari","Danab","Dayrweyn","Ximir","Xays"];
      var Y = y + 1; while (ys(Y) > night) Y--;
      var s = ys(Y), s1 = ys(Y + 1), L = [], i = PD.indexOf(s);
      for (var k = 0; k < 6; k++) L.push(["Bilo-dirir", DIR[k], k, PD[i + k]]);
      var r0 = after(PR, PD[i + 6]), j = PR.indexOf(r0);
      for (k = 0; k < 6; k++) L.push(["Bilo-dambarsame", DAM[k], k, PR[j + k]]);
      var d = after(PD, PR[j + 6]); while (d && d < s1){ L.push(["Dirir-toosis", "Dirir-toosis", -1, d]); d = after(PD, d); }
      var c = L[0]; for (k = 0; k < L.length; k++) if (nd(L[k][3]) <= night) c = L[k];
      var day = Math.round((night - nd(c[3])) / DAY) + 1;
      row("dir", "bilo-dirir/", "Bilo-dirir · Bilo-dambarsame", c[1] + ", cishada " + day, c[0] + (c[2] >= 0 ? " · bisha " + (c[2] + 1) + "aad · " + (c[2] < 3 ? "gudcur" : "caddo") : ""));
    })();
    /* Bil-dhalashada: godka ay bishu ku dhalato; bilaha way isku xigaan, bil dheeraad marka bisha 1aad weli ku dhalato godadka bisha 3aad */
    (function(){
      var SN = ["Gu’","Xagaa","Dayr","Diraac/Jiilaal"], G = ["Godan","Listan","Urur","Cadaad","Saco","Agaallicad","Afaggaal","Naafcadde","Naafmadoobe","Tar","Majin","Koxdin","Naasogaalle","Dirir","Garbo","Bayaxow","Gudban","Libcas","Xoor","Mareego-dheer","Maran","Faruur-cirir","Jed-gabbarre","Jed-dhiriqle","Jed-gacanle","Rab-hore","Rab-danbe","Meecaad"];
      var slot = function(g){ var k = (g + 1) % 28, s = Math.floor(k / 7), w = k % 7; return s * 3 + (w < 3 ? 0 : w < 5 ? 1 : 2); };
      var sl = slot(GD[0]), ex = false, ic = mOf(night);
      for (var i = 1; i <= ic; i++){ var lit = slot(GD[i]), e = (sl + 1) % 12; if (e % 3 === 0 && lit === sl) ex = true; else { sl = e; ex = false; } }
      var HD = ["Dago/Sako","Safar","Mawliid","Rajal-hore","Rajal-dhexe","Rajal-dambe","Sabbuux","Waabberiis","Soon","Soonfur","Sidataal","Carrafo"], hn = ""; try{ hn = HD[+HF.formatToParts(new Date(ST[ic] + 14 * DAY)).filter(function(p){ return p.type === "month"; })[0].value - 1] + ", "; }catch(e){}
      row("bd", "bil-dhalasho/", "Dhalashada Bil-dayaxeedka", hn + "cishada " + lday(night), SN[Math.floor(sl / 3)] + " · bisha " + (sl % 3 + 1) + "aad" + (ex ? " (dheeraad)" : "") + " · " + G[GD[ic]]);
    })();
    paint();
  }, 60);
})();
