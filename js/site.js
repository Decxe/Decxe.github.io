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
    var url = "https://abacus.jasoncameron.dev/hit/decxe-github-io/homepage";
    readJson(url)
      .then(function (data) {
        var n = countFrom(data);
        if (n === null) throw new Error("no pv");
        setText("visit-count", String(n));
      })
      .catch(function () {
        setText("visit-count", "--");
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

  function canUsePointerFx() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setupPointerFx() {
    if (!canUsePointerFx()) return;

    var cursor = document.createElement("div");
    cursor.id = "rainbow-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<span class="cursor-core"></span>';
    document.body.appendChild(cursor);
    document.body.classList.add("rainbow-cursor-on");

    var hue = 0;
    var lastX = 0;
    var lastY = 0;
    var lastDust = 0;
    var mouseX = 0;
    var mouseY = 0;
    var trail = [];
    var i;
    for (i = 0; i < 10; i += 1) {
      (function () {
        var dot = document.createElement("span");
        dot.className = "cursor-trail";
        document.body.appendChild(dot);
        trail.push({ el: dot, x: 0, y: 0 });
      })();
    }

    function spawnDust(x, y) {
      var dust = document.createElement("span");
      dust.className = "cursor-dust";
      dust.style.left = x + "px";
      dust.style.top = y + "px";
      dust.style.background = "hsl(" + hue + " 92% 58%)";
      dust.style.boxShadow = "0 0 8px hsl(" + hue + " 92% 58%)";
      document.body.appendChild(dust);
      setTimeout(function () {
        dust.remove();
      }, 520);
    }

    function tickTrail() {
      var x = mouseX;
      var y = mouseY;
      var n;
      for (n = 0; n < trail.length; n += 1) {
        var ease = 0.38 - n * 0.026;
        if (ease < 0.12) ease = 0.12;
        trail[n].x += (x - trail[n].x) * ease;
        trail[n].y += (y - trail[n].y) * ease;
        trail[n].el.style.left = trail[n].x + "px";
        trail[n].el.style.top = trail[n].y + "px";
        trail[n].el.style.background = "hsl(" + ((hue + n * 24) % 360) + " 90% 56%)";
        trail[n].el.style.width = 11 - n * 0.55 + "px";
        trail[n].el.style.height = 11 - n * 0.55 + "px";
        x = trail[n].x;
        y = trail[n].y;
      }
      requestAnimationFrame(tickTrail);
    }

    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
      cursor.classList.add("is-on");
      hue = (hue + 8) % 360;

      var dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      var now = Date.now();
      var n;
      if (dist > 12 && now - lastDust > 16) {
        spawnDust(e.clientX, e.clientY);
        lastX = e.clientX;
        lastY = e.clientY;
        lastDust = now;
      }

      for (n = 0; n < trail.length; n += 1) {
        trail[n].el.classList.add("is-on");
      }
    });

    document.addEventListener("mouseleave", function () {
      var n;
      cursor.classList.remove("is-on");
      for (n = 0; n < trail.length; n += 1) {
        trail[n].el.classList.remove("is-on");
      }
    });

    document.addEventListener("mousedown", function () {
      cursor.classList.add("is-press");
    });

    document.addEventListener("mouseup", function () {
      cursor.classList.remove("is-press");
    });

    document.addEventListener("click", function (e) {
      var ripple = document.createElement("span");
      ripple.className = "click-ripple";
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";
      document.body.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
      }, 650);

      var i;
      for (i = 0; i < 10; i += 1) {
        (function (index) {
          var spark = document.createElement("span");
          var angle = (Math.PI * 2 * index) / 10;
          var dist = 22 + Math.random() * 26;
          spark.className = "click-spark";
          spark.style.left = e.clientX + "px";
          spark.style.top = e.clientY + "px";
          spark.style.background = "hsl(" + (index * 36) + " 92% 56%)";
          spark.style.setProperty("--dx", Math.cos(angle) * dist + "px");
          spark.style.setProperty("--dy", Math.sin(angle) * dist + "px");
          document.body.appendChild(spark);
          setTimeout(function () {
            spark.remove();
          }, 580);
        })(i);
      }
    });

    requestAnimationFrame(tickTrail);
  }

  tick();
  setInterval(tick, 1000);
  paperCount();
  loadVisits();
  setupPointerFx();
})();
