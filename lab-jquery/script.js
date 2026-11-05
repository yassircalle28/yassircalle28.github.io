
$(document).ready(function () {

    // CONFIGURACIÓN DE LOS DEPORTES

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


    // CAMBIO DINÁMICO DE TEMÁTICA CON JQUERY

    function changeTheme(name) {

        const t = themes[name] || themes.futbol;

        // Cambiar clases CSS
        $("body")
            .removeClass("theme-futbol theme-wally theme-futsal")
            .addClass("theme-" + name);

        // Actualizar tarjeta seleccionada
        $(".sport-card").removeClass("active");

        $('.sport-card[data-sport="' + name + '"]')
            .addClass("active");

        // Animación y cambio de contenido
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

        // Sincronizar selector de reserva
        $("#sport-select").val(name);

    }


    // EVENTO DE SELECCIÓN DE DEPORTE

    $(".sport-card").on("click", function () {

        const sport = $(this).data("sport");

        changeTheme(sport);

    });


    // CAMBIAR DEPORTE DESDE EL SELECTOR

    $("#sport-select").on("change", function () {

        changeTheme($(this).val());

    });


    // EFECTOS VISUALES Y DESPLIEGUE

    $(".feature").hide().each(function (i) {

        $(this).delay(i * 130).slideDown(450);

    });


    // Animación al pasar el cursor

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


    // Efecto de aparición del texto

    $("#hero-description").hide().slideDown(600);


    // CALCULADORA DE TARIFAS

    // Precio por hora: 40 BOB

    function updateTotal() {

        let hours = parseInt($("#hours").val(), 10);

        if (isNaN(hours)) {
            hours = 1;
        }

        // Mínimo 1 hora y máximo 12 horas
        hours = Math.max(1, Math.min(12, hours));

        $("#hours").val(hours);

        let total = hours * 40;

        $("#total")
            .html(total + " <small>BOB</small>")
            .hide()
            .fadeIn(180);

    }


    // Actualización en tiempo real

    $("#hours").on("input change", function () {

        updateTotal();

    });


    // Botón para restar horas

    $("#minus").on("click", function () {

        let hours = parseInt($("#hours").val(), 10) || 1;

        $("#hours").val(Math.max(1, hours - 1));

        updateTotal();

    });


    // Botón para aumentar horas

    $("#plus").on("click", function () {

        let hours = parseInt($("#hours").val(), 10) || 1;

        $("#hours").val(Math.min(12, hours + 1));

        updateTotal();

    });


    // VENTANA MODAL DE CONFIRMACIÓN

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


    // ABRIR MODAL

    $("#confirm").on("click", function () {

        updateTotal();

        const sport = $("#sport-select option:selected").text();

        const hours = Number($("#hours").val());

        const total = hours * 40;


        // Mostrar resumen de la reserva

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


        // Mostrar ventana modal

        $("#modal")
            .css("display", "flex")
            .hide()
            .attr("aria-hidden", "false")
            .fadeIn(220);


        // INICIAR TEMPORIZADOR DE 30 SEGUNDOS

        seconds = 30;

        $("#countdown").text(seconds);

        clearInterval(timer);


        timer = setInterval(function () {

            seconds--;

            $("#countdown").text(seconds);


            // Cerrar automáticamente al llegar a cero

            if (seconds <= 0) {

                closeModal();

                alert(
                    "El tiempo de confirmación expiró. Puedes iniciar una nueva reserva."
                );

            }

        }, 1000);

    });


    // BOTÓN CERRAR

    $("#close").on("click", function () {

        closeModal();

    });


    // BOTÓN VOLVER

    $("#cancel").on("click", function () {

        closeModal();

    });


    // CERRAR AL HACER CLIC FUERA DE LA VENTANA

    $("#modal").on("click", function (e) {

        if (e.target === this) {

            closeModal();

        }

    });


    // CONFIRMAR RESERVA

    $("#accept").on("click", function () {

        clearInterval(timer);

        $("#modal-message").text(
            "¡Solicitud confirmada en esta demostración! ⚽"
        );

        $(this)
            .prop("disabled", true)
            .text("Confirmado ✓");

        setTimeout(closeModal, 1500);

    });


    // INICIALIZAR CALCULADORA

    updateTotal();

});
