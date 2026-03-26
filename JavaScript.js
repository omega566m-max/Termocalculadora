// --- DATOS DE TABLAS (Ampliados para mejor precisión) ---
const dataA4 = [
    { T: 0.01, P: 0.6117, vf: 0.001000, vg: 206.00, uf: 0.00, ug: 2374.9, hf: 0.00, hg: 2500.9, sf: 0.0000, sg: 9.1556 },
    { T: 50, P: 12.352, vf: 0.001012, vg: 12.026, uf: 209.33, ug: 2442.7, hf: 209.34, hg: 2591.3, sf: 0.7038, sg: 8.0748 },
    { T: 100, P: 101.42, vf: 0.001043, vg: 1.6720, uf: 418.91, ug: 2506.0, hf: 419.06, hg: 2675.6, sf: 1.3069, sg: 7.3541 },
    { T: 150, P: 476.16, vf: 0.001091, vg: 0.39248, uf: 631.66, ug: 2559.1, hf: 632.18, hg: 2745.9, sf: 1.8418, sg: 6.8371 },
    { T: 200, P: 1554.9, vf: 0.001157, vg: 0.12721, uf: 850.46, ug: 2594.2, hf: 852.26, hg: 2792.0, sf: 2.3305, sg: 6.4302 },
    { T: 250, P: 3976.2, vf: 0.001252, vg: 0.05008, uf: 1080.4, ug: 2601.3, hf: 1085.4, hg: 2800.4, sf: 2.7930, sg: 6.0721 },
    { T: 300, P: 8587.9, vf: 0.001404, vg: 0.02164, uf: 1332.9, ug: 2563.6, hf: 1345.0, hg: 2749.6, sf: 3.2552, sg: 5.7059 },
    { T: 373.95, P: 22064, vf: 0.003106, vg: 0.003106, uf: 2029.6, ug: 2029.6, hf: 2099.3, hg: 2099.3, sf: 4.4298, sg: 4.4298 }
];

let mode = 'A4';
let currentState = { v: 0.068, t: 197 };

// --- NAVEGACIÓN ---
function showSection(id, element) {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar li').forEach(l => l.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    element.classList.add('active');
    if (id === 'grafica') renderGraph();
}

function setMode(m) {
    mode = m;
    document.getElementById('btnA4').classList.toggle('active', m === 'A4');
    document.getElementById('btnA5').classList.toggle('active', m === 'A5');
    document.getElementById('lblInput').innerText = m === 'A4' ? 'Temperatura (°C)' : 'Presión (kPa)';
    document.getElementById('resSatLabel').innerText = m === 'A4' ? 'P. Sat (kPa)' : 'T. Sat (°C)';
}

// --- CÁLCULOS ---
function linterp(x, x1, x2, y1, y2) {
    if (x1 === x2) return y1;
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

function calcularPropiedades() {
    const val = parseFloat(document.getElementById('inputVal').value);
    const x = parseFloat(document.getElementById('inputX').value);
    const key = mode === 'A4' ? 'T' : 'P';

    // Encontrar intervalo
    let idx = dataA4.findIndex((r, i) => r[key] <= val && (dataA4[i + 1]?.[key] > val || !dataA4[i + 1]));

    if (idx === -1) {
        alert("Valor fuera de rango de las tablas.");
        return;
    }

    let r1 = dataA4[idx];
    let r2 = dataA4[idx + 1] || r1;

    const p = {};
    ['T', 'P', 'vf', 'vg', 'uf', 'ug', 'hf', 'hg', 'sf', 'sg'].forEach(f => {
        p[f] = linterp(val, r1[key], r2[key], r1[f], r2[f]);
    });

    const vProm = p.vf + x * (p.vg - p.vf);
    document.getElementById('resSat').innerText = (mode === 'A4' ? p.P : p.T).toFixed(2);
    document.getElementById('resV').innerText = vProm.toFixed(6);
    document.getElementById('resU').innerText = (p.uf + x * (p.ug - p.uf)).toFixed(2);
    document.getElementById('resH').innerText = (p.hf + x * (p.hg - p.hf)).toFixed(2);
    document.getElementById('resS').innerText = (p.sf + x * (p.sg - p.sf)).toFixed(4);

    const row = (name, f, g) => `<tr><td>${name}</td><td>${f.toFixed(4)}</td><td>${(g - f).toFixed(4)}</td><td>${g.toFixed(4)}</td></tr>`;
    document.getElementById('sat-body').innerHTML =
        row('Volumen (v)', p.vf, p.vg) + row('Energía (u)', p.uf, p.ug) +
        row('Entalpía (h)', p.hf, p.hg) + row('Entropía (s)', p.sf, p.sg);

    currentState.v = vProm;
    currentState.t = p.T;

    alert("Cálculo finalizado. El punto ha sido actualizado.");
}

// --- CONVERSOR ---
function convertir() {
    const val = parseFloat(document.getElementById('convFrom').value);
    const type = document.getElementById('unitType').value;
    let res = 0;
    if (isNaN(val)) return;

    switch (type) {
        case 'kpa-pa': res = val * 1000; break;
        case 'pa-kpa': res = val / 1000; break;
        case 'bar-kpa': res = val * 100; break;
        case 'kpa-bar': res = val / 100; break;
        case 'psi-kpa': res = val * 6.8947; break;
        case 'kpa-psi': res = val / 6.8947; break;
        case 'c-f': res = (val * 9 / 5) + 32; break;
        case 'f-c': res = (val - 32) * 5 / 9; break;
        case 'c-k': res = val + 273.15; break;
        case 'k-c': res = val - 273.15; break;
    }
    document.getElementById('convTo').value = res.toFixed(4);
}

function swapUnits() {
    const select = document.getElementById('unitType');
    const current = select.value;
    const parts = current.split('-');
    const reversed = parts[1] + '-' + parts[0];

    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === reversed) {
            select.selectedIndex = i;
            const temp = document.getElementById('convFrom').value;
            document.getElementById('convFrom').value = document.getElementById('convTo').value;
            convertir();
            break;
        }
    }
}

// --- GRÁFICA ---
let myChart = null;
function renderGraph() {
    const ctx = document.getElementById('tvChart').getContext('2d');
    if (myChart) myChart.destroy();

    // Crear puntos del domo (Líquido + Vapor)
    const pointsVf = dataA4.map(r => ({ x: r.vf, y: r.T }));
    const pointsVg = [...dataA4].reverse().map(r => ({ x: r.vg, y: r.T }));
    const domeData = pointsVf.concat(pointsVg);

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Domo de Saturación',
                data: domeData,
                borderColor: '#6c5ce7',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                fill: false
            }, {
                label: 'Estado Actual',
                data: [{ x: currentState.v, y: currentState.t }],
                backgroundColor: 'red',
                pointRadius: 8,
                showLine: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'logarithmic',
                    title: { display: true, text: 'Volumen Específico v (m³/kg)' },
                    min: 0.0008
                },
                y: {
                    title: { display: true, text: 'Temperatura T (°C)' },
                    min: 0
                }
            }
        }
    });
}