document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURACIÓN DE FECHA Y CALENDARIO ---
    const fechaBoda = new Date("March 15, 2026 16:30:00").getTime();
    
    const config = {
        titulo: "Boda Vanessa & Jonas",
        inicio: "20260315T163000",
        fin: "20260316T020000",
        lugar: "Playa Hermosa, Guanacaste, Costa Rica"
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(config.titulo)}&dates=${config.inicio}/${config.fin}&location=${encodeURIComponent(config.lugar)}`;
    const btnCal = document.getElementById('btnCalendar');
    if(btnCal) btnCal.href = calendarUrl;

    // --- 2. SISTEMA VIP (Lectura de URL) ---
    const urlParams = new URLSearchParams(window.location.search);
    const nombreFamilia = urlParams.get('n');

    const inputNombre = document.getElementById('inputNombre');
    const mensajeBienvenida = document.getElementById('mensajeBienvenida');

    if (nombreFamilia) {
        // Reemplaza guiones por espacios (Familia-Perez -> Familia Perez)
        inputNombre.value = nombreFamilia.replace(/-/g, ' ');
        mensajeBienvenida.innerText = `¡Hola ${inputNombre.value}! Qué alegría que estés aquí.`;
    } else {
        inputNombre.value = "Familia / Invitado";
        inputNombre.readOnly = false; // Permitir escribir si no hay link
        inputNombre.classList.remove('bg-gray-100', 'cursor-not-allowed');
    }

    // --- 3. CUENTA REGRESIVA ---
    const actualizarCountdown = () => {
        const ahora = new Date().getTime();
        const diff = fechaBoda - ahora;
        if (diff <= 0) return;
        document.getElementById("days").innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById("hours").innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById("minutes").innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById("seconds").innerText = Math.floor((diff % (1000 * 60)) / 1000);
    };
    setInterval(actualizarCountdown, 1000);
    actualizarCountdown();

    // --- 4. LÓGICA DE BOTONES ---
    const btnAsistir = document.getElementById('btnAsistir');
    const btnNoAsistir = document.getElementById('btnNoAsistir');
    const valorAsistencia = document.getElementById('valorAsistencia');
    const seccionInvitados = document.getElementById('seccionInvitados');

    btnAsistir.addEventListener('click', () => {
        valorAsistencia.value = "SI";
        btnAsistir.classList.add('btn-asistir-activo');
        btnNoAsistir.classList.remove('btn-no-asistir-activo');
        seccionInvitados.classList.remove('hidden');
    });

    btnNoAsistir.addEventListener('click', () => {
        valorAsistencia.value = "NO";
        btnNoAsistir.classList.add('btn-no-asistir-activo');
        btnAsistir.classList.remove('btn-asistir-activo');
        seccionInvitados.classList.add('hidden');
        document.getElementById('inputCantidad').value = 0;
        document.getElementById('inputDieta').value = "N/A";
    });

    // --- 5. ENVÍO A SHEETDB ---
    const form = document.getElementById('rsvpForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!valorAsistencia.value) {
            alert("Por favor, selecciona si asistirás.");
            return;
        }

        const btnSubmit = document.getElementById('btnEnviar');
        btnSubmit.innerText = "ENVIANDO...";
        btnSubmit.disabled = true;

        const data = Object.fromEntries(new FormData(form).entries());

        try {
            // REEMPLAZA TU_ID_AQUÍ
            const response = await fetch('https://sheetdb.io/api/v1/TU_ID_AQUÍ', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [data] })
            });

            if (response.ok) {
                form.classList.add('hidden');
                document.getElementById('mensajeExito').classList.remove('hidden');
                mensajeBienvenida.classList.add('hidden');
            } else {
                throw new Error();
            }
        } catch (error) {
            alert("Error al enviar. Inténtalo de nuevo.");
            btnSubmit.innerText = "Enviar Confirmación";
            btnSubmit.disabled = false;
        }
    });
});