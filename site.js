document.querySelectorAll(".site-header").forEach((header) => {
  const toggle = header.querySelector(".nav-toggle");
  const navigation = header.querySelector("nav");

  if (!toggle || !navigation) return;

  const closeMenu = () => {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menüyü aç");
  };

  toggle.addEventListener("click", () => {
    const willOpen = !header.classList.contains("is-open");
    header.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    toggle.setAttribute("aria-label", willOpen ? "Menüyü kapat" : "Menüyü aç");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });
});

document.querySelectorAll("form[data-web3forms]").forEach((form) => {
  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector(".form-status");
  const accessKey = form.querySelector('input[name="access_key"]');
  const defaultButtonText = submitButton?.textContent || "Talep Gönder";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!accessKey?.value || accessKey.value === "WEB3FORMS_ACCESS_KEY") {
      status.textContent = "Form henüz etkin değil. Lütfen info@omay.com.tr adresine e-posta gönderin.";
      status.classList.add("is-error");
      return;
    }

    status.textContent = "";
    status.classList.remove("is-error");
    submitButton.disabled = true;
    submitButton.textContent = "Gönderiliyor...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Form gönderilemedi");
      }

      form.reset();
      status.textContent = "Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.";
    } catch (error) {
      status.textContent = "Talebiniz gönderilemedi. Lütfen info@omay.com.tr adresine e-posta gönderin.";
      status.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonText;
    }
  });
});
