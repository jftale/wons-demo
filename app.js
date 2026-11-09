// WON'S 웹 목업: 가상 고객 무작위 배정 → 데이터 카드 → 그 고객의 홈 → 누르면 이어지는 화면
(function () {
  "use strict";

  // 가상 고객 세 명. 모든 값은 시연용 가상 데이터(Figma 화면의 숫자와 맞춤)
  var CUSTOMERS = {
    // pairs: [거래 내역(가상), 그래서 홈에서 달라지는 것]
    A: {
      home: "s01",
      eyebrow: "배정된 가상 고객 A",
      title: "20대 직장인,<br>오늘 월급날이에요",
      pairs: [
        ["오늘 월급 312만 원 입금", "맨 위 소식에 오늘 들어온 월급"],
        ["자동이체 3건, 지난 3개월 자동이체 뒤에도 돈이 남음", "계좌 아래에 예상 여유 자금 약 48만 원"],
        ["가입한 적금 없음", "여유 자금으로 시작하는 적금(WON챌린지) 추천"],
        ["오늘 챙길 일이 여럿", "헤더의 AI 비서가 한곳에 모아 보여 줌"]
      ]
    },
    B: {
      home: "s02",
      eyebrow: "배정된 가상 고객 B",
      title: "60대, 큰 글씨<br>쉬운홈을 써요",
      pairs: [
        ["쉬운홈을 켜 두고 씀", "쉬운홈과 큰 글씨는 그대로"],
        ["오늘 연금 82만 원 입금", "맨 위 소식에 오늘 들어온 연금"],
        ["딸에게 자주 송금", "계좌 아래에 자주 보내는 분께 바로 보내기"],
        ["처음 보내는 계좌가 가끔 있음", "금융사기 예방 안내와 상담 번호를 아래에"]
      ]
    },
    C: {
      home: "s03",
      eyebrow: "배정된 가상 고객 C",
      title: "30대, 조회와 이체만<br>빠르게 써요",
      pairs: [
        ["앱에서 잔액 조회와 이체만 사용", "홈은 지금 앱과 거의 같게 둠"],
        ["내일 카드대금 61만 원 출금 예정", "맨 위 소식만 바뀜: 카드대금과 빠져나간 뒤 잔액"],
        ["잔액 숨김을 켜 둠", "잔액 숨김 그대로, 추천을 늘리지 않음"]
      ]
    }
  };
  var KEYS = Object.keys(CUSTOMERS);
  var S = window.SCREENS || {};

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    intro: $("intro"), profile: $("profile"), screen: $("screen"), deck: $("deck"),
    shot: $("shot"), spots: $("spots"), actions: $("barActions"), list: $("list"), listItems: $("listItems"), toast: $("toast")
  };

  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  var current = null;         // 지금 배정된 고객 키
  var agree = { a1: false, a2: false };

  // 무작위 배정: 방금 본 고객은 빼고 뽑아서 "고객 바꾸기"를 누르면 항상 다른 고객이 나온다
  function pickCustomer(exclude) {
    var pool = KEYS.filter(function (k) { return k !== exclude; });
    var buf = new Uint32Array(1);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(buf); else buf[0] = Math.floor(Math.random() * 4294967296);
    return pool[buf[0] % pool.length];
  }

  // ---------- 화면 전환 ----------
  function show(view) {
    el.intro.hidden = view !== "intro";
    el.profile.hidden = view !== "profile";
    el.screen.hidden = view !== "screen";
    el.actions.hidden = view === "intro";
    window.scrollTo(0, 0);
  }

  function go(hash, replace) {
    if (location.hash === "#" + hash) { render(); return; }
    if (replace) history.replaceState(null, "", "#" + hash); else history.pushState(null, "", "#" + hash);
    render();
  }

  function render() {
    var h = location.hash.replace("#", "");
    if (!h || h === "intro" || !current) { show("intro"); return; }
    if (h === "profile") { renderProfile(); return; }
    if (S[h]) { renderScreen(h); return; }
    show("intro");
  }

  function renderProfile() {
    var c = CUSTOMERS[current];
    $("pEyebrow").textContent = c.eyebrow + " · 무작위 배정";
    $("pTitle").innerHTML = c.title;
    var list = $("pData");
    list.textContent = "";
    c.pairs.forEach(function (pr) {
      var item = document.createElement("li");
      var from = document.createElement("span"); from.className = "from"; from.textContent = pr[0];
      var to = document.createElement("span"); to.className = "to"; to.textContent = pr[1];
      item.appendChild(from); item.appendChild(to); list.appendChild(item);
    });
    show("profile");
    el.profile.classList.remove("is-in"); void el.profile.offsetWidth; el.profile.classList.add("is-in");
  }

  function renderScreen(id) {
    var s = S[id];
    if (id === "s09") agree = { a1: false, a2: false };
    el.shot.src = s.src;
    el.shot.alt = s.name;
    el.shot.width = s.w; el.shot.height = s.h;
    el.spots.innerHTML = "";
    s.spots.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "spot";
      b.style.left = p.l + "%"; b.style.top = p.t + "%"; b.style.width = p.w + "%"; b.style.height = p.h + "%";
      b.setAttribute("aria-label", p.to ? (S[p.to] ? S[p.to].name : "다음 화면") : (p.toast || p.act || "누르기"));
      b.addEventListener("click", function (e) { e.stopPropagation(); tap(p); });
      el.spots.appendChild(b);
    });
    show("screen");
    el.screen.classList.remove("is-in"); void el.screen.offsetWidth; el.screen.classList.add("is-in");
    // 홈에 처음 들어오면 누를 수 있는 곳을 한 번 깜빡여 알려 준다
    if (id === CUSTOMERS[current].home && !store.get("hinted-" + id)) {
      store.set("hinted-" + id, "1");
      setTimeout(hint, 450);
      toast("파랗게 깜빡인 곳을 눌러 보세요");
    }
  }

  function tap(p) {
    if (p.toast) { toast(p.toast); return; }
    if (p.to) { go(p.to); return; }
    switch (p.act) {
      case "back": history.back(); break;
      case "home": go(CUSTOMERS[current].home); break;
      case "agree1": agree.a1 = !agree.a1; drawAgree(); break;
      case "agree2": agree.a2 = !agree.a2; drawAgree(); break;
      case "join":
        if (agree.a1 && agree.a2) go("s10");
        else { toast("필수 동의 두 개를 먼저 눌러 주세요"); hint(); }
        break;
    }
  }

  function drawAgree() {
    var s = S.s09;
    el.spots.querySelectorAll(".check, .join-on").forEach(function (n) { n.remove(); });
    s.spots.forEach(function (p) {
      if ((p.act === "agree1" && agree.a1) || (p.act === "agree2" && agree.a2)) {
        var c = document.createElement("span");
        c.className = "check";
        c.style.left = p.bx + "%"; c.style.top = p.by + "%";
        el.spots.appendChild(c);
      }
      if (p.act === "join" && agree.a1 && agree.a2) {
        var j = document.createElement("span");
        j.className = "join-on";
        j.textContent = "인증하고 가입하기";
        j.style.left = p.l + "%"; j.style.top = p.t + "%"; j.style.width = p.w + "%"; j.style.height = p.h + "%";
        el.spots.appendChild(j);
      }
    });
  }

  function hint() {
    el.spots.classList.remove("is-hint"); void el.spots.offsetWidth; el.spots.classList.add("is-hint");
    clearTimeout(hint.t); hint.t = setTimeout(function () { el.spots.classList.remove("is-hint"); }, 900);
  }

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("is-on");
    clearTimeout(toast.t); toast.t = setTimeout(function () { el.toast.classList.remove("is-on"); }, 2400);
  }

  // ---------- 버튼 ----------
  function draw(exclude) {
    el.deck.classList.add("is-shuffling");
    $("btnDraw").disabled = true;
    setTimeout(function () {
      el.deck.classList.remove("is-shuffling");
      $("btnDraw").disabled = false;
      current = pickCustomer(exclude);
      store.set("wons-customer", current);
      go("profile");
    }, 900);
  }

  $("btnDraw").addEventListener("click", function () { draw(null); });
  $("btnHome").addEventListener("click", function () { go(CUSTOMERS[current].home); });
  $("btnRedraw").addEventListener("click", function () { current = pickCustomer(current); store.set("wons-customer", current); renderProfile(); });
  $("btnSwap").addEventListener("click", function () { current = pickCustomer(current); store.set("wons-customer", current); go("profile"); });
  // 화면 아무 데나 누르면 누를 수 있는 곳을 알려 준다(Figma 프로토타입과 같은 방식)
  el.spots.addEventListener("click", hint);

  $("btnList").addEventListener("click", function () {
    el.listItems.innerHTML = "";
    Object.keys(S).forEach(function (id) {
      var item = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button"; b.textContent = S[id].name;
      b.addEventListener("click", function () { el.list.hidden = true; go(id); });
      item.appendChild(b); el.listItems.appendChild(item);
    });
    el.list.hidden = false;
  });
  $("btnListClose").addEventListener("click", function () { el.list.hidden = true; });
  el.list.addEventListener("click", function (e) { if (e.target === el.list) el.list.hidden = true; });

  window.addEventListener("popstate", render);

  // ---------- 시작 ----------
  // 주소 끝에 ?c=A 처럼 붙이면 그 고객으로 바로 시작(발표자용). 없으면 이 창에서 이미 뽑은 고객을 유지
  var q = (location.search.match(/[?&]c=([ABC])/i) || [])[1];
  if (q) { current = q.toUpperCase(); store.set("wons-customer", current); go("profile", true); }
  else {
    var saved = store.get("wons-customer");
    if (saved && CUSTOMERS[saved]) current = saved;
    render();
  }
})();
