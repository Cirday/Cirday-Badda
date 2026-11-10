/* Digniinaha rasmiga ah ee SNMA (Hay'adda Qaranka ee Saadaasha Hawada Soomaaliya).
   /digniin.json waxaa 2-dii saacadoodba mar cusbooneysiiya GitHub Action (feed-ka CAP ee meteosomalia.so). */
(function () {
  var box = document.getElementById("snma");
  if (!box) return;
  var TX = {
    so: {h: "Digniinaha rasmiga ah", src: "Isha: Hay'adda Qaranka ee Saadaasha Hawada Soomaaliya (SNMA)", until: "ilaa ", from: "laga bilaabo ", more: "Faahfaahin (Ingiriisi): meteosomalia.so",
      sev: {Minor: "Fudud", Moderate: "Dhexdhexaad", Severe: "Daran", Extreme: "Aad u daran"}, days: ["Axad", "Isniin", "Talaado", "Arbaco", "Khamiis", "Jimce", "Sabti"]},
    en: {h: "Official warnings", src: "Source: Somalia National Meteorological Agency (SNMA)", until: "until ", from: "from ", more: "Details: meteosomalia.so",
      sev: {Minor: "Minor", Moderate: "Moderate", Severe: "Severe", Extreme: "Extreme"}, days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]},
    ar: {h: "التحذيرات الرسمية", src: "المصدر: الهيئة الوطنية للأرصاد الجوية في الصومال", until: "حتى ", from: "من ", more: "التفاصيل: meteosomalia.so",
      sev: {Minor: "طفيفة", Moderate: "متوسطة", Severe: "شديدة", Extreme: "شديدة جداً"}, days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]}
  };
  var EV = {
    "OET-079": ["Daadad degdeg ah", "Flash flood", "فيضان مفاجئ"], "OET-078": ["Fatahaad", "Flood", "فيضان"],
    "OET-042": ["Mawjad badeed iyo fatahaad xeebeed", "Storm surge / coastal flood", "عرام عاصفي / فيضان ساحلي"],
    "OET-159": ["Roob joogto ah", "Rain / wet spell", "أمطار متواصلة"], "OET-157": ["Roob culus", "Heavy rain", "أمطار غزيرة"],
    "OET-162": ["Duufaan", "Tropical cyclone", "إعصار مداري"], "OET-185": ["Onkod iyo hillaac", "Thunderstorm", "عاصفة رعدية"],
    "OET-207": ["Dabayl xoog leh", "Strong wind", "رياح قوية"], "OET-055": ["Boor iyo ciid duufaan", "Dust storm", "عاصفة ترابية"]
  };
  var EVN = {"flash food": "OET-079", "flash flood": "OET-079", "flood": "OET-078", "storm surge/coastal flood": "OET-042", "rain/wet spell": "OET-159",
    "heavy rain": "OET-157", "tropical cyclone": "OET-162", "thunderstorm": "OET-185", "strong wind": "OET-207", "dust storm": "OET-055"};
  var DATA = null;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function lang() { var l = document.documentElement.lang; return TX[l] ? l : "so"; }
  function when(ms, t) { var d = new Date(ms + 3 * 3600e3); /* waqtiga Soomaaliya, UTC+3 */
    return t.days[d.getUTCDay()] + " " + String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0"); }
  function render() {
    var now = Date.now(), l = lang(), t = TX[l], li = l === "so" ? 0 : l === "en" ? 1 : 2;
    var A = DATA && Array.isArray(DATA.a) ? DATA.a.filter(function (a) { return Date.parse(a.exp) > now; }) : [];
    if (!A.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.innerHTML = '<div class="snma-h">' + esc(t.h) + "</div>" + A.map(function (a) {
      var e = EV[a.code] || EV[EVN[String(a.ev).toLowerCase()]], on = Date.parse(a.onset), sv = a.sev === "Severe" || a.sev === "Extreme";
      var web = /^https:\/\/meteosomalia\.so\//.test(a.web || "") ? a.web : "https://meteosomalia.so";
      return '<a class="warn' + (sv ? "" : " mod") + '" href="' + esc(web) + '" target="_blank" rel="noopener"><b>⚠ ' + esc(e ? e[li] : a.ev) + " · " + esc(t.sev[a.sev] || a.sev) + "</b>"
        + "<span>" + esc(a.area) + "</span><span>" + cap((on > now ? esc(t.from) + when(on, t) + ", " : "") + esc(t.until) + when(Date.parse(a.exp), t)) + "</span>"
        + '<small>' + esc(a.h) + "</small><small>" + esc(t.more) + "</small></a>";
    }).join("") + '<div class="snma-src">' + esc(t.src) + "</div>";
    box.hidden = false;
  }
  fetch("/digniin.json", {cache: "no-cache"}).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { DATA = d; render(); }).catch(function () {});
  new MutationObserver(render).observe(document.documentElement, {attributes: true, attributeFilter: ["lang"]});
})();
