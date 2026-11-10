document.addEventListener("DOMContentLoaded", () => {
    const htmlRoot = document.documentElement;

    // NAVEGACIÓN ENTRE SECCIONES
    const navButtons = document.querySelectorAll(".nav-btn");
    const views = document.querySelectorAll(".view");
    const sidebar = document.getElementById("sidebar");
    const hamburger = document.getElementById("hamburger");
    const overlay = document.getElementById("sidebar-overlay");

    function closeMenu() {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("show");
        hamburger?.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
        sidebar?.classList.add("open");
        overlay?.classList.add("show");
        hamburger?.setAttribute("aria-expanded", "true");
    }

    function switchView(targetId) {
        const target = document.getElementById(targetId);
        if (!target || !target.classList.contains("view")) return;

        views.forEach(view => {
            view.classList.toggle("active", view.id === targetId);
        });

        navButtons.forEach(button => {
            const active = button.dataset.target === targetId;
            button.classList.toggle("active", active);
            if (active) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        closeMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            switchView(button.dataset.target);
        });
    });

    document.querySelectorAll("[data-go]").forEach(button => {
        button.addEventListener("click", () => {
            switchView(button.dataset.go);
        });
    });

    hamburger?.addEventListener("click", () => {
        if (sidebar?.classList.contains("open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay?.addEventListener("click", closeMenu);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMenu();
    });

    // MODO CLARO Y OSCURO
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const themeLabel = document.getElementById("theme-label");

    function applyTheme(theme) {
        const selectedTheme = theme === "light" ? "light" : "dark";
        htmlRoot.setAttribute("data-theme", selectedTheme);
        htmlRoot.style.colorScheme = selectedTheme;

        if (themeIcon) {
            themeIcon.textContent = selectedTheme === "dark" ? "☀" : "☾";
        }
        if (themeLabel) {
            themeLabel.textContent = selectedTheme === "dark"
                ? "Activar modo claro"
                : "Activar modo oscuro";
        }
    }

    let savedTheme = "dark";
    try {
        savedTheme = localStorage.getItem("theme") || "dark";
    } catch (error) {
        console.warn("No se pudo leer la preferencia de tema.");
    }

    applyTheme(savedTheme);

    themeToggle?.addEventListener("click", () => {
        const nextTheme =
            htmlRoot.getAttribute("data-theme") === "dark" ? "light" : "dark";

        applyTheme(nextTheme);

        try {
            localStorage.setItem("theme", nextTheme);
        } catch (error) {
            console.warn("No se pudo guardar la preferencia de tema.");
        }
    });

    // CARRUSEL
    const images = [...document.querySelectorAll("#slides img")];
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");
    let currentIndex = 0;

    function showSlide(index) {
        if (images.length === 0) return;

        currentIndex = (index + images.length) % images.length;

        images.forEach((image, position) => {
            const active = position === currentIndex;
            image.classList.toggle("active", active);
            image.setAttribute("aria-hidden", String(!active));
        });
    }

    prevButton?.addEventListener("click", () => {
        showSlide(currentIndex - 1);
    });

    nextButton?.addEventListener("click", () => {
        showSlide(currentIndex + 1);
    });

    showSlide(0);

    // FILTROS DE MÚSICA
    const filterButtons = document.querySelectorAll(".filter-btn");
    const musicItems = document.querySelectorAll(".music-item");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(item => {
                item.classList.toggle("active", item === button);
            });

            const selectedFilter = button.dataset.filter;

            musicItems.forEach(item => {
                const matches =
                    selectedFilter === "all" ||
                    item.dataset.category === selectedFilter;

                item.hidden = !matches;
            });
        });
    });

    // VALIDACIÓN DEL FORMULARIO
    const form = document.getElementById("form");

    form?.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const message = document.getElementById("message").value.trim();

        const nameError = document.getElementById("nameErr");
        const phoneError = document.getElementById("phoneErr");
        const messageError = document.getElementById("msgErr");
        const status = document.getElementById("status");

        nameError.textContent = "";
        phoneError.textContent = "";
        messageError.textContent = "";
        status.textContent = "";

        let valid = true;

        const validName = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)+$/;
        const validPhone = /^\d{7,15}$/;

        if (!validName.test(name)) {
            nameError.textContent = "Ingresa tu nombre y apellido correctamente.";
            valid = false;
        }

        if (!validPhone.test(phone)) {
            phoneError.textContent = "Ingresa un teléfono de 7 a 15 dígitos.";
            valid = false;
        }

        if (message.length < 10) {
            messageError.textContent = "El mensaje debe tener al menos 10 caracteres.";
            valid = false;
        }

        if (valid) {
            status.textContent =
                "¡Formulario validado correctamente! Este formulario todavía no envía mensajes.";
            form.reset();
        } else {
            status.textContent = "Revisa los campos señalados.";
        }
    });

    // REGISTRO DEL SERVICE WORKER
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
        window.addEventListener("load", async () => {
            try {
                const registration =
                    await navigator.serviceWorker.register("./service-worker.js");

                console.log("PWA: Service Worker registrado.", registration.scope);
            } catch (error) {
                console.error("No se pudo registrar el Service Worker:", error);
            }
        });
    }
});