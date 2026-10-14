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
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (r) {
          if (!r.ok || String(r.body.success) !== "true") throw new Error(r.body.message || "Request failed");
          form.reset();
          status.textContent = "Thank you. Your enquiry has been sent and we will be in touch shortly.";
        })
        .catch(function () {
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
