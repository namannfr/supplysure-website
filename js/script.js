// SupplySure site interactions (plain JavaScript, no dependencies).
(function () {
  "use strict";

  // 1. Mobile navigation
  var nav = document.getElementById("mobile-nav");
  var toggle = document.querySelector('[aria-controls="mobile-nav"]');
  function setNav(open) {
    nav.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (nav && toggle) {
    toggle.addEventListener("click", function () { setNav(nav.hidden); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  }

  // 2. Dashboard: select a supplier row to show its "Why?" panel
  var panel = document.getElementById("why-panel");
  var rows = document.querySelectorAll("#demo tbody tr");
  function selectRow(index) {
    rows.forEach(function (row, i) {
      var on = i === index;
      row.classList.toggle("bg-teal-wash/60", on);
      row.classList.toggle("hover:bg-paper", !on);
      row.setAttribute("aria-selected", String(on));
      var btn = row.querySelector("button");
      if (btn) btn.setAttribute("aria-pressed", String(on));
    });
    var tpl = document.getElementById("why-" + index);
    if (panel && tpl) panel.innerHTML = tpl.innerHTML;
  }
  rows.forEach(function (row, i) { row.addEventListener("click", function () { selectRow(i); }); });

  // 3. Contact form (not connected to a server yet)
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.querySelector('[role="status"]').textContent =
        "Thank you. This form is not yet connected to an inbox, so nothing has been sent. Connect a form endpoint before launch.";
    });
  }

  // 4. Scroll reveal: content is visible by default; blocks below the fold fade in
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.remove("pending"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("pending"); io.observe(el); }
    });
  }
})();
