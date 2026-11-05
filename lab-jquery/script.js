
$(document).ready(function () {

    // =====================================
    // 1. CONFIGURACIÓN DE DEPORTES
    // =====================================

    const themes = {

        futbol: {
            mode: "MODO FÚTBOL",
            icon: "⚽",
            title: "La pasión se juega",
            sub: "En cada minuto.",
            word: "a jugar.",
            tag: "PASIÓN AZULGRANA",
            watermark: "FCB",
            description: "Reúne a tu equipo, elige tu horario y vive el fútbol como se debe. Tu espacio deportivo está a un clic."
        },

        wally: {
            mode: "MODO WALLY",
            icon: "🏐",
            title: "Salta por la victoria",
            sub: "Cada punto cuenta.",
            word: "a saltar.",
            tag: "POTENCIA Y PRECISIÓN",
            watermark: "WALLY",
            description: "Activa tu energía, arma tu equipo y disfruta de cada punto en una cancha lista para el desafío."
        },

        futsal: {
            mode: "MODO FUTSAL",
            icon: "🥅",
            title: "Ritmo de cancha",
            sub: "No dejes de atacar.",
            word: "a competir.",
            tag: "JUEGO SIN PAUSA",
            watermark: "FUTSAL",
            description: "Partidos intensos, pases rápidos y goles inolvidables. Reserva tu espacio y que ruede el balón."
        }

    };


    // =====================================
    // 2. CAMBIO DINÁMICO DE TEMÁTICA
    // =====================================

    function changeTheme(name) {

        const t = themes[name];

        if (!t) return;

        $("body")
            .removeClass("theme-futbol theme-wally theme-futsal")
            .addClass("theme-" + name);

        $(".sport-card").removeClass("active");

        $('.sport-card[data-sport="' + name + '"]')
            .addClass("active");

        $(".hero-photo").stop(true, true).fadeTo(160, 0.35, function () {

            $("#hero-mode").text(t.mode);

            $("#hero-icon, #float-icon").text(t.icon);

            $("#float-title").text(t.title);

            $("#float-sub").text(t.sub);

            $("#hero-word").text(t.word);

            $("#hero-tag").text(t.tag);

            $("#watermark").text(t.watermark);

            $("#hero-description").text(t.description);

            $(this).fadeTo(260, 1);

        });

        $("#sport-select").val(name);

        const formValues = {
            futbol: "Fútbol",
            wally: "Wally",
            futsal: "Futsal"
        };

        $("#form-sport").val(formValues[name]);

    }


    // Seleccionar deporte mediante tarjetas

    $(".sport-card").on("click", function () {

        changeTheme($(this).data("sport"));

    });


    // Seleccionar deporte desde la calculadora

    $("#sport-select").on("change", function () {

        changeTheme($(this).val());

    });


    // =====================================
    // 3. ANIMACIONES JQUERY
    // =====================================

    $(".feature").hide().each(function (i) {

        $(this).delay(i * 130).slideDown(450);

    });


    $(".feature")

        .on("mouseenter", function () {

            $(this).stop(true).animate({
                top: "-5px"
            }, 160);

        })

        .on("mouseleave", function () {

            $(this).stop(true).animate({
                top: "0px"
            }, 160);

        });


    $("#hero-description").hide().slideDown(600);


    // =====================================
    // 4. MENÚ HAMBURGUESA
    // =====================================

    $("#menu-toggle").on("click", function () {

        const menu = $("#main-menu");

        menu.toggleClass("open");

        const expanded = menu.hasClass("open");

        $(this).attr("aria-expanded", expanded);

        $(this).attr(
            "aria-label",
            expanded ? "Cerrar menú" : "Abrir menú"
        );

    });


    // Cerrar menú después de seleccionar una sección

    $("#main-menu a").on("click", function () {

        $("#main-menu").removeClass("open");

        $("#menu-toggle")
            .attr("aria-expanded", "false")
            .attr("aria-label", "Abrir menú");

    });


    // =====================================
    // 5. MODO OSCURO Y MODO CLARO
    // =====================================

    function applyTheme(theme) {

        $("body").toggleClass(
            "light-mode",
            theme === "light"
        );

        $("#theme-toggle").text(
            theme === "light" ? "🌙" : "☀️"
        );

        localStorage.setItem(
            "deporzone-theme",
            theme
        );

    }


    // Recuperar preferencia guardada

    const savedTheme =
        localStorage.getItem("deporzone-theme") || "dark";

    applyTheme(savedTheme);


    $("#theme-toggle").on("click", function () {

        const newTheme =
            $("body").hasClass("light-mode")
                ? "dark"
                : "light";

        applyTheme(newTheme);

    });


    // =====================================
    // 6. FILTRO DE DEPORTES
    // =====================================

    $(".filter-btn").on("click", function () {

        const filter = $(this).data("filter");

        $(".filter-btn").removeClass("active");

        $(this).addClass("active");

        let visible = 0;

        $(".sport-card").each(function () {

            const category = $(this).data("category");

            if (filter === "all" || category === filter) {

                $(this).stop(true, true).fadeIn(300);

                visible++;

            } else {

                $(this).stop(true, true).fadeOut(200);

            }

        });


        if (filter === "all") {

            $("#filter-result").text(
                "Mostrando todos los deportes."
            );

        } else {

            $("#filter-result").text(
                "Mostrando " + visible + " deporte seleccionado."
            );

        }

    });


    // =====================================
    // 7. CARRUSEL AUTOMÁTICO
    // =====================================

    let currentSlide = 0;

    const slides = $(".carousel-slide");

    const dots = $(".dot");

    const totalSlides = slides.length;

    let carouselTimer;


    function showSlide(index) {

        currentSlide =
            (index + totalSlides) % totalSlides;

        slides.removeClass("active");

        dots.removeClass("active");

        slides.eq(currentSlide).addClass("active");

        dots.eq(currentSlide).addClass("active");

    }


    // Siguiente imagen

    $("#next-slide").on("click", function () {

        showSlide(currentSlide + 1);

        restartCarousel();

    });


    // Imagen anterior

    $("#prev-slide").on("click", function () {

        showSlide(currentSlide - 1);

        restartCarousel();

    });


    // Selección mediante puntos

    $(".dot").on("click", function () {

        showSlide(Number($(this).data("slide")));

        restartCarousel();

    });


    // Cambio automático cada cinco segundos

    function startCarousel() {

        carouselTimer = setInterval(function () {

            showSlide(currentSlide + 1);

        }, 5000);

    }


    function restartCarousel() {

        clearInterval(carouselTimer);

        startCarousel();

    }


    // Pausar al colocar el cursor sobre el carrusel

    $(".carousel").on("mouseenter", function () {

        clearInterval(carouselTimer);

    });


    $(".carousel").on("mouseleave", function () {

        restartCarousel();

    });


    startCarousel();


    // =====================================
    // 8. CALCULADORA DE TARIFAS
    // =====================================

    // Precio por hora: 40 BOB

    function updateTotal() {

        let hours = parseInt($("#hours").val(), 10);

        if (isNaN(hours)) {

            hours = 1;

        }

        hours = Math.max(1, Math.min(12, hours));

        $("#hours").val(hours);

        const total = hours * 40;

        $("#total")
            .html(total + " <small>BOB</small>")
            .hide()
            .fadeIn(180);

    }


    // Actualizar cuando se modifica el número de horas

    $("#hours").on("input change", updateTotal);


    // Restar una hora

    $("#minus").on("click", function () {

        const hours =
            parseInt($("#hours").val(), 10) || 1;

        $("#hours").val(
            Math.max(1, hours - 1)
        );

        updateTotal();

    });


    // Agregar una hora

    $("#plus").on("click", function () {

        const hours =
            parseInt($("#hours").val(), 10) || 1;

        $("#hours").val(
            Math.min(12, hours + 1)
        );

        updateTotal();

    });


    // =====================================
    // 9. FECHA MÍNIMA DEL FORMULARIO
    // =====================================

    const today = new Date();

    const localDate = new Date(
        today.getTime() -
        today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    $("#fecha").attr("min", localDate);


    // =====================================
    // 10. VALIDACIÓN DEL FORMULARIO
    // =====================================

    $("#reservation-form").on("submit", function (e) {

        e.preventDefault();

        const nombre = $("#nombre").val().trim();

        const telefono = $("#telefono").val().trim();

        const correo = $("#correo").val().trim();

        const fecha = $("#fecha").val();

        const hora = $("#hora").val();

        const deporte = $("#form-sport").val();

        const comentario = $("#comentario").val().trim();


        // Comprobar campos obligatorios

        if (!this.checkValidity()) {

            this.reportValidity();

            return;

        }


        // Evitar nombres demasiado cortos

        if (nombre.length < 3) {

            $("#form-message")
                .css("color", "#e76b6b")
                .text("El nombre debe tener al menos 3 caracteres.");

            return;

        }


        // Evitar fechas pasadas

        if (fecha < localDate) {

            $("#form-message")
                .css("color", "#e76b6b")
                .text("No puedes seleccionar una fecha pasada.");

            return;

        }


        // Confirmación visual

        $("#form-message")
            .hide()
            .css("color", "#49d6b4")
            .text(
                "¡Solicitud recibida, " + nombre +
                "! Tu solicitud de " + deporte +
                " para el día " + fecha +
                " a las " + hora +
                " ha sido registrada en esta demostración."
            )
            .fadeIn(400);


        // Mostrar datos en consola para la demostración

        console.log("DATOS DE LA SOLICITUD");

        console.log({
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            fecha: fecha,
            hora: hora,
            deporte: deporte,
            comentario: comentario
        });


        // Limpiar formulario

        this.reset();

        $("#fecha").attr("min", localDate);

    });


    // =====================================
    // 11. VENTANA MODAL
    // =====================================

    let timer = null;

    let seconds = 30;


    // Función para cerrar el modal

    function closeModal() {

        $("#modal")
            .stop(true, true)
            .fadeOut(180)
            .attr("aria-hidden", "true");

        clearInterval(timer);

    }


    // Abrir ventana modal

    $("#confirm").on("click", function () {

        updateTotal();

        const sport =
            $("#sport-select option:selected").text();

        const hours =
            Number($("#hours").val());

        const total = hours * 40;


        // Preparar resumen

        $("#summary").text(
            "Elegiste " + sport +
            " durante " + hours +
            " hora(s). Total: " + total +
            " BOB. Es una demostración académica."
        );


        $("#modal-message").text("");

        $("#accept")
            .prop("disabled", false)
            .text("Sí, confirmar");


        // Mostrar modal

        $("#modal")
            .css("display", "flex")
            .hide()
            .attr("aria-hidden", "false")
            .fadeIn(220);


        // Iniciar temporizador

        seconds = 30;

        $("#countdown").text(seconds);

        clearInterval(timer);


        timer = setInterval(function () {

            seconds--;

            $("#countdown").text(seconds);


            // Cerrar al llegar a cero

            if (seconds <= 0) {

                closeModal();

                alert(
                    "El tiempo de confirmación expiró. Puedes iniciar una nueva reserva."
                );

            }

        }, 1000);

    });


    // =====================================
    // 12. BOTONES DEL MODAL
    // =====================================

    // Cerrar con la X

    $("#close").on("click", closeModal);


    // Volver

    $("#cancel").on("click", closeModal);


    // Cerrar al hacer clic fuera de la ventana

    $("#modal").on("click", function (e) {

        if (e.target === this) {

            closeModal();

        }

    });


    // Confirmar solicitud

    $("#accept").on("click", function () {

        clearInterval(timer);

        $("#modal-message").text(
            "¡Solicitud confirmada en esta demostración! ⚽"
        );

        $(this)
            .prop("disabled", true)
            .text("Confirmado ✓");

        setTimeout(function () {

            closeModal();

        }, 1500);

    });


    // =====================================
    // 13. ANIMACIONES INICIALES
    // =====================================

    $(".gallery").hide().fadeIn(700);

    updateTotal();

});
