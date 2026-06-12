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

            // Currency Formatter
            const currencyFormatter = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });

            // 计算结果缓存
            const calculationCache = new Map();

            // 添加输入验证和实时反馈
            const inputs = ['principal', 'periods', 'fee', 'monthly-payment'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (!input) return;
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

            // 还款方式切换事件
            const methodRadios = document.querySelectorAll('input[name="repayment_method"]');
            const feeContainer = document.getElementById('fee-container');
            const monthlyPaymentContainer = document.getElementById('monthly-payment-container');
            const quickSelectWrapper = document.getElementById('quick-select-wrapper');

            methodRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    // Reset styling of labels
                    const feeLabel = document.getElementById('label-method-fee');
                    const instLabel = document.getElementById('label-method-installment');
                    
                    feeLabel.classList.remove('border-zinc-700', 'bg-zinc-800/50');
                    feeLabel.classList.add('border-zinc-800', 'bg-transparent');
                    feeLabel.querySelector('span').classList.remove('text-white');
                    feeLabel.querySelector('span').classList.add('text-zinc-300');

                    instLabel.classList.remove('border-zinc-700', 'bg-zinc-800/50');
                    instLabel.classList.add('border-zinc-800', 'bg-transparent');
                    instLabel.querySelector('span').classList.remove('text-white');
                    instLabel.querySelector('span').classList.add('text-zinc-300');

                    // Set active styling
                    const selectedLabel = document.getElementById(`label-method-${e.target.value === 'equal-fee' ? 'fee' : 'installment'}`);
                    selectedLabel.classList.remove('border-zinc-800', 'bg-transparent');
                    selectedLabel.classList.add('border-zinc-700', 'bg-zinc-800/50');
                    selectedLabel.querySelector('span').classList.remove('text-zinc-300');
                    selectedLabel.querySelector('span').classList.add('text-white');

                    if (e.target.value === 'equal-fee') {
                        feeContainer.classList.remove('hidden');
                        monthlyPaymentContainer.classList.add('hidden');
                        if (quickSelectWrapper) quickSelectWrapper.classList.remove('hidden');
                    } else {
                        feeContainer.classList.add('hidden');
                        monthlyPaymentContainer.classList.remove('hidden');
                        if (quickSelectWrapper) quickSelectWrapper.classList.add('hidden');
                    }

                    if (validateAllInputs()) {
                        performQuickCalculation();
                    }
                });
            });

            // 快捷选择按钮事件
            const quickSelectBtns = document.querySelectorAll('.quick-select-btn');
            quickSelectBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // 移除其他按钮的激活状态
                    quickSelectBtns.forEach(b => {
                        b.classList.remove('bg-white', 'text-zinc-900', 'border-transparent', 'shadow-sm', 'active');
                        b.classList.add('bg-zinc-800', 'text-zinc-300', 'border-white/5');
                    });
                    // 激活当前按钮
                    btn.classList.remove('bg-zinc-800', 'text-zinc-300', 'border-white/5');
                    btn.classList.add('bg-white', 'text-zinc-900', 'border-transparent', 'shadow-sm', 'active');

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
                const method = document.querySelector('input[name="repayment_method"]:checked').value;

                let isValidBase = !isNaN(principal) && principal > 0 && !isNaN(periods) && periods > 0;

                if (method === 'equal-fee') {
                    const fee = parseFloat(document.getElementById('fee').value);
                    return isValidBase && !isNaN(fee) && fee >= 0;
                } else {
                    const monthlyPayment = parseFloat(document.getElementById('monthly-payment').value);
                    return isValidBase && !isNaN(monthlyPayment) && monthlyPayment > (principal / periods);
                }
            }

            function performQuickCalculation() {
                const principal = parseFloat(document.getElementById('principal').value);
                const periods = parseInt(document.getElementById('periods').value);
                const method = document.querySelector('input[name="repayment_method"]:checked').value;
                const feeOrPayment = parseFloat(document.getElementById(method === 'equal-fee' ? 'fee' : 'monthly-payment').value);

                const cacheKey = `${principal}-${periods}-${feeOrPayment}-${method}`;
                let cachedResult = calculationCache.get(cacheKey);

                if (!cachedResult) {
                    cachedResult = calculateResults(principal, periods, feeOrPayment, method);
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
                    previewEar.className = ear > 0.15 ? 'font-mono font-medium text-rose-500' :
                        ear > 0.10 ? 'font-mono font-medium text-amber-500' :
                            'font-mono font-medium text-emerald-500';
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

            function calculateResults(principal, periods, feeOrPayment, method) {
                let monthlyPayment;
                let totalFees;
                let fee = 0;

                if (method === 'equal-fee') {
                    fee = feeOrPayment;
                    const principalPerPeriod = principal / periods;
                    monthlyPayment = principalPerPeriod + fee;
                    totalFees = fee * periods;
                } else {
                    monthlyPayment = feeOrPayment;
                    totalFees = monthlyPayment * periods - principal;
                    fee = totalFees / periods;
                }

                const totalPayment = principal + totalFees;

                const cashFlows = [principal, ...Array(periods).fill(-monthlyPayment)];
                const monthlyIRR = calculateIRR(cashFlows);
                const ear = isNaN(monthlyIRR) ? 0 : Math.pow(1 + monthlyIRR, 12) - 1;
                const nominalRate = method === 'equal-fee' ? (totalFees / principal) : (monthlyIRR * 12);

                return {
                    ear,
                    nominalRate,
                    totalFees,
                    totalPayment,
                    principal,
                    periods,
                    fee,
                    monthlyPayment,
                    method,
                    monthlyIRR
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

                // 更新成本倍数
                updateCostMultiplier(results.ear, results.nominalRate);

                // 更新成本占比进度条
                updateCostRatioBar(results.totalFees, results.totalPayment);

                // 生成建议
                generateAndDisplayRecommendations(results.ear, results.nominalRate);

                // 显示结果区域
                resultsSection.classList.add('show');
            }

            function updateRiskLevel(ear) {
                const rateCard = document.getElementById('rate-card');
                if (!rateCard) return;

                rateCard.classList.remove('rate-card-low', 'rate-card-medium', 'rate-card-high');

                if (ear < 0.10) {
                    rateCard.classList.add('rate-card-low');
                } else if (ear < 0.15) {
                    rateCard.classList.add('rate-card-medium');
                } else {
                    rateCard.classList.add('rate-card-high');
                }

                // Also update fee bar color
                const feeBar = document.getElementById('cost-ratio-fee');
                const feeDot = document.querySelector('.cost-ratio-fee-dot');
                if (feeBar) {
                    feeBar.classList.remove('cost-ratio-fee-low', 'cost-ratio-fee-medium', 'cost-ratio-fee-high');
                    if (ear < 0.10) {
                        feeBar.classList.add('cost-ratio-fee-low');
                        if (feeDot) feeDot.style.background = 'var(--color-risk-low)';
                    } else if (ear < 0.15) {
                        feeBar.classList.add('cost-ratio-fee-medium');
                        if (feeDot) feeDot.style.background = 'var(--color-risk-medium)';
                    } else {
                        feeBar.classList.add('cost-ratio-fee-high');
                        if (feeDot) feeDot.style.background = 'var(--color-risk-high)';
                    }
                }
            }

            function updateCostMultiplier(ear, nominalRate) {
                const el = document.getElementById('cost-multiplier');
                if (!el || !nominalRate || nominalRate === 0) return;
                const multiplier = ear / nominalRate;
                el.textContent = `×${multiplier.toFixed(2)}`;

                // Color the badge based on multiplier magnitude
                el.classList.remove('text-emerald-400', 'text-amber-400', 'text-rose-400');
                if (multiplier < 1.5) {
                    el.classList.add('text-emerald-400');
                } else if (multiplier < 2.0) {
                    el.classList.add('text-amber-400');
                } else {
                    el.classList.add('text-rose-400');
                }
            }

            function updateCostRatioBar(totalFees, totalPayment) {
                const principalBar = document.getElementById('cost-ratio-principal');
                const feeBar = document.getElementById('cost-ratio-fee');
                const label = document.getElementById('cost-ratio-label');
                if (!principalBar || !feeBar || !label || totalPayment <= 0) return;

                const feeRatio = totalFees / totalPayment;
                const principalRatio = 1 - feeRatio;

                principalBar.style.width = (principalRatio * 100).toFixed(2) + '%';
                feeBar.style.width = (feeRatio * 100).toFixed(2) + '%';
                label.textContent = (feeRatio * 100).toFixed(2) + '%';
            }

            function generateAndDisplayRecommendations(ear, nominalRate) {
                const recommendations = generateRecommendations(ear, nominalRate);
                const recommendationsSection = document.getElementById('recommendations-section');

                if (recommendations.length > 0) {
                    recommendationsSection.innerHTML = recommendations.map(rec => `
                            <div class="bg-zinc-800 border border-white/5 p-3 rounded-lg text-xs shadow-sm">
                                <div class="flex items-start gap-2">
                                    <span class="text-lg">${rec.icon}</span>
                                    <div>
                                        <h4 class="font-medium text-zinc-100 mb-0.5">${rec.title}</h4>
                                        <p class="text-zinc-400 leading-relaxed">${rec.message}</p>
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
                        message: '当前分期方案 of 资金成本相对合理，可以考虑使用。',
                        icon: '✅'
                    });
                }

                return recommendations;
            }

            function exportCalculationResults() {
                const method = document.querySelector('input[name="repayment_method"]:checked').value;
                const principal = document.getElementById('principal').value;
                const periods = document.getElementById('periods').value;
                const ear = document.getElementById('ear-result').textContent;
                const nominalRate = document.getElementById('nominal-rate-result').textContent;
                const totalFees = document.getElementById('total-fees').textContent;
                const totalPayment = document.getElementById('total-payment').textContent;

                const inputParams = {
                    还款方式: method === 'equal-fee' ? '等额手续费' : '等额本息',
                    分期总金额: `¥${principal}`,
                    分期期数: `${periods}期`
                };
                
                if (method === 'equal-fee') {
                    inputParams.每期手续费 = `¥${document.getElementById('fee').value}`;
                } else {
                    inputParams.每月还款金额 = `¥${document.getElementById('monthly-payment').value}`;
                }

                const data = {
                    计算时间: new Date().toLocaleString('zh-CN'),
                    输入参数: inputParams,
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
                const method = document.querySelector('input[name="repayment_method"]:checked').value;
                const inputData = {
                    method: method,
                    principal: document.getElementById('principal').value,
                    periods: document.getElementById('periods').value,
                    fee: document.getElementById('fee').value,
                    monthlyPayment: document.getElementById('monthly-payment').value,
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
                            document.getElementById('principal').value = latest.principal || '12000';
                            document.getElementById('periods').value = latest.periods || '12';
                            document.getElementById('fee').value = latest.fee || '72';
                            if (latest.monthlyPayment) {
                                document.getElementById('monthly-payment').value = latest.monthlyPayment;
                            }
                            if (latest.method === 'equal-installment') {
                                document.querySelector('input[name="repayment_method"][value="equal-installment"]').checked = true;
                                // 触发change事件以更新UI
                                document.querySelector('input[name="repayment_method"][value="equal-installment"]').dispatchEvent(new Event('change'));
                            }
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
                const method = document.querySelector('input[name="repayment_method"]:checked').value;
                const feeOrPayment = parseFloat(document.getElementById(method === 'equal-fee' ? 'fee' : 'monthly-payment').value);

                if (!validateAllInputs()) {
                    return;
                }

                const results = calculateResults(principal, periods, feeOrPayment, method);

                // 数字动画效果
                animateNumber(earResultEl, 0, results.ear * 100, '%', 1000);
                animateNumber(nominalRateResultEl, 0, results.nominalRate * 100, '%', 800);
                animateCurrency(totalPrincipalEl, 0, principal, 600);
                animateCurrency(totalFeesEl, 0, results.totalFees, 700);
                animateCurrency(totalPaymentEl, 0, results.totalPayment, 900);

                // 更新风险等级、成本倍数、进度条和建议
                setTimeout(() => {
                    updateRiskLevel(results.ear);
                    updateCostMultiplier(results.ear, results.nominalRate);
                    updateCostRatioBar(results.totalFees, results.totalPayment);
                    generateAndDisplayRecommendations(results.ear, results.nominalRate);
                }, 500);

                // Populate amortization table
                populateTableAndGetData(results);

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

            function populateTableAndGetData(results) {
                amortizationTableBody.innerHTML = '';
                let remainingPrincipal = results.principal;

                const chartData = {
                    labels: [],
                    remainingData: [],
                    effectiveRateData: []
                };

                for (let i = 1; i <= results.periods; i++) {
                    const beginningBalance = remainingPrincipal;
                    let currentRate, principalPerPeriod, feePerPeriod, endingBalance;

                    if (results.method === 'equal-fee') {
                        principalPerPeriod = results.principal / results.periods;
                        feePerPeriod = results.fee;
                        currentRate = feePerPeriod / beginningBalance;
                        endingBalance = remainingPrincipal - principalPerPeriod;
                    } else {
                        currentRate = results.monthlyIRR;
                        feePerPeriod = beginningBalance * currentRate;
                        principalPerPeriod = results.monthlyPayment - feePerPeriod;
                        endingBalance = remainingPrincipal - principalPerPeriod;
                    }

                    // Data for chart
                    chartData.labels.push(`第${i}期`);
                    chartData.remainingData.push(beginningBalance);
                    chartData.effectiveRateData.push(currentRate);

                    const row = `
                        <tr class="text-sm border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td class="px-4 py-3 whitespace-nowrap font-medium text-zinc-300">${i}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-zinc-400">${currencyFormatter.format(beginningBalance)}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-zinc-100">${currencyFormatter.format(principalPerPeriod)}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-rose-400">${currencyFormatter.format(feePerPeriod)}</td>
                            <td class="px-4 py-3 whitespace-nowrap font-medium text-amber-400">${(currentRate * 100).toFixed(2)}%</td>
                            <td class="px-4 py-3 whitespace-nowrap text-zinc-500">${currencyFormatter.format(Math.max(0, endingBalance))}</td>
                        </tr>
                    `;
                    amortizationTableBody.innerHTML += row;

                    remainingPrincipal = Math.max(0, endingBalance);
                }
                return chartData;
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