document.addEventListener('DOMContentLoaded', () => {

            // DOM Elements
            const form = document.getElementById('calculator-form');
            const resultsSection = document.getElementById('results-section');
            const detailedAnalysisSection = document.getElementById('detailed-analysis');
            const earResultEl = document.getElementById('ear-result');
            const nominalRateResultEl = document.getElementById('nominal-rate-result');
            const totalPrincipalEl = document.getElementById('total-principal');
            const totalFeesEl = document.getElementById('total-fees');
            const totalPaymentEl = document.getElementById('total-payment');
            const amortizationTableBody = document.getElementById('amortization-table');
            const submitButton = document.getElementById('submit-button');
            const buttonText = document.getElementById('button-text');
            const buttonLoader = document.getElementById('button-loader');

            // Chart instances
            let costAnalysisChart = null;

            // Currency Formatter
            const currencyFormatter = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });

            // 计算结果缓存
            const calculationCache = new Map();

            // 添加输入验证和实时反馈
            const inputs = ['principal', 'periods', 'fee'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                input.addEventListener('input', debounce(() => {
                    validateInput(input);
                    if (validateAllInputs()) {
                        performQuickCalculation();
                    }
                }, 300));
                input.addEventListener('blur', () => {
                    validateInput(input);
                });
            });

            // 快捷选择按钮事件
            document.querySelectorAll('.quick-select-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    // 移除其他按钮的激活状态
                    document.querySelectorAll('.quick-select-btn').forEach(b => b.classList.remove('active'));
                    // 激活当前按钮
                    btn.classList.add('active');

                    // 设置对应的值
                    const periods = btn.dataset.periods;
                    const fee = btn.dataset.fee;

                    document.getElementById('periods').value = periods;
                    document.getElementById('fee').value = fee;

                    // 触发计算
                    if (validateAllInputs()) {
                        performQuickCalculation();
                    }
                });
            });

            // 导出按钮事件
            document.getElementById('export-btn').addEventListener('click', exportCalculationResults);

            function debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }

            function validateInput(input) {
                const value = parseFloat(input.value);
                const isValid = !isNaN(value) && value > 0;

                if (isValid) {
                    input.classList.remove('input-invalid');
                    input.classList.add('input-valid');
                } else if (input.value !== '') {
                    input.classList.remove('input-valid');
                    input.classList.add('input-invalid');
                } else {
                    input.classList.remove('input-invalid', 'input-valid');
                }
            }

            function validateAllInputs() {
                const principal = parseFloat(document.getElementById('principal').value);
                const periods = parseInt(document.getElementById('periods').value);
                const fee = parseFloat(document.getElementById('fee').value);

                return !isNaN(principal) && principal > 0 &&
                    !isNaN(periods) && periods > 0 &&
                    !isNaN(fee) && fee >= 0;
            }

            function performQuickCalculation() {
                const principal = parseFloat(document.getElementById('principal').value);
                const periods = parseInt(document.getElementById('periods').value);
                const fee = parseFloat(document.getElementById('fee').value);

                const cacheKey = `${principal}-${periods}-${fee}`;
                let cachedResult = calculationCache.get(cacheKey);

                if (!cachedResult) {
                    cachedResult = calculateResults(principal, periods, fee);
                    setCachedResult(cacheKey, cachedResult);
                }

                // 更新实时预览
                updateQuickPreview(cachedResult.ear);

                // 如果结果区域已显示，则更新显示
                if (!resultsSection.classList.contains('hidden-initial')) {
                    updateResultsDisplay(cachedResult);
                }
            }

            function updateQuickPreview(ear) {
                const quickPreview = document.getElementById('quick-preview');
                const previewEar = document.getElementById('preview-ear');

                if (ear && !isNaN(ear)) {
                    previewEar.textContent = (ear * 100).toFixed(2) + '%';
                    previewEar.className = ear > 0.15 ? 'font-semibold text-red-600' :
                        ear > 0.10 ? 'font-semibold text-yellow-600' :
                            'font-semibold text-green-600';
                    quickPreview.classList.remove('hidden');
                } else {
                    quickPreview.classList.add('hidden');
                }
            }

            function setCachedResult(key, result) {
                if (calculationCache.size > 50) {
                    const firstKey = calculationCache.keys().next().value;
                    calculationCache.delete(firstKey);
                }
                calculationCache.set(key, result);
            }

            function calculateResults(principal, periods, fee) {
                const principalPerPeriod = principal / periods;
                const monthlyPayment = principalPerPeriod + fee;
                const totalFees = fee * periods;
                const totalPayment = principal + totalFees;

                const cashFlows = [principal, ...Array(periods).fill(-monthlyPayment)];
                const monthlyIRR = calculateIRR(cashFlows);
                const ear = isNaN(monthlyIRR) ? 0 : Math.pow(1 + monthlyIRR, 12) - 1;
                const nominalRate = totalFees / principal;

                return {
                    ear,
                    nominalRate,
                    totalFees,
                    totalPayment,
                    principal,
                    periods,
                    fee
                };
            }

            function updateResultsDisplay(results) {
                // 更新显示结果
                earResultEl.textContent = (results.ear * 100).toFixed(2) + '%';
                nominalRateResultEl.textContent = (results.nominalRate * 100).toFixed(2) + '%';
                totalPrincipalEl.textContent = currencyFormatter.format(results.principal);
                totalFeesEl.textContent = currencyFormatter.format(results.totalFees);
                totalPaymentEl.textContent = currencyFormatter.format(results.totalPayment);

                // 更新风险等级样式
                updateRiskLevel(results.ear);

                // 生成建议
                generateAndDisplayRecommendations(results.ear, results.nominalRate);

                // 显示结果区域
                resultsSection.classList.add('show');
            }

            function updateRiskLevel(ear) {
                const earCard = document.querySelector('#ear-result').closest('.stats-card');
                earCard.classList.remove('risk-low', 'risk-medium', 'risk-high');

                if (ear < 0.10) {
                    earCard.classList.add('risk-low');
                } else if (ear < 0.15) {
                    earCard.classList.add('risk-medium');
                } else {
                    earCard.classList.add('risk-high');
                }
            }

            function generateAndDisplayRecommendations(ear, nominalRate) {
                const recommendations = generateRecommendations(ear, nominalRate);
                const recommendationsSection = document.getElementById('recommendations-section');

                if (recommendations.length > 0) {
                    recommendationsSection.innerHTML = recommendations.map(rec => `
                            <div class="recommendation-card ${rec.type} p-3 rounded-lg text-xs">
                                <div class="flex items-start gap-2">
                                    <span class="text-xl">${rec.icon}</span>
                                    <div>
                                        <h4 class="font-semibold text-gray-800 mb-0.5">${rec.title}</h4>
                                        <p class="text-gray-600">${rec.message}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                    recommendationsSection.classList.remove('hidden');
                } else {
                    recommendationsSection.classList.add('hidden');
                }
            }

            function generateRecommendations(ear, nominalRate) {
                const recommendations = [];

                if (ear > 0.20) {
                    recommendations.push({
                        type: 'danger',
                        title: '极高成本警告',
                        message: '真实年化利率超过20%，强烈建议寻找其他融资方式，如银行个人贷款或信用贷款。',
                        icon: '🚨'
                    });
                } else if (ear > 0.15) {
                    recommendations.push({
                        type: 'warning',
                        title: '高成本警告',
                        message: '真实年化利率超过15%，建议考虑其他融资方式或缩短分期期数。',
                        icon: '⚠️'
                    });
                } else if (ear > 0.10) {
                    recommendations.push({
                        type: 'info',
                        title: '中等成本提醒',
                        message: '利率处于中等水平，可考虑提前还款以降低总成本。',
                        icon: '💡'
                    });
                }

                if (ear > nominalRate * 1.8) {
                    recommendations.push({
                        type: 'warning',
                        title: '利率差异显著',
                        message: `真实利率(${(ear * 100).toFixed(2)}%)远高于名义利率(${(nominalRate * 100).toFixed(2)}%)，请注意隐藏的资金成本。`,
                        icon: '📊'
                    });
                }

                if (ear < 0.08) {
                    recommendations.push({
                        type: 'info',
                        title: '成本合理',
                        message: '当前分期方案的资金成本相对合理，可以考虑使用。',
                        icon: '✅'
                    });
                }

                return recommendations;
            }

            function exportCalculationResults() {
                const principal = document.getElementById('principal').value;
                const periods = document.getElementById('periods').value;
                const fee = document.getElementById('fee').value;
                const ear = document.getElementById('ear-result').textContent;
                const nominalRate = document.getElementById('nominal-rate-result').textContent;
                const totalFees = document.getElementById('total-fees').textContent;
                const totalPayment = document.getElementById('total-payment').textContent;

                const data = {
                    计算时间: new Date().toLocaleString('zh-CN'),
                    输入参数: {
                        分期总金额: `¥${principal}`,
                        分期期数: `${periods}期`,
                        每期手续费: `¥${fee}`
                    },
                    计算结果: {
                        真实年化利率: ear,
                        名义年利率: nominalRate,
                        总支付费用: totalFees,
                        还款总额: totalPayment
                    },
                    风险评估: getRiskAssessment(parseFloat(ear.replace('%', '')) / 100)
                };

                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `信用卡分期计算结果_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            function getRiskAssessment(ear) {
                if (ear > 0.20) return '极高风险';
                if (ear > 0.15) return '高风险';
                if (ear > 0.10) return '中等风险';
                if (ear > 0.08) return '低风险';
                return '风险较低';
            }

            // 数据持久化功能
            function saveInputHistory() {
                const inputData = {
                    principal: document.getElementById('principal').value,
                    periods: document.getElementById('periods').value,
                    fee: document.getElementById('fee').value,
                    timestamp: new Date().toISOString()
                };

                try {
                    let history = JSON.parse(localStorage.getItem('earCalculatorHistory') || '[]');
                    history.unshift(inputData);
                    // 只保留最近10条记录
                    history = history.slice(0, 10);
                    localStorage.setItem('earCalculatorHistory', JSON.stringify(history));
                } catch (e) {
                    console.warn('无法保存输入历史:', e);
                }
            }

            function loadInputHistory() {
                try {
                    const history = JSON.parse(localStorage.getItem('earCalculatorHistory') || '[]');
                    if (history.length > 0) {
                        const latest = history[0];
                        // 如果输入框为默认值，则加载最近的历史
                        if (document.getElementById('principal').value === '12000' &&
                            document.getElementById('periods').value === '12' &&
                            document.getElementById('fee').value === '72') {
                            document.getElementById('principal').value = latest.principal;
                            document.getElementById('periods').value = latest.periods;
                            document.getElementById('fee').value = latest.fee;
                        }
                    }
                } catch (e) {
                    console.warn('无法加载输入历史:', e);
                }
            }

            // 页面加载时恢复历史数据
            loadInputHistory();

            // NPV Calculation
            function calculateNPV(rate, cashFlows) {
                return cashFlows.reduce((acc, val, i) => acc + val / Math.pow(1 + rate, i), 0);
            }

            // IRR Calculation using Bisection Method
            function calculateIRR(cashFlows, maxIterations = 1000, tolerance = 1e-7) {
                let lowerBound = -0.99, upperBound = 1.0;

                if (calculateNPV(lowerBound, cashFlows) * calculateNPV(upperBound, cashFlows) > 0) {
                    return NaN;
                }

                for (let i = 0; i < maxIterations; i++) {
                    let guess = (lowerBound + upperBound) / 2;
                    let npv = calculateNPV(guess, cashFlows);

                    if (Math.abs(npv) < tolerance) return guess;

                    if (calculateNPV(lowerBound, cashFlows) * npv < 0) {
                        upperBound = guess;
                    } else {
                        lowerBound = guess;
                    }
                }
                return NaN;
            }

            // Form Submission Handler
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                // 保存输入历史
                saveInputHistory();

                // 按钮动画效果
                buttonText.classList.add('hidden');
                buttonLoader.classList.remove('hidden');
                submitButton.disabled = true;
                submitButton.classList.add('scale-95');

                setTimeout(() => {
                    performCalculation();
                    buttonText.classList.remove('hidden');
                    buttonLoader.classList.add('hidden');
                    submitButton.disabled = false;
                    submitButton.classList.remove('scale-95');
                }, 1200);
            });

            function performCalculation() {
                const principal = parseFloat(document.getElementById('principal').value);
                const periods = parseInt(document.getElementById('periods').value);
                const feePerPeriod = parseFloat(document.getElementById('fee').value);

                if (isNaN(principal) || principal <= 0 || isNaN(periods) || periods <= 0 || isNaN(feePerPeriod) || feePerPeriod < 0) {
                    return;
                }

                const results = calculateResults(principal, periods, feePerPeriod);

                // 数字动画效果
                animateNumber(earResultEl, 0, results.ear * 100, '%', 1000);
                animateNumber(nominalRateResultEl, 0, results.nominalRate * 100, '%', 800);
                animateCurrency(totalPrincipalEl, 0, principal, 600);
                animateCurrency(totalFeesEl, 0, results.totalFees, 700);
                animateCurrency(totalPaymentEl, 0, results.totalPayment, 900);

                // 更新风险等级和建议
                setTimeout(() => {
                    updateRiskLevel(results.ear);
                    generateAndDisplayRecommendations(results.ear, results.nominalRate);
                }, 500);

                // Prepare data for table and chart
                const tableData = populateTableAndGetData(principal, principal / periods, feePerPeriod, periods);

                // Draw new chart with animation
                setTimeout(() => {
                    drawCostAnalysisChart(tableData.labels, tableData.remainingData, tableData.effectiveRateData);
                }, 500);

                // Show results with staggered animation
                resultsSection.classList.add('show');

                // Show detailed analysis section with delay
                setTimeout(() => {
                    detailedAnalysisSection.classList.add('show');
                }, 800);
            }

            function animateNumber(element, start, end, suffix = '', duration = 1000) {
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // 使用easeOutCubic缓动函数
                    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                    const current = start + (end - start) * easeOutCubic;

                    element.textContent = current.toFixed(2) + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    }
                }

                requestAnimationFrame(update);
            }

            function animateCurrency(element, start, end, duration = 1000) {
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                    const current = start + (end - start) * easeOutCubic;

                    element.textContent = currencyFormatter.format(current);

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    }
                }

                requestAnimationFrame(update);
            }

            function populateTableAndGetData(principal, principalPerPeriod, feePerPeriod, periods) {
                amortizationTableBody.innerHTML = '';
                let remainingPrincipal = principal;

                const chartData = {
                    labels: [],
                    remainingData: [],
                    effectiveRateData: []
                };

                for (let i = 1; i <= periods; i++) {
                    const beginningBalance = remainingPrincipal;
                    const currentRate = feePerPeriod / beginningBalance;
                    const endingBalance = remainingPrincipal - principalPerPeriod;

                    // Data for chart
                    chartData.labels.push(`第${i}期`);
                    chartData.remainingData.push(beginningBalance);
                    chartData.effectiveRateData.push(currentRate);

                    const row = `
                        <tr class="text-sm hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300">
                            <td class="px-6 py-4 whitespace-nowrap font-semibold text-indigo-600">${i}</td>
                            <td class="px-6 py-4 whitespace-nowrap font-medium">${currencyFormatter.format(beginningBalance)}</td>
                            <td class="px-6 py-4 whitespace-nowrap font-medium">${currencyFormatter.format(principalPerPeriod)}</td>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-red-600">${currencyFormatter.format(feePerPeriod)}</td>
                            <td class="px-6 py-4 whitespace-nowrap font-semibold text-orange-600">${(currentRate * 100).toFixed(2)}%</td>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600">${currencyFormatter.format(Math.max(0, endingBalance))}</td>
                        </tr>
                    `;
                    amortizationTableBody.innerHTML += row;

                    remainingPrincipal = endingBalance;
                }
                return chartData;
            }

            function drawCostAnalysisChart(labels, remainingData, effectiveRateData) {
                const ctx = document.getElementById('cost-analysis-chart').getContext('2d');
                if (costAnalysisChart) costAnalysisChart.destroy();

                // 计算风险线位置
                const maxRate = Math.max(...effectiveRateData);
                const dangerLineValue = 0.15; // 15%风险线

                costAnalysisChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                type: 'line',
                                label: '剩余本金',
                                data: remainingData,
                                borderColor: 'rgba(67, 56, 202, 0.8)',
                                backgroundColor: 'rgba(67, 56, 202, 0.1)',
                                yAxisID: 'y-principal',
                                tension: 0.4,
                                fill: true,
                                borderWidth: 3,
                                pointBackgroundColor: 'rgba(67, 56, 202, 1)',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 3,
                                pointRadius: 6,
                                pointHoverRadius: 8,
                            },
                            {
                                type: 'bar',
                                label: '当期资金成本率',
                                data: effectiveRateData,
                                backgroundColor: effectiveRateData.map(rate =>
                                    rate > 0.15 ? 'rgba(239, 68, 68, 0.8)' :
                                        rate > 0.10 ? 'rgba(245, 158, 11, 0.8)' :
                                            'rgba(16, 185, 129, 0.8)'
                                ),
                                borderColor: effectiveRateData.map(rate =>
                                    rate > 0.15 ? 'rgba(220, 38, 38, 1)' :
                                        rate > 0.10 ? 'rgba(217, 119, 6, 1)' :
                                            'rgba(5, 150, 105, 1)'
                                ),
                                borderWidth: 2,
                                borderRadius: 8,
                                borderSkipped: false,
                                yAxisID: 'y-rate',
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    usePointStyle: true,
                                    padding: 20,
                                    font: {
                                        size: 12,
                                        weight: 'bold'
                                    }
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                borderWidth: 1,
                                cornerRadius: 12,
                                displayColors: true,
                                callbacks: {
                                    label: function (context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.dataset.yAxisID === 'y-rate') {
                                            const rate = context.raw;
                                            const riskLevel = rate > 0.15 ? '(高风险)' : rate > 0.10 ? '(中风险)' : '(低风险)';
                                            label += `${(rate * 100).toFixed(2)}% ${riskLevel}`;
                                        } else {
                                            label += currencyFormatter.format(context.raw);
                                        }
                                        return label;
                                    },
                                    afterLabel: function (context) {
                                        if (context.dataset.yAxisID === 'y-rate') {
                                            const rate = context.raw;
                                            if (rate > 0.15) {
                                                return '建议考虑其他融资方式';
                                            } else if (rate > 0.10) {
                                                return '可考虑缩短分期期数';
                                            }
                                        }
                                        return '';
                                    }
                                }
                            }
                        },
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        scales: {
                            x: {
                                display: true,
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)',
                                    lineWidth: 1,
                                },
                                ticks: {
                                    font: {
                                        weight: 'bold'
                                    }
                                }
                            },
                            'y-principal': {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: '剩余本金 (元)',
                                    font: {
                                        size: 12,
                                        weight: 'bold'
                                    }
                                },
                                grid: {
                                    color: 'rgba(67, 56, 202, 0.1)',
                                    lineWidth: 1,
                                },
                                ticks: {
                                    callback: (value) => currencyFormatter.format(value)
                                }
                            },
                            'y-rate': {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                    display: true,
                                    text: '当期成本率',
                                    font: {
                                        size: 12,
                                        weight: 'bold'
                                    }
                                },
                                grid: {
                                    drawOnChartArea: false,
                                    color: 'rgba(239, 68, 68, 0.1)',
                                },
                                ticks: {
                                    callback: (value) => `${(value * 100).toFixed(2)}%`
                                }
                            }
                        },
                        animation: {
                            duration: 2000,
                            easing: 'easeOutCubic'
                        },
                        elements: {
                            point: {
                                radius: 6,
                                hoverRadius: 10,
                                borderWidth: 3
                            },
                            bar: {
                                borderWidth: 2,
                                borderRadius: 8
                            }
                        }
                    }
                });
            }

            // 初始计算
            setTimeout(() => {
                performCalculation();
            }, 500);

            // 平滑滚动到指定元素
            function smoothScrollTo(elementId) {
                const element = document.getElementById(elementId.replace('#', ''));
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }

            // 键盘快捷键支持
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + Enter 快速计算
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (validateAllInputs()) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }

                // Ctrl/Cmd + E 导出数据
                if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                    e.preventDefault();
                    if (!resultsSection.classList.contains('hidden-initial')) {
                        exportCalculationResults();
                    }
                }

                // 数字键1-4快速选择方案
                if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    const activeElement = document.activeElement;
                    if (activeElement.tagName !== 'INPUT') {
                        e.preventDefault();
                        const btnIndex = parseInt(e.key) - 1;
                        const quickBtns = document.querySelectorAll('.quick-select-btn');
                        if (quickBtns[btnIndex]) {
                            quickBtns[btnIndex].click();
                        }
                    }
                }
            });

            // 添加快捷键提示
            const shortcutHint = document.createElement('div');
            shortcutHint.className = 'fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg z-50 hidden';
            shortcutHint.innerHTML = `
                    <div class="space-y-1">
                        <div><kbd class="bg-gray-600 px-1 rounded">Ctrl+Enter</kbd> 快速计算</div>
                        <div><kbd class="bg-gray-600 px-1 rounded">Ctrl+E</kbd> 导出数据</div>
                        <div><kbd class="bg-gray-600 px-1 rounded">1-4</kbd> 选择方案</div>
                    </div>
                `;
            document.body.appendChild(shortcutHint);

            // 显示快捷键提示（3秒后自动隐藏）
            setTimeout(() => {
                shortcutHint.classList.remove('hidden');
                setTimeout(() => {
                    shortcutHint.classList.add('hidden');
                }, 3000);
            }, 2000);

            // 为页面内锚点链接添加平滑滚动
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = this.getAttribute('href');
                    if (target && target !== '#') {
                        smoothScrollTo(target);
                    }
                });
            });
        });