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

  // 1b. Header: hairline once scrolled, and highlight the section in view
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var navLinks = document.querySelectorAll(".nav-desktop a");
  if ("IntersectionObserver" in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["home", "problem", "how-it-works", "demo", "who", "roadmap", "contact"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  // 2. Demo: select a supplier to show its "Why?" panel
  var panel = document.getElementById("why-panel");
  var suppliers = document.querySelectorAll("#demo .sup");
  function selectSupplier(index) {
    suppliers.forEach(function (btn, i) { btn.setAttribute("aria-pressed", String(i === index)); });
    var tpl = document.getElementById("why-" + index);
    if (panel && tpl) panel.innerHTML = tpl.innerHTML;
  }
  suppliers.forEach(function (btn, i) { btn.addEventListener("click", function () { selectSupplier(i); }); });
  if (suppliers.length) selectSupplier(1);

  // 3. Contact form: posts to FormSubmit, which emails each enquiry to the inbox below.
  // After FormSubmit activation you can swap the address for the random alias it emails you.
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/SupplySureSolutions@gmail.com";
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector('[role="status"]');
    var submit = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get("_honey")) return; // spam bot filled the hidden field
      function val(name) { return String(data.get(name) || "").trim(); }
      var payload = {
        _subject: "New SupplySure enquiry from " + val("name"),
        _template: "table",
        _captcha: "false",
        "Interested as": val("interest"),
        "Name": val("name"),
        "Organisation": val("organisation"),
        "Role": val("role") || "Not provided",
        "email": val("email"),
        "Country / Location": val("country") || "Not provided",
        "Supplier population": val("supplierPopulation") || "Not provided",
        "Message": val("message") || "Not provided"
      };
      submit.disabled = true;
      status.textContent = "Sending…";
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        // FormSubmit replies {"success":"true"} once the inbox is activated; anything else
        // (activation pending, page opened as a local file, HTML error page) is a failure.
        .then(function (res) {
          return res.text().then(function (text) {
            var body = {};
            try { body = JSON.parse(text); } catch (err) { body = { message: "HTTP " + res.status + " (non-JSON response)" }; }
            return { ok: res.ok, body: body };
          });
        })
        .then(function (r) {
          if (!r.ok || String(r.body.success) !== "true") throw new Error(r.body.message || "Request failed");
          form.reset();
          status.textContent = "Thank you. Your enquiry has been sent and we will be in touch shortly.";
        })
        .catch(function (err) {
          if (window.console) console.error("FormSubmit: " + err.message);
          status.textContent =
            "Sorry, your enquiry could not be sent. Please try again, or email SupplySureSolutions@gmail.com directly.";
        })
        .then(function () { submit.disabled = false; });
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
