document.getElementById('startBtn').addEventListener('click', () => {
    const T = parseFloat(document.getElementById('totalTime').value);
    const Lambda = parseFloat(document.getElementById('lambda').value);
    const n = parseInt(document.getElementById('numIntervals').value);

    // Validazione degli input
    if (T <= 0 || Lambda < 0 || n <= 0) {
        alert('Per favore inserisci valori validi.');
        return;
    }

    simulateProcess(T, Lambda, n);
});

function simulateProcess(T, Lambda, n) {
    const dt = T / n;
    const p = Lambda * dt;

    // Controllo che la probabilità p non superi 1
    if (p > 1) {
        alert('Probabilità di salto p > 1. Riduci Lambda o aumenta n.');
        return;
    }

    let t = 0;
    let x = 0;
    const timeList = [t];
    const positionList = [x];

    for (let i = 0; i < n; i++) {
        const r = Math.random();
        if (r < p) {
            x += 1;
        }
        t += dt;
        timeList.push(t);
        positionList.push(x);
    }

    // Chiamata alla funzione per disegnare il grafico
    drawChart(timeList, positionList);
}

function drawChart(timeList, positionList) {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');

    // Pulizia del canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configurazione delle scale
    const maxX = Math.max(...timeList);
    const maxY = Math.max(...positionList);

    // Disegno degli assi
    // ...

    // Disegno della traiettoria
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i < timeList.length; i++) {
        const x = (timeList[i] / maxX) * canvas.width;
        const y = canvas.height - (positionList[i] / maxY) * canvas.height;
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}
