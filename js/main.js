import { renderDefaultChart, renderMultiChart, renderSeparateCharts } from './chartRenderer.js';




document.addEventListener('DOMContentLoaded', () => {
    const fileForm = document.getElementById('file-form');
    const datMessage = document.getElementById('datMessage');

    fileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const datFileInput = document.getElementById('datFile');

        if (datFileInput.files.length > 0) {
            const datFile = datFileInput.files[0];

            if (datFile.name.endsWith('.dat')) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const fileContent = event.target.result;                                     

                    if (!validateDatFile(fileContent)) {
                        datMessage.textContent = "El archivo .dat no tiene el formato correcto.";
                        return;
                    }

                    const graphData = parseDatFile(fileContent);   
                    datMessage.textContent = `DAT File loaded: ${datFile.name}`;
                    
                    // Determinar el tipo de gráfico basado en el archivo
                    if (graphData.datasets.length === 1 && !graphData.separate) {
                        // Renderizar gráfico default
                        renderDefaultChart(graphData.datasets[0], 'chart-area');                        
                    } else {
                        // Limpiar contenedores antes de renderizar nuevos gráficos
                        clearChartContainers();
                    
                        // Crear contenedores para gráficos separados y combinados
                        const chartContainer = document.getElementById('chart-area');
                        if (!document.getElementById('chart-area-multi')) {
                            const multiContainer = document.createElement('div');
                            multiContainer.id = 'chart-area-multi';
                            chartContainer.appendChild(multiContainer);
                        }
                        if (!document.getElementById('chart-area-separate')) {
                            const separateContainer = document.createElement('div');
                            separateContainer.id = 'chart-area-separate';
                            chartContainer.appendChild(separateContainer);
                        }
                    
                        // Dividir datasets en combinados y separados
                        const combinedDatasets = graphData.datasets.filter((dataset) => !dataset.separate);
                        const separateDatasets = graphData.datasets.filter((dataset) => dataset.separate);
                    
                        // Renderizar gráficos combinados (multi) si existen
                        if (combinedDatasets.length > 0) {
                            renderMultiChart({ datasets: combinedDatasets }, 'chart-area-multi');
                        }
                    
                        // Renderizar gráficos separados si existen
                        if (separateDatasets.length > 0) {
                            renderSeparateCharts({ datasets: separateDatasets }, 'chart-area-separate');
                        }
                    }                         
                 
                };
                reader.readAsText(datFile);
            } else {
                datMessage.textContent = "Por favor, carga un archivo válido .dat.";
            }
        } else {
            datMessage.textContent = "No se seleccionó ningún archivo .dat.";
        }
    });

    function validateDatFile(content) {
        const requiredKeywords = ['label', 'range', 'left ticks', 'bottom ticks'];
        return requiredKeywords.every((keyword) => content.includes(keyword));
    }
    

    /**
     * Limpia los contenedores de gráficos antes de cargar nuevos datos.
     */
    function clearChartContainers() {
        const chartContainer = document.getElementById('chart-area');
        chartContainer.innerHTML = '<h2>La grafica se mostrara aquí.</h2>'; // Eliminar todo el contenido dentro del contenedor principal
    }

    document.getElementById('clear-charts').addEventListener('click', () => {
        clearChartContainers();
        document.getElementById('datMessage').textContent = '';
        document.getElementById('awkMessage').textContent = '';
    });

    /**
     * Función para interpretar el contenido del archivo .dat.
     * @param {string} content - Contenido del archivo .dat.
     * @returns {Object} - Datos procesados para los gráficos.
     */
    function parseDatFile(content) {
        const lines = content.split('\n');
        const datasets = [];
        let currentDataset = null;
        let lastRange = null;
        let lastLeftTicks = [];
        let lastBottomTicks = [];
        let firstRangeFound = false; // Bandera para saber si es el primer range
    
        lines.forEach((line) => {
            line = line.trim();
    
            if (line.startsWith('label')) {
                // Guardar el dataset actual si existe
                if (currentDataset) {
                    datasets.push(currentDataset);
                }
                const label = line.replace('label', '').trim();
                currentDataset = {
                    label,
                    range: lastRange, // Heredar rango si no hay uno explícito
                    leftTicks: lastLeftTicks,
                    bottomTicks: lastBottomTicks,
                    points: [],
                    separate: false, // Por defecto, no es separado
                };
            } else if (line.startsWith('range')) {
                lastRange = line.replace('range', '').trim().split(/\s+/).map(Number);
                currentDataset.range = lastRange;
    
                if (firstRangeFound) {
                    currentDataset.separate = true; // Marcar como separado si no es el primer range
                } else {
                    firstRangeFound = true; // Marcar que ya se encontró el primer range
                }
            } else if (line.startsWith('left ticks')) {
                lastLeftTicks = line.replace('left ticks', '').trim().split(/\s+/).map(Number);
                currentDataset.leftTicks = lastLeftTicks;
            } else if (line.startsWith('bottom ticks')) {
                lastBottomTicks = line.replace('bottom ticks', '').trim().split(/\s+/).map(Number);
                currentDataset.bottomTicks = lastBottomTicks;
            } else if (line && !isNaN(line[0])) {
                const [x, y] = line.split(/\s+/).map(Number);
                if (currentDataset) {
                    currentDataset.points.push({ x, y });
                }
            }
        });
    
        // Añadir el último conjunto de datos si existe
        if (currentDataset) {
            datasets.push(currentDataset);
        }
    
        // Revisar si algún dataset tiene configuraciones explícitas
        const separate = datasets.some((dataset) => dataset.separate);
    
        return {
            datasets,
            separate,
            range: lastRange || [], // Rango global heredado para gráficos múltiples
        };
    }
    
});

