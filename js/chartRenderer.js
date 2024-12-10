/**
 * Renderiza una gráfica de línea básica.
 * @param {Object} data - Datos de la gráfica (título, puntos, rango).
 * @param {string} containerId - ID del contenedor donde se renderizará la gráfica.
 */
export function renderDefaultChart(data, containerId) {
    // Asegurar que el contenedor tenga un canvas
    const chartArea = document.getElementById(containerId);
    chartArea.innerHTML = ''; // Limpiar el contenedor

    const canvas = document.createElement('canvas');
    canvas.id = `${containerId}-default`; // ID único para el canvas
    chartArea.appendChild(canvas);

    renderChart({
        datasets: [
            {
                label: data.label,
                data: data.points.map((point) => ({ x: point.x, y: point.y })),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.3,
            },
        ],
        title: data.label,
        range: data.range,
    }, canvas.id, 'line'); // Pasar el ID del canvas creado
}


/**
 * Renderiza múltiples conjuntos de datos en una sola gráfica.
 * @param {Object} data - Datos de las gráficas (conjuntos, etiquetas, puntos).
 * @param {string} containerId - ID del contenedor donde se renderizará la gráfica.
 */
export function renderMultiChart(data, containerId) {
    const chartArea = document.getElementById(containerId);

    // Asegúrate de que el contenedor está limpio
    chartArea.innerHTML = ''; 

    // Crear un nuevo canvas para el gráfico
    const canvas = document.createElement('canvas');
    canvas.id = `${containerId}-canvas`; // Asignar un ID único
    chartArea.appendChild(canvas);

    // Renderizar el gráfico con los datos proporcionados
    renderChart({
        datasets: data.datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.points.map((point) => ({ x: point.x, y: point.y })),
            borderColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 192, 1)`,
            backgroundColor: `rgba(${50 + index * 50}, ${150 - index * 30}, 192, 0.2)`,
            borderWidth: 2,
        })),
        title: 'Multiple Tables Chart',
        range: data.range,
    }, canvas.id, 'scatter'); // Usar el ID del canvas creado
}

/**
 * Renderiza múltiples gráficos en gráficos separados.
 * @param {Object} data - Datos de las gráficas (conjuntos, etiquetas, puntos).
 * @param {string} containerId - ID del contenedor donde se renderizarán las gráficas.
 */ 

export function renderSeparateCharts(data, containerId) {
    const chartArea = document.getElementById(containerId);
    chartArea.innerHTML = ''; // Limpiar el contenedor

    data.datasets.forEach((dataset, index) => {
        const canvasContainer = document.createElement('div');
        canvasContainer.style.marginBottom = '20px';

        const canvas = document.createElement('canvas');
        canvas.id = `chart-${index}`;
        canvasContainer.appendChild(canvas);

        chartArea.appendChild(canvasContainer);

        renderChart({
            datasets: [
                {
                    label: dataset.label,
                    data: dataset.points.map((point) => ({ x: point.x, y: point.y })),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                },
            ],
            title: dataset.label,
            range: dataset.range || null, // Usar el rango si está definido
        }, `chart-${index}`, 'line');
    });
}



/**
 * Función auxiliar para crear gráficos con configuración genérica.
 * @param {Object} configData - Configuración de la gráfica (datasets, título, rango).
 * @param {string} containerId - ID del contenedor donde se renderizará la gráfica.
 * @param {string} type - Tipo de gráfica (line, scatter, etc.).
 */
function renderChart(configData, canvasId, type) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    new Chart(ctx, {
        type: type,
        data: {
            datasets: configData.datasets,
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: configData.title,
                },
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'X Axis',
                    },
                    suggestedMin: configData.range ? configData.range[0] : undefined,
                    suggestedMax: configData.range ? configData.range[2] : undefined,
                },
                y: {
                    title: {
                        display: true,
                        text: 'Y Axis',
                    },
                    suggestedMin: configData.range ? configData.range[1] : undefined,
                    suggestedMax: configData.range ? configData.range[3] : undefined,
                },
            },
        },
    });
    addDownloadButton(canvasId);
}


function addDownloadButton(canvasId) {
    const canvas = document.getElementById(canvasId);
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = "Descargar gráfica";
    downloadBtn.style.marginTop = "10px";
    downloadBtn.style.display = "block";
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `${canvasId}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
    canvas.parentNode.appendChild(downloadBtn);
}

