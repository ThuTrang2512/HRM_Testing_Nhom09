// Use Montserrat for charts text as well
Chart.defaults.font.family = "'Montserrat', sans-serif";
Chart.defaults.color = '#9ca3af';

// ---------------------------------------------------------------------
// 1. CHART HOURS (Area Chart)
// ---------------------------------------------------------------------
const ctxHours = document.getElementById('chartHours');
if (ctxHours) {
    new Chart(ctxHours.getContext('2d'), {
        type: 'line',
        data: {
            labels: chartHoursLabels,
            datasets: [{
                data: chartHoursValues,
                borderColor: '#4180fe',
                backgroundColor: '#4180fe',
                borderWidth: 0,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4180fe',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { left: -8, bottom: -10 } },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: function (ctx) {
                            return ctx.index === 11 ? '#000000' : '#8892a0';
                        },
                        font: function (ctx) {
                            return { size: 16, weight: ctx.index === 11 ? 'bold' : 'normal', family: "'Montserrat', sans-serif" };
                        },
                        maxRotation: 0,
                        minRotation: 0,
                        padding: 10,
                        callback: function (val, index) { return this.getLabelForValue(val); }
                    },
                    border: { display: false }
                },
                y: {
                    min: 0,
                    max: 1000,
                    ticks: {
                        stepSize: 200,
                        callback: function (value) {
                            if (value === 1000) return '1,0\n 00h';
                            if (value === 800) return '800\n h';
                            if (value === 600) return '60\n 0h';
                            if (value === 400) return '400\n h';
                            if (value === 200) return '200\n h';
                            return '';
                        },
                        color: '#8892a0',
                        font: { size: 16, family: "'Montserrat', sans-serif" },
                        padding: 30
                    },
                    grid: {
                        color: '#f3f4f6',
                        drawBorder: false,
                        tickLength: 0
                    },
                    border: { display: false }
                }
            }
        },
        plugins: [{
            id: 'verticalLineAndTooltip',
            afterDraw: function (chart) {
                const active = chart.tooltip?._active;
                if (active && active.length) {
                    const activePoint = active[0];
                    const x = activePoint.element.x;
                    const y = activePoint.element.y;
                    const yAxis = chart.scales.y;
                    const ctx = chart.ctx;
                    ctx.save();

                    // Vertical dashed line
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, yAxis.bottom);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#fff';
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Blue dot with white border
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, 2 * Math.PI);
                    ctx.fillStyle = '#4180fe';
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#fff';
                    ctx.stroke();

                    // Get actual value from dataset
                    const dataIndex = activePoint.index;
                    const dataValue = chart.data.datasets[0].data[dataIndex];
                    const label = chart.data.labels[dataIndex];

                    // Tooltip box
                    ctx.shadowColor = 'rgba(0,0,0,0.08)';
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetY = 4;

                    let tX = x - 65;
                    let tY = y - 115;
                    // Clamp to chart bounds
                    if (tX < chart.chartArea.left) tX = chart.chartArea.left;
                    if (tX + 130 > chart.chartArea.right) tX = chart.chartArea.right - 130;

                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.roundRect(tX, tY, 130, 90, 12);
                    ctx.fill();

                    // Triangle
                    ctx.beginPath();
                    ctx.moveTo(x - 10, tY + 90);
                    ctx.lineTo(x + 10, tY + 90);
                    ctx.lineTo(x, tY + 105);
                    ctx.fill();

                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'bold 18px Montserrat';
                    ctx.fillText(dataValue.toLocaleString(), tX + 15, tY + 35);

                    ctx.fillStyle = '#64748b';
                    ctx.font = '500 13px Montserrat';
                    // Format label as month name if possible
                    const labelStr = Array.isArray(label) ? label.join(' ') : (label || '');
                    ctx.fillText(labelStr, tX + 15, tY + 58);

                    ctx.restore();
                }
            }
        }]
    });
}

// ---------------------------------------------------------------------
// 2. CHART ROLES (Donut)
// ---------------------------------------------------------------------
const ctxRoles = document.getElementById('chartRoles');
if (ctxRoles) {
    new Chart(ctxRoles.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: rolesLabels,
            datasets: [{
                data: rolesCounts,
                backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'],
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '55%',
            layout: {
                padding: { bottom: 60, top: 40 }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 30,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#4b5563',
                        font: { size: 16, weight: '600', family: "'Montserrat', sans-serif" },
                        generateLabels: function (chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map(function (label, i) {
                                    return {
                                        text: label,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].backgroundColor[i],
                                        pointStyle: 'circle',
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: { enabled: true }
            }
        },
        plugins: [{
            id: 'customLabels',
            afterDraw(chart) {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach((element, index) => {
                        const model = element;
                        const midAngle = model.startAngle + (model.endAngle - model.startAngle) / 2;
                        const r = model.outerRadius + 20;
                        const x = model.x + Math.cos(midAngle) * r;
                        const y = model.y + Math.sin(midAngle) * r;

                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(model.x + Math.cos(midAngle) * (model.outerRadius - 5), model.y + Math.sin(midAngle) * (model.outerRadius - 5));
                        ctx.lineTo(model.x + Math.cos(midAngle) * (r - 10), model.y + Math.sin(midAngle) * (r - 10));
                        ctx.strokeStyle = '#d76f6f';
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        ctx.fillStyle = '#d76f6f';
                        ctx.font = '16px Montserrat';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        const labelText = dataset.data[index].toString();
                        ctx.fillText(labelText, x, y);
                        ctx.restore();
                    });
                });
            }
        }]
    });
}

// ---------------------------------------------------------------------
// 3. CHART SALARY (Horizontal Bar)
// ---------------------------------------------------------------------
const ctxHBar = document.getElementById('chartSalaryHBar');
if (ctxHBar) {
    const salaryDatasets = salaryByYear.map((item, i) => ({
        label: `${item.year}`,
        data: [parseFloat(item.total).toFixed(2)],
        backgroundColor: i === 0 ? '#a380fa' : (i === 1 ? '#f5a198' : '#6bcfce'),
        barThickness: 75
    }));

    new Chart(ctxHBar.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [''],
            datasets: salaryDatasets
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { left: 10, right: 40 } },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    position: 'top',
                    ticks: {
                        stepSize: 20,
                        color: '#6b7280',
                        font: { size: 14, family: "'Montserrat', sans-serif" }
                    },
                    grid: {
                        color: '#e5e7eb',
                        borderDash: [5, 5],
                        drawBorder: false
                    },
                    border: { display: false }
                },
                y: {
                    grid: { display: false, drawBorder: false },
                    border: { display: false },
                    ticks: { display: false }
                }
            },
            animation: {
                onComplete: function () {
                    const chartInstance = this;
                    const ctx = chartInstance.ctx;
                    ctx.font = '14px Montserrat';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#6b7280';
                    this.data.datasets.forEach(function (dataset, i) {
                        const meta = chartInstance.getDatasetMeta(i);
                        meta.data.forEach(function (bar, index) {
                            ctx.fillText(dataset.data[index], bar.x + 10, bar.y);
                        });
                    });
                }
            }
        }
    });
}

// ---------------------------------------------------------------------
// 4. CHART ROLES BAR (Grouped Vertical Bar)
// ---------------------------------------------------------------------
const ctxRolesBar = document.getElementById('chartRolesBar');
if (ctxRolesBar) {
    new Chart(ctxRolesBar.getContext('2d'), {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: rolesDatasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: ds.backgroundColor,
                barPercentage: 0.9,
                categoryPercentage: 0.8
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { right: 20 } },
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    min: 0,
                    max: 80,
                    ticks: {
                        stepSize: 20,
                        color: '#4b5563',
                        font: { size: 14, weight: '500', family: "'Montserrat', sans-serif" }
                    },
                    grid: { display: false },
                    border: { color: '#6b7280', width: 1 }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#4b5563',
                        font: { size: 16, weight: '500', family: "'Montserrat', sans-serif" },
                        padding: 10
                    },
                    border: { color: '#4b5563', width: 1 }
                }
            }
        }
    });
}
