document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURACIÓN DE FECHA ---
    const fechaBoda = new Date("October 14, 2026 16:30:00").getTime();

    // --- 2. SISTEMA VIP (Lectura de URL) ---
    const urlParams = new URLSearchParams(window.location.search);
    const nombreFamilia = urlParams.get('n'); 
    const pasesMax = urlParams.get('p');      

    const inputNombre = document.getElementById('inputNombre');
    const inputCantidad = document.getElementById('inputCantidad');
    const labelMax = document.getElementById('labelMax');
    const mensajeBienvenida = document.getElementById('mensajeBienvenida');

    if (nombreFamilia) {
        const nombreLimpio = nombreFamilia.replace(/-/g, ' ');
        if(inputNombre) inputNombre.value = nombreLimpio;
        if(mensajeBienvenida) mensajeBienvenida.innerText = `¡Hola ${nombreLimpio}! Qué alegría que estés aquí.`;
    }

    if (pasesMax) {
        if(inputCantidad) {
            inputCantidad.max = pasesMax;
            inputCantidad.value = pasesMax; 
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
            btnAsistir.classList.add('btn-asistir-activo');
            btnNoAsistir.classList.remove('btn-no-asistir-activo');
            seccionInvitados.classList.remove('hidden');
        });

        btnNoAsistir.addEventListener('click', () => {
            valorAsistencia.value = "NO";
            btnNoAsistir.classList.add('btn-no-asistir-activo');
            btnAsistir.classList.remove('btn-asistir-activo');
            seccionInvitados.classList.add('hidden');
        });
    }

    // --- 5. ENVÍO A SHEETDB ---
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
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: [data] })
                });

                if (response.ok) {
                    form.classList.add('hidden');
                    document.getElementById('mensajeExito').classList.remove('hidden');
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