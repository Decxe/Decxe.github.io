(function () {
  var WEEK = ["日", "一", "二", "三", "四", "五", "六"];

  function shanghaiNow() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function greeting(hour) {
    if (hour < 6) return "夜深了，注意休息";
    if (hour < 11) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  }

  function tick() {
    var now = shanghaiNow();
    var text =
      now.getFullYear() +
      "年" +
      pad(now.getMonth() + 1) +
      "月" +
      pad(now.getDate()) +
      "日 星期" +
      WEEK[now.getDay()] +
      " " +
      pad(now.getHours()) +
      ":" +
      pad(now.getMinutes()) +
      ":" +
      pad(now.getSeconds());
    var clock = document.getElementById("clock");
    var greet = document.getElementById("greet");
    if (clock) clock.textContent = text;
    if (greet) greet.textContent = greeting(now.getHours());
  }

  function paperCount() {
    var n = document.querySelectorAll("#papers tbody tr").length;
    var el = document.getElementById("paper-count");
    if (el) el.textContent = String(n);
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function readJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("bad status");
      return res.json();
    });
  }

  function countFrom(data) {
    var n = data && (data.value || data.count);
    n = Number(n);
    return isFinite(n) && n >= 0 ? n : null;
  }

  function loadVisits() {
    var ns = "decxe-github-io";
    var pvUrl = "https://abacus.jasoncameron.dev/hit/" + ns + "/homepage";
    var uvFlag = "decxe-uv-counted";
    var uvUrl = localStorage.getItem(uvFlag)
      ? "https://abacus.jasoncameron.dev/get/" + ns + "/uv"
      : "https://abacus.jasoncameron.dev/hit/" + ns + "/uv";

    readJson(pvUrl)
      .then(function (data) {
        var n = countFrom(data);
        if (n === null) throw new Error("no pv");
        setText("visit-count", String(n));
      })
      .catch(function () {
        setText("visit-count", "--");
      });

    readJson(uvUrl)
      .then(function (data) {
        var n = countFrom(data);
        if (n === null) throw new Error("no uv");
        localStorage.setItem(uvFlag, "1");
        setText("visitor-count", String(n));
      })
      .catch(function () {
        setText("visitor-count", "--");
      });
  }

  var topBtn = document.getElementById("back-top");
  if (topBtn) {
    window.addEventListener("scroll", function () {
      topBtn.classList.toggle("show", window.scrollY > 360);
    });
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  tick();
  setInterval(tick, 1000);
  paperCount();
  loadVisits();
})();
