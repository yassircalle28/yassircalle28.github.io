/* ==========================================================================
   PERFIL PROFESIONAL & CATÁLOGO PWA - YASSIR ALI CALLE ENRÍQUEZ
   Materia: SIS-0141 Diseño Web II - UPDS Sede La Paz
   Docente: Ing. Miguel Angel Cruz Ramos
   Librería: jQuery 3.7.1 | Sanitización: DOMPurify 3.1.6
   ========================================================================== */

$(document).ready(function () {
    "use strict";

    // ==========================================================================
    // 1. HIDRATACIÓN DEL MENÚ Y NAVEGACIÓN SPA
    // ==========================================================================
    const $navMenu = $("#nav-menu");
    const $sidebar = $("#sidebar");
    const $hamburger = $("#hamburger");

    // Patrón de Hidratación: el menú llega con data-hidratado="false"
    if ($navMenu.attr("data-hidratado") === "false") {
        // Enlazar eventos de navegación a los botones estáticos sin redibujar
        $(document).off("click", ".nav-menu__btn").on("click", ".nav-menu__btn", function () {
            const targetView = $(this).attr("data-target");
            cambiarVista(targetView);
        });

        // Enlaces con data-go
        $(document).off("click", "[data-go]").on("click", "[data-go]", function () {
            const targetView = $(this).attr("data-go");
            cambiarVista(targetView);
        });

        // Marcar hidratación completada
        $navMenu.attr("data-hidratado", "true");
    }

    function cambiarVista(targetId) {
        if (!targetId) return;

        // Ocultar todas las secciones y activar la seleccionada
        $(".view-section").removeClass("view-section--active");
        const $seccionDestino = $("#" + targetId);
        if ($seccionDestino.length) {
            $seccionDestino.addClass("view-section--active");
        }

        // Actualizar estado activo en la barra de navegación
        $(".nav-menu__btn").removeClass("nav-menu__btn--active").removeAttr("aria-current");
        $('.nav-menu__btn[data-target="' + targetId + '"]')
            .addClass("nav-menu__btn--active")
            .attr("aria-current", "page");

        // En pantallas móviles, cerrar el sidebar si está abierto
        if ($(window).width() < 768 && $sidebar.is(":visible")) {
            $sidebar.slideUp(250);
            $hamburger.attr("aria-expanded", "false");
        }

        // Desplazamiento suave a la cabecera
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Menú Hamburguesa con slideToggle(300) y atributos accesibles
    $hamburger.on("click", function () {
        const estaDesplegado = $sidebar.is(":visible");
        $sidebar.stop(true, true).slideToggle(300, function () {
            const visible = $(this).is(":visible");
            $hamburger.attr("aria-expanded", String(visible));
        });
    });

    // Cerrar menú móvil al presionar tecla Escape
    $(document).on("keydown", function (e) {
        if (e.key === "Escape" && $(window).width() < 768 && $sidebar.is(":visible")) {
            $sidebar.slideUp(250);
            $hamburger.attr("aria-expanded", "false");
        }
    });

    // ==========================================================================
    // 2. THEME TOGGLE (MODO OSCURO / CLARO) CON LOCALSTORAGE EN TRY/CATCH
    // ==========================================================================
    const $themeToggle = $("#theme-toggle");
    const $themeIcon = $("#theme-icon");
    const $themeLabel = $("#theme-label");
    const $indicadorTema = $("#indicadorTema");

    function aplicarTema(modoClaro) {
        if (modoClaro) {
            $("body").addClass("theme-light").removeClass("dark-theme");
            $themeToggle.attr("aria-pressed", "false");
            $themeIcon.text("☾");
            $themeLabel.text("Activar Modo Oscuro");
            $indicadorTema.text("Tema: Claro Ejecutivo");
        } else {
            $("body").addClass("dark-theme").removeClass("theme-light");
            $themeToggle.attr("aria-pressed", "true");
            $themeIcon.text("☀");
            $themeLabel.text("Activar Modo Claro");
            $indicadorTema.text("Tema: Oscuro Ejecutivo");
        }
    }

    // Recuperar preferencia de tema en localStorage dentro de try/catch
    let preferenciaTema = "dark";
    try {
        preferenciaTema = localStorage.getItem("perfil_yassir_tema") || "dark";
    } catch (err) {
        console.warn("No se pudo acceder a localStorage para leer el tema:", err);
    }
    aplicarTema(preferenciaTema === "light");

    // Evento click en el botón de alternar tema
    $themeToggle.on("click", function () {
        const esModoClaroActual = $("body").hasClass("theme-light");
        const nuevoModoClaro = !esModoClaroActual;
        aplicarTema(nuevoModoClaro);

        try {
            localStorage.setItem("perfil_yassir_tema", nuevoModoClaro ? "light" : "dark");
        } catch (err) {
            console.warn("No se pudo guardar el tema en localStorage:", err);
        }
    });

    // ==========================================================================
    // 3. CARRUSEL DE IMÁGENES
    // ==========================================================================
    const $slides = $(".carousel-slide");
    let diapositivaActual = 0;

    function mostrarDiapositiva(indice) {
        if ($slides.length === 0) return;
        diapositivaActual = (indice + $slides.length) % $slides.length;
        $slides.each(function (pos) {
            const activo = pos === diapositivaActual;
            $(this).toggleClass("active", activo).attr("aria-hidden", String(!activo));
        });
    }

    $("#prev").on("click", function () {
        mostrarDiapositiva(diapositivaActual - 1);
    });

    $("#next").on("click", function () {
        mostrarDiapositiva(diapositivaActual + 1);
    });

    // ==========================================================================
    // 4. CATÁLOGO DINÁMICO ASÍNCRONO (catalogo.json), BEM Y ANTI-XSS
    // ==========================================================================
    let listaCatalogo = [];
    const itemsSeleccionados = new Set();

    function cargarCatalogo() {
        fetch("./catalogo.json")
            .then(function (respuesta) {
                if (!respuesta.ok) {
                    throw new Error("Respuesta de red no válida: " + respuesta.status);
                }
                return respuesta.json();
            })
            .then(function (datos) {
                if (!Array.isArray(datos) || datos.length === 0) {
                    throw new Error("El catálogo no contiene elementos válidos.");
                }
                listaCatalogo = datos;
                poblarSubcategorias();
                renderizarCatalogo(listaCatalogo);
            })
            .catch(function (error) {
                console.error("Error al cargar catalogo.json:", error);
                $("#mensajeErrorCatalogo")
                    .text("No se pudo cargar el catálogo de proyectos en este momento. Inténtelo más tarde.")
                    .show();
            });
    }

    // Renderizar tarjetas construyendo nodos DOM de forma segura (Anti-XSS riguroso)
    function renderizarCatalogo(items) {
        const $grilla = $("#grilla-catalogo");
        $grilla.empty();

        if (items.length === 0) {
            const $vacio = $("<p>").addClass("info-card__desc").text("No se encontraron ítems para los filtros seleccionados.");
            $grilla.append($vacio);
            return;
        }

        items.forEach(function (item) {
            const $card = $("<article>")
                .addClass("card-item")
                .attr("data-id", item.id)
                .attr("data-area", item.area)
                .attr("data-subcat", item.subcategoria);

            if (itemsSeleccionados.has(item.id)) {
                $card.addClass("card-item--activo");
            }

            // Cabecera de la tarjeta
            const $top = $("<div>").addClass("card-item__top");
            const $icono = $("<div>").addClass("card-item__icono").text(item.icono || "📌");
            const $badge = $("<span>").addClass("card-item__badge").text(item.subcategoria || item.area);
            $top.append($icono, $badge);

            // Título y resumen
            const $titulo = $("<h3>").addClass("card-item__titulo").text(item.titulo);
            const $desc = $("<p>").addClass("card-item__desc").text(item.resumen);

            // Paneles desplegables (Acordeón)
            const $acordeonPanel = $("<div>")
                .addClass("card-item__acordeon accordion-panel")
                .text(item.detalles);

            const $fichaPanel = $("<div>")
                .addClass("card-item__ficha-panel")
                .text(item.ficha);

            // Estado
            const estadoTexto = itemsSeleccionados.has(item.id)
                ? "Estado: Seleccionado (Simulación)"
                : "Estado: " + (item.estado || "Disponible");
            const $estado = $("<div>").addClass("card-item__estado").text(estadoTexto);

            // Botones de acción
            const $acciones = $("<div>").addClass("card-item__acciones");
            const $btnDetalles = $("<button>")
                .attr("type", "button")
                .addClass("accordion-btn")
                .text("Ver Detalles");

            const $btnFicha = $("<button>")
                .attr("type", "button")
                .addClass("btn-ficha")
                .text("Ficha Técnica");

            const $btnSimular = $("<button>")
                .attr("type", "button")
                .addClass("btn-simular")
                .text("Simular");

            const $btnSelect = $("<button>")
                .attr("type", "button")
                .addClass("btn-seleccionar-card")
                .text(itemsSeleccionados.has(item.id) ? "Deseleccionar" : "Seleccionar");

            $acciones.append($btnDetalles, $btnFicha, $btnSimular, $btnSelect);

            $card.append($top, $titulo, $desc, $acordeonPanel, $fichaPanel, $estado, $acciones);
            $grilla.append($card);
        });
    }

    // ==========================================================================
    // 5. DELEGACIÓN DE EVENTOS EN TARJETAS (ACORDEÓN FAST/SLOW Y SIMULACIÓN)
    // ==========================================================================
    // Acordeón 'fast' en "Ver Detalles"
    $(document).off("click", ".accordion-btn").on("click", ".accordion-btn", function () {
        const $panel = $(this).closest(".card-item").find(".card-item__acordeon");
        $panel.stop(true, true).slideToggle("fast");
    });

    // Panel de Ficha Técnica 'slow'
    $(document).off("click", ".btn-ficha").on("click", ".btn-ficha", function () {
        const $ficha = $(this).closest(".card-item").find(".card-item__ficha-panel");
        $ficha.stop(true, true).slideToggle("slow");
    });

    // Botón .btn-simular en cada tarjeta: alterna estado sin recargar
    $(document).off("click", ".btn-simular").on("click", ".btn-simular", function () {
        const $card = $(this).closest(".card-item");
        const $estado = $card.find(".card-item__estado");
        const esSeleccionado = $estado.text().includes("Seleccionado");

        if (esSeleccionado) {
            $estado.text("Estado: Disponible");
            $card.removeClass("card-item--activo");
        } else {
            $estado.text("Estado: Seleccionado (Simulación)");
            $card.addClass("card-item--activo");
        }
    });

    // Selección interactiva y contador de ítems
    $(document).off("click", ".btn-seleccionar-card").on("click", ".btn-seleccionar-card", function () {
        const $card = $(this).closest(".card-item");
        const id = $card.attr("data-id");
        const $btn = $(this);
        const $estado = $card.find(".card-item__estado");

        if (itemsSeleccionados.has(id)) {
            itemsSeleccionados.delete(id);
            $card.removeClass("card-item--activo");
            $btn.text("Seleccionar");
            $estado.text("Estado: Disponible");
        } else {
            itemsSeleccionados.add(id);
            $card.addClass("card-item--activo");
            $btn.text("Deseleccionar");
            $estado.text("Estado: Seleccionado (Simulación)");
        }

        actualizarContadorSeleccionados();
    });

    function actualizarContadorSeleccionados() {
        const total = itemsSeleccionados.size;
        $("#contadorSeleccionados").text(total + " ítem(s) seleccionado(s)");
    }

    // Botón "Contactar Seleccionados"
    $("#btnContactarSeleccionados").on("click", function () {
        const titulos = [];
        itemsSeleccionados.forEach(function (id) {
            const item = listaCatalogo.find(i => i.id === id);
            if (item) titulos.push(item.titulo);
        });

        cambiarVista("view-contacto");
        if (titulos.length > 0) {
            $("#message").val("Hola Yassir, estoy interesado en los siguientes servicios o proyectos que seleccioné de tu catálogo:\n- " + titulos.join("\n- "));
        }
    });

    // ==========================================================================
    // 6. FILTRO DINÁMICO DE 3 CAPAS EN CASCADA & RETO PRO (+0.5)
    // ==========================================================================
    const $filtroCapa1 = $("#filtroCapa1");
    const $filtroCapa2 = $("#filtroCapa2");
    const $filtroCapa3 = $("#filtroCapa3");
    const $contenedorCatalogo = $("#contenedor-catalogo");
    const $iconoArea = $("#icono-area");

    function poblarSubcategorias() {
        const areaSeleccionada = $filtroCapa1.val();
        $filtroCapa2.empty();
        $filtroCapa2.append($("<option>").val("all").text("Todas las especialidades"));

        const subcats = new Set();
        listaCatalogo.forEach(function (item) {
            if (areaSeleccionada === "all" || item.area === areaSeleccionada) {
                if (item.subcategoria) subcats.add(item.subcategoria);
            }
        });

        subcats.forEach(function (subcat) {
            $filtroCapa2.append($("<option>").val(subcat).text(subcat));
        });
    }

    // RETO PRO (+0.5): Cambiar degradado temático y emoji principal con .text() (NO .html())
    function aplicarRetoPro(area) {
        $contenedorCatalogo.removeClass("gradiente-desarrollo gradiente-sistemas gradiente-servicios");

        if (area === "desarrollo") {
            $contenedorCatalogo.addClass("gradiente-desarrollo");
            $iconoArea.text("💻");
        } else if (area === "sistemas") {
            $contenedorCatalogo.addClass("gradiente-sistemas");
            $iconoArea.text("⚙️");
        } else if (area === "servicios") {
            $contenedorCatalogo.addClass("gradiente-servicios");
            $iconoArea.text("💼");
        } else {
            $iconoArea.text("❖");
        }
    }

    function ejecutarFiltroCascada(animarFade) {
        const capa1 = $filtroCapa1.val();
        const capa2 = $filtroCapa2.val();
        const capa3 = ($filtroCapa3.val() || "").toLowerCase().trim();

        const filtrados = listaCatalogo.filter(function (item) {
            const cumpleCapa1 = (capa1 === "all" || item.area === capa1);
            const cumpleCapa2 = (capa2 === "all" || item.subcategoria === capa2);
            const cumpleCapa3 = (!capa3 ||
                item.titulo.toLowerCase().includes(capa3) ||
                item.resumen.toLowerCase().includes(capa3) ||
                item.detalles.toLowerCase().includes(capa3));

            return cumpleCapa1 && cumpleCapa2 && cumpleCapa3;
        });

        if (animarFade) {
            $("#grilla-catalogo").fadeOut(180, function () {
                renderizarCatalogo(filtrados);
                $(this).fadeIn(220);
            });
        } else {
            renderizarCatalogo(filtrados);
        }
    }

    // Eventos de las 3 capas
    $filtroCapa1.on("change", function () {
        const area = $(this).val();
        aplicarRetoPro(area);
        poblarSubcategorias();

        // Sincronizar botones .btn-area
        $(".btn-area").removeClass("active");
        $('.btn-area[data-area="' + area + '"]').addClass("active");

        ejecutarFiltroCascada(true);
    });

    $filtroCapa2.on("change", function () {
        ejecutarFiltroCascada(true);
    });

    $filtroCapa3.on("input", function () {
        ejecutarFiltroCascada(false);
    });

    // Botones directos .btn-area con .fadeOut()/.fadeIn() sin recargar
    $(".btn-area").on("click", function () {
        const area = $(this).attr("data-area");
        $(".btn-area").removeClass("active");
        $(this).addClass("active");

        $filtroCapa1.val(area);
        aplicarRetoPro(area);
        poblarSubcategorias();
        ejecutarFiltroCascada(true);
    });

    // Iniciar carga del catálogo
    cargarCatalogo();

    // ==========================================================================
    // 7. COTIZADOR DE SERVICIOS EN VIVO + MODAL + TEMPORIZADOR FLASH (RETO PRO)
    // ==========================================================================
    const $servicioCotizar = $("#servicioCotizar");
    const $inputHoras = $("#hrs");
    const $totalCotizacion = $("#totalCotizacion");
    let timerCotizacionInterval = null;
    let tiempoRestanteFlash = 30;

    function recalcularCotizacion() {
        let horas = parseInt($inputHoras.val(), 10);
        if (isNaN(horas) || horas < 1) {
            horas = 1;
        }

        const tarifa = parseInt($servicioCotizar.val(), 10) || 120;
        const subtotal = horas * tarifa;
        const descuento = Math.round(subtotal * 0.10); // 10% Descuento Tarifa Flash
        const total = subtotal - descuento;

        $("#resumenTarifa").text(tarifa + " BOB/hr");
        $("#resumenHoras").text(horas + " hr(s)");
        $("#resumenSubtotal").text(subtotal + " BOB");
        $("#resumenDescuento").text("-" + descuento + " BOB");

        // Resaltado con .animate() sobre propiedad numérica 'opacity'
        $totalCotizacion.stop(true, true)
            .animate({ opacity: 0.3 }, 120, function () {
                $(this).text(total + " BOB");
            })
            .animate({ opacity: 1 }, 120);

        return { horas, tarifa, subtotal, descuento, total };
    }

    // Input numérico: restricción de solo números y total en vivo
    $inputHoras.on("keypress", function (e) {
        if (e.which < 48 || e.which > 57) {
            e.preventDefault();
        }
    });

    $inputHoras.on("input", function () {
        this.value = this.value.replace(/\D/g, "");
        recalcularCotizacion();
    });

    $servicioCotizar.on("change", recalcularCotizacion);
    recalcularCotizacion();

    // Modal Real "Confirmar Cotización"
    const $modalCotizacion = $("#modalCotizacion");
    const $timerSpan = $("#timerCotizacion");
    const $toastAlerta = $("#toastAlerta");

    function limpiarTemporizadorModal() {
        if (timerCotizacionInterval !== null) {
            clearInterval(timerCotizacionInterval);
            timerCotizacionInterval = null;
        }
    }

    $("#btnAbrirModalCotizacion").on("click", function () {
        const datos = recalcularCotizacion();
        const nombreServicio = $servicioCotizar.find("option:selected").attr("data-nombre");

        $("#detalleServicioModal").text(nombreServicio + " (" + datos.horas + " horas a " + datos.tarifa + " BOB/hr)");
        $("#montoCancelar").text(datos.total + " BOB");

        // Reiniciar temporizador a 30s sin duplicar intervalos
        limpiarTemporizadorModal();
        tiempoRestanteFlash = 30;
        $timerSpan.text("00:30s");

        $modalCotizacion.stop(true, true).fadeIn(200);

        timerCotizacionInterval = setInterval(function () {
            tiempoRestanteFlash--;
            const segStr = tiempoRestanteFlash < 10 ? "0" + tiempoRestanteFlash : String(tiempoRestanteFlash);
            $timerSpan.text("00:" + segStr + "s");

            if (tiempoRestanteFlash <= 0) {
                limpiarTemporizadorModal();
                $modalCotizacion.stop(true, true).fadeOut(250);
                mostrarToast("Tarifa Flash Expirada. Vuelve a abrir la cotización para reiniciar tu descuento.");
            }
        }, 1000);
    });

    function cerrarModalCotizacion() {
        limpiarTemporizadorModal();
        $modalCotizacion.stop(true, true).fadeOut(200);
    }

    $("#btnCerrarModal, #btnCancelarCotizacion").on("click", cerrarModalCotizacion);

    // Toast Alert flotante arriba a la derecha: slideDown, delay 3000, fadeOut
    function mostrarToast(mensaje) {
        $toastAlerta.text(mensaje).stop(true, true).slideDown(300).delay(3000).fadeOut(300);
    }

    // Confirmación y procesamiento de pago
    $("#btnProcesarPago").on("click", function () {
        const datos = recalcularCotizacion();
        cerrarModalCotizacion();

        if (navigator.onLine) {
            mostrarToast("¡Pago de " + datos.total + " BOB procesado con éxito! Recibirás la confirmación.");
        } else {
            // Guardar en cola offline
            encolarAccionOffline({
                tipo: "cotizacion",
                monto: datos.total,
                servicio: $servicioCotizar.find("option:selected").attr("data-nombre"),
                fecha: new Date().toISOString()
            });
            mostrarToast("Guardado localmente - Pendiente de envío (" + datos.total + " BOB).");
        }
    });

    // ==========================================================================
    // 8. FORMULARIO DE CONTACTO CON VALIDACIÓN EN TIEMPO REAL & COLA OFFLINE
    // ==========================================================================
    const $form = $("#form");
    const $nameInput = $("#name");
    const $emailInput = $("#email");
    const $phoneInput = $("#phone");
    const $msgInput = $("#message");

    const $nameErr = $("#nameErr");
    const $emailErr = $("#emailErr");
    const $phoneErr = $("#phoneErr");
    const $msgErr = $("#msgErr");
    const $alertaExito = $("#alertaExito");
    const $estadoColaOffline = $("#estadoColaOffline");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
    const soloNumerosRegex = /^\d+$/;

    // Restricción en tiempo real: Nombre SOLO LETRAS
    $nameInput.on("keypress", function (e) {
        const char = String.fromCharCode(e.which);
        if (!/[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/.test(char) && e.which !== 8 && e.which !== 0) {
            e.preventDefault();
        }
    });

    $nameInput.on("input", function () {
        this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, "");
        validarNombre();
    });

    // Restricción en tiempo real: Teléfono SOLO NÚMEROS
    $phoneInput.on("keypress", function (e) {
        if ((e.which < 48 || e.which > 57) && e.which !== 8 && e.which !== 0) {
            e.preventDefault();
        }
    });

    $phoneInput.on("input", function () {
        this.value = this.value.replace(/\D/g, "");
        validarTelefono();
    });

    function validarNombre() {
        const valor = $nameInput.val().trim();
        if (valor.length === 0) {
            $nameErr.text("El nombre es obligatorio y solo debe contener letras.").stop(true, true).fadeIn(200);
            return false;
        }
        if (!soloLetrasRegex.test(valor)) {
            $nameErr.text("El nombre solo debe contener letras y espacios (sin números).").stop(true, true).fadeIn(200);
            return false;
        }
        if (valor.length < 3) {
            $nameErr.text("El nombre debe tener al menos 3 letras.").stop(true, true).fadeIn(200);
            return false;
        }
        $nameErr.stop(true, true).fadeOut(200);
        return true;
    }

    function validarTelefono() {
        const valor = $phoneInput.val().trim();
        if (valor.length === 0) {
            $phoneErr.text("El teléfono es obligatorio y solo debe contener números.").stop(true, true).fadeIn(200);
            return false;
        }
        if (!soloNumerosRegex.test(valor)) {
            $phoneErr.text("El teléfono solo debe contener números (sin letras ni símbolos).").stop(true, true).fadeIn(200);
            return false;
        }
        if (valor.length < 7 || valor.length > 15) {
            $phoneErr.text("El teléfono debe tener entre 7 y 15 dígitos.").stop(true, true).fadeIn(200);
            return false;
        }
        $phoneErr.stop(true, true).fadeOut(200);
        return true;
    }

    function validarEmail() {
        const valor = $emailInput.val().trim();
        if (valor.length === 0) {
            $emailErr.text("El correo electrónico es obligatorio.").stop(true, true).fadeIn(200);
            return false;
        }
        if (!emailRegex.test(valor)) {
            $emailErr.text("Ingresa un correo electrónico válido (ejemplo@correo.com).").stop(true, true).fadeIn(200);
            return false;
        }
        $emailErr.stop(true, true).fadeOut(200);
        return true;
    }

    function validarMensaje() {
        const valor = $msgInput.val().trim();
        if (valor.length === 0) {
            $msgErr.text("El mensaje es obligatorio.").stop(true, true).fadeIn(200);
            return false;
        }
        if (valor.length < 8) {
            $msgErr.text("El mensaje debe contener al menos 8 caracteres.").stop(true, true).fadeIn(200);
            return false;
        }
        $msgErr.stop(true, true).fadeOut(200);
        return true;
    }

    $nameInput.on("blur", validarNombre);
    $phoneInput.on("blur", validarTelefono);
    $emailInput.on("input blur", validarEmail);
    $msgInput.on("input blur", validarMensaje);

    $form.on("submit", function (e) {
        e.preventDefault();

        const nombreValido = validarNombre();
        const telValido = validarTelefono();
        const emailValido = validarEmail();
        const msgValido = validarMensaje();

        if (!nombreValido || !telValido || !emailValido || !msgValido) {
            return;
        }

        const datosContacto = {
            nombre: $nameInput.val().trim(),
            email: $emailInput.val().trim(),
            telefono: $phoneInput.val().trim(),
            mensaje: $msgInput.val().trim(),
            fecha: new Date().toISOString()
        };

        if (navigator.onLine) {
            $alertaExito
                .text("¡Formulario validado y enviado con éxito! Me comunicaré contigo pronto.")
                .stop(true, true)
                .slideDown(250)
                .delay(3000)
                .slideUp(250);
            $form[0].reset();
        } else {
            // Guardar localmente en cola offline
            encolarAccionOffline({ tipo: "contacto", datos: datosContacto });
            $estadoColaOffline
                .text("Guardado localmente - Pendiente de envío")
                .stop(true, true)
                .fadeIn(200);

            $alertaExito
                .text("Sin conexión: Tu mensaje ha sido respaldado en la cola local.")
                .stop(true, true)
                .slideDown(250)
                .delay(3000)
                .slideUp(250);
            $form[0].reset();
        }
    });

    // ==========================================================================
    // 9. COLA OFFLINE-FIRST & ESTADO DE RED (#estadoRed)
    // ==========================================================================
    const $estadoRed = $("#estadoRed");

    function encolarAccionOffline(item) {
        try {
            const cola = JSON.parse(localStorage.getItem("perfil_yassir_cola_offline") || "[]");
            cola.push(item);
            localStorage.setItem("perfil_yassir_cola_offline", JSON.stringify(cola));
        } catch (e) {
            console.warn("No se pudo escribir en cola offline de localStorage:", e);
        }
    }

    function sincronizarColaOffline() {
        try {
            const cola = JSON.parse(localStorage.getItem("perfil_yassir_cola_offline") || "[]");
            if (cola.length > 0) {
                $estadoColaOffline
                    .text("Verificado: " + cola.length + " acción(es) offline sincronizada(s) con éxito.")
                    .stop(true, true)
                    .fadeIn(200)
                    .delay(4000)
                    .fadeOut(300);
                localStorage.removeItem("perfil_yassir_cola_offline");
            }
        } catch (e) {
            console.warn("Error al sincronizar cola offline:", e);
        }
    }

    function actualizarEstadoRed() {
        if (navigator.onLine) {
            $estadoRed
                .text("🟢 En Línea")
                .removeClass("badge-red--offline")
                .addClass("badge-red--online");
            sincronizarColaOffline();
        } else {
            $estadoRed
                .text("🟠 Modo Offline Activo")
                .removeClass("badge-red--online")
                .addClass("badge-red--offline");
        }
    }

    $(window).on("online offline", actualizarEstadoRed);
    actualizarEstadoRed();

    // ==========================================================================
    // 10. PWA: SERVICE WORKER & BOTÓN DE INSTALACIÓN (#btnInstalarApp)
    // ==========================================================================
    let eventoInstalacion = null;
    const $btnInstalarApp = $("#btnInstalarApp");

    window.addEventListener("beforeinstallprompt", function (e) {
        e.preventDefault();
        eventoInstalacion = e;
        $btnInstalarApp.prop("hidden", false).show();
    });

    $btnInstalarApp.on("click", function () {
        if (eventoInstalacion) {
            eventoInstalacion.prompt();
            eventoInstalacion.userChoice.then(function (resultado) {
                if (resultado.outcome === "accepted") {
                    console.log("PWA instalada por el usuario.");
                }
                eventoInstalacion = null;
                $btnInstalarApp.prop("hidden", true).hide();
            });
        }
    });

    window.addEventListener("appinstalled", function () {
        $btnInstalarApp.prop("hidden", true).hide();
    });

    // Registro de Service Worker
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
        window.addEventListener("load", function () {
            navigator.serviceWorker.register("./sw.js")
                .then(function (reg) {
                    console.log("PWA: Service Worker registrado exitosamente.", reg.scope);
                })
                .catch(function (err) {
                    console.error("PWA: Error al registrar Service Worker:", err);
                });
        });
    }

    // ==========================================================================
    // 11. BOTONES DE SIMULACIÓN Y AUDITORÍA (CON IDS EXACTOS REQUERIDOS)
    // ==========================================================================

    // #btnSimularContraste: alterna body.alto-contraste
    $("#btnSimularContraste").on("click", function () {
        $("body").toggleClass("alto-contraste");
    });

    // #btnSimularVista: alterna .sim-movil en la grilla del catálogo
    $("#btnSimularVista").on("click", function () {
        $("#grilla-catalogo").toggleClass("sim-movil");
    });

    // #btnAuditarA11Y + #reporteA11Y: cuenta header, nav, main, article, footer e imágenes sin alt
    $("#btnAuditarA11Y").on("click", function () {
        const cantHeader = $("header").length;
        const cantNav = $("nav").length;
        const cantMain = $("main").length;
        const cantArticle = $("article").length;
        const cantFooter = $("footer").length;
        const cantSinAlt = $('img:not([alt]), img[alt=""]').length;

        const mensaje = "A11Y Reporte: " +
            cantHeader + " header, " +
            cantNav + " nav, " +
            cantMain + " main, " +
            cantArticle + " article, " +
            cantFooter + " footer. " +
            "Imágenes sin alt: " + cantSinAlt + ".";

        $("#reporteA11Y").text(mensaje).stop(true, true).fadeIn(200).delay(5000).fadeOut(300);
    });

    // #btnSmokeTest + #salidaAudit: cuenta botones, imágenes sin alt y enlaces vacíos
    $("#btnSmokeTest").on("click", function () {
        const cantBotones = $("button").length;
        const cantSinAlt = $('img:not([alt]), img[alt=""]').length;
        const cantEnlacesVacios = $('a[href=""], a[href="#"]').length;

        const mensaje = "Smoke Test: " +
            cantBotones + " botones operativos, " +
            cantSinAlt + " imágenes sin alt, " +
            cantEnlacesVacios + " enlaces vacíos. Consola limpia.";

        $("#salidaAudit").text(mensaje).stop(true, true).fadeIn(200).delay(5000).fadeOut(300);
    });

    // ==========================================================================
    // 12. LOGIN SIMULADO CLIENTE ANTI-XSS (REQUERIMIENTO J)
    // ==========================================================================
    const $modalLogin = $("#modalLogin");
    const $loginSalida = $("#loginSalida");

    $("#btnAccesoLogin").on("click", function () {
        $loginSalida.text("");
        $("#loginUsuario").val("");
        $("#loginClave").val("");
        $modalLogin.stop(true, true).fadeIn(200);
    });

    $("#btnCerrarLogin").on("click", function () {
        $modalLogin.stop(true, true).fadeOut(200);
    });

    $("#btnEjecutarLogin").on("click", function () {
        const user = $("#loginUsuario").val().trim();
        const pass = $("#loginClave").val().trim();

        if (user.length < 3) {
            $loginSalida.text("Ingresa un usuario o carnet válido (mínimo 3 caracteres).");
            return;
        }
        if (pass.length < 4) {
            $loginSalida.text("La clave debe tener al menos 4 caracteres.");
            return;
        }

        // Simulación client-side: mensaje seguro con .text() sin almacenar claves
        $loginSalida.css("color", "var(--success)").text("Acceso simulado exitoso para: " + user);
        setTimeout(function () {
            $modalLogin.fadeOut(250);
        }, 1500);
    });
});
