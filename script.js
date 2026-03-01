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
    const nombreFamilia = urlParams.get('n'); // Lee ?n=
    const pasesMax = urlParams.get('p');      // Lee ?p=

    const inputNombre = document.getElementById('inputNombre');
    const inputCantidad = document.getElementById('inputCantidad');
    const labelMax = document.getElementById('labelMax');
    const mensajeBienvenida = document.getElementById('mensajeBienvenida');

    if (nombreFamilia) {
        // Reemplaza guiones por espacios (Familia-Krebs -> Familia Krebs)
        const nombreLimpio = nombreFamilia.replace(/-/g, ' ');
        if(inputNombre) inputNombre.value = nombreLimpio;
        if(mensajeBienvenida) mensajeBienvenida.innerText = `¡Hola ${nombreLimpio}! Qué alegría que estés aquí.`;
    }

    if (pasesMax) {
        // Establecer el máximo permitido en el input
        if(inputCantidad) {
            inputCantidad.max = pasesMax;
            inputCantidad.value = pasesMax; // Por defecto marcar que van todos
        }
        if(labelMax) labelMax.innerText = `de ${pasesMax} pases reservados`;
    }

    // --- 3. CUENTA REGRESIVA ---
    const actualizarCountdown = () => {
        const ahora = new Date().getTime();
        const diff = fechaBoda - ahora;
        if (diff <= 0) return;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if(document.getElementById("days")) document.getElementById("days").innerText = days;
        if(document.getElementById("hours")) document.getElementById("hours").innerText = hours;
        if(document.getElementById("minutes")) document.getElementById("minutes").innerText = minutes;
        if(document.getElementById("seconds")) document.getElementById("seconds").innerText = seconds;
    };
    setInterval(actualizarCountdown, 1000);
    actualizarCountdown();

    // --- 4. LÓGICA DE BOTONES ---
    const btnAsistir = document.getElementById('btnAsistir');
    const btnNoAsistir = document.getElementById('btnNoAsistir');
    const valorAsistencia = document.getElementById('valorAsistencia');
    const seccionInvitados = document.getElementById('seccionInvitados');

    if(btnAsistir && btnNoAsistir) {
        btnAsistir.addEventListener('click', () => {
            valorAsistencia.value = "SI";
            btnAsistir.classList.add('bg-emerald-600', 'text-white');
            btnAsistir.classList.remove('text-emerald-800');
            btnNoAsistir.classList.remove('bg-red-600', 'text-white');
            btnNoAsistir.classList.add('text-red-800');
            seccionInvitados.classList.remove('hidden');
            if(pasesMax) inputCantidad.value = pasesMax;
        });

        btnNoAsistir.addEventListener('click', () => {
            valorAsistencia.value = "NO";
            btnNoAsistir.classList.add('bg-red-600', 'text-white');
            btnNoAsistir.classList.remove('text-red-800');
            btnAsistir.classList.remove('bg-emerald-600', 'text-white');
            btnAsistir.classList.add('text-emerald-800');
            seccionInvitados.classList.add('hidden');
            inputCantidad.value = 0;
            document.getElementById('inputDieta').value = "N/A";
        });
    }

    // --- 5. VALIDACIÓN DE CANTIDAD ---
    if(inputCantidad) {
        inputCantidad.addEventListener('input', () => {
            if (pasesMax && parseInt(inputCantidad.value) > parseInt(pasesMax)) {
                alert(`Lo sentimos, solo tienes ${pasesMax} pases asignados.`);
                inputCantidad.value = pasesMax;
            }
        });
    }

    // --- 6. ENVÍO A SHEETDB ---
    const form = document.getElementById('rsvpForm');
    if(form) {
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
                const response = await fetch('https://sheetdb.io/api/v1/mtnhnv7jyyebe', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: [data] })
                });

                if (response.ok) {
                    form.classList.add('hidden');
                    document.getElementById('mensajeExito').classList.remove('hidden');
                    if(mensajeBienvenida) mensajeBienvenida.classList.add('hidden');
                } else {
                    throw new Error();
                }
            } catch (error) {
                alert("Error al enviar. Inténtalo de nuevo.");
                btnSubmit.innerText = "Enviar Confirmación";
                btnSubmit.disabled = false;
            }
        });
    }
});

