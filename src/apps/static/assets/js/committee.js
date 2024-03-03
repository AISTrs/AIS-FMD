document.addEventListener("DOMContentLoaded", function () {

    let committeeDropdown = document.getElementById('committee-drop-down');
    let fiscalDropdown = document.getElementById("fiscal-term-drop-down");
    let committeeTitle = document.getElementById('committee-title');

    initSemester().then(budgetData => {

        let budget = budgetData[fiscalDropdown.selectedIndex];
        updateCommitteeDropdown(budget.committee);

        fetchApiJsonData('/api/master_ledger_data/').then(masterData => {

            const committee = committeeDropdown.options[0].text;
            populateCommitteeView(masterData, budget, committee);
            committeeTitle.innerText = `${committee} Budget Overview`;

            fiscalDropdown.addEventListener('change', function () {

                let budget = budgetData[fiscalDropdown.selectedIndex];
                updateCommitteeDropdown(budget.committee);
                const committee = committeeDropdown.options[0].text;
                populateCommitteeView(masterData, budget, committee);
                committeeTitle.innerText = `${committee} Budget Overview`;

            });

            committeeDropdown.addEventListener('change', function () {

                let budget = budgetData[fiscalDropdown.selectedIndex];
                const committee = committeeDropdown.options[committeeDropdown.selectedIndex].text;
                populateCommitteeView(masterData, budget, committee);
                committeeTitle.innerText = `${committee} Budget Overview`;
            })

        });

    });

});

function populateCommitteeView(masterData, budget, committee) {

    let committeeDropdown = document.getElementById('committee-drop-down');

    let data = masterData.filter(item => {
        const itemDate = new Date(item.Date);
        const startDate = new Date(budget.start_date)
        const endDate = new Date(budget.end_date);
        const budgetCommittee = item.Budget;

        return itemDate >= startDate && itemDate <= endDate && committee == budgetCommittee;
    });

    const columns = ["Date", "Amount", "Details", "Budget", "Purpose", "Account"];

    const dailyData = calculateDailyIncomeExpense(data);

    createDataTable(data, "dataTable", columns);
    drawLineChart(dailyData, 'lineChart');
    plotDoubleBarChart(calculateIncomeExpenseByPurpose(data), 'doubleBarChart');

    const cashInflowText = document.getElementById('cash-inflow-text');
    const cashOutflowText = document.getElementById('cash-outflow-text');
    const cashNetflowText = document.getElementById('cash-netflow-text');
    const budgetText = document.getElementById('estimated-budget');
    const usageText = document.getElementById('budget-usage');
    const usagePrecentText = document.getElementById('budget-usage-percentage');

    let cashInflow = 0;
    let cashOutflow = 0;
    let totalBudget = parseFloat(budget.budget[committeeDropdown.selectedIndex]);
    let usage = 0;

    for (daily of dailyData) {
        cashInflow += daily.income;
        cashOutflow += daily.expense;
    }

    usage = (cashOutflow / totalBudget).toFixed(2) * 100;


    cashInflowText.innerText = `$${cashInflow.toFixed(2)}`;
    cashOutflowText.innerText = `$${cashOutflow.toFixed(2)}`;
    cashNetflowText.innerText = `$${(cashInflow - cashOutflow).toFixed(2)}`;
    budgetText.innerText = `$${totalBudget.toFixed(2)}`;
    usageText.innerText = `$${cashOutflow.toFixed(2)}`;
    usagePrecentText.innerText = `${usage}%`;

    createProgressBar(usage, 'progressChart');

}

function updateCommitteeDropdown(data) {
    let committeeDropdown = document.getElementById('committee-drop-down');

    committeeDropdown.innerHTML = "";

    data.forEach((committee, index) => {
        const newOption = document.createElement("option");
        newOption.value = index;
        newOption.text = committee;
        committeeDropdown.add(newOption);
    });
}

function drawLineChart(chartData, containerId) {

    const dates = chartData.map(item => item.date);
    const income = chartData.map(item => item.income);
    const expense = chartData.map(item => item.expense);

    const ctx = document.getElementById(containerId).getContext('2d');
    const data = {
        labels: dates,
        datasets: [{
            label: 'Income',
            data: income,
            borderColor: 'rgb(118, 196, 113)',
            fill: false
        }, {
            label: 'Expense',
            data: expense,
            borderColor: 'rgb(255, 159, 64)',
            fill: false
        }]
    };
    const options = {
        responsive: false,
        plugins: {
            title: {
                display: true,
                text: 'Income/Expense Timeseries Chart'
            }
        }
    };

    if (window.lineChart instanceof Chart) {
        window.lineChart.destroy();
    }

    window.lineChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}

function plotDoubleBarChart(data, containerId) {

    const labels = data.map(item => item.purpose);
    const incomes = data.map(item => item.income);
    const expenses = data.map(item => item.expense);

    const ctx = document.getElementById(containerId).getContext('2d');

    if (window.doubleBarChart instanceof Chart) {
        window.doubleBarChart.destroy();
    }

    window.doubleBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    data: incomes
                },
                {
                    label: 'Expense',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: expenses
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Income and Expense by Purpose',
                    font: {
                        size: 12
                    }
                }
            }
        }
    });
}

function createProgressBar(usage, containerId) {

    const progressData = {
        datasets: [{
            data: [usage, Math.max(0, 100 - usage)],
            backgroundColor: ['#76C471', '#f0f0f0'],
            borderWidth: 0,
            cutout: '50%'
        }],
        labels: ['Usage', 'Remaining']
    };

    const progressOptions = {
        responsive: false,
        cutoutPercentage: 75,
        legend: { display: true },
        tooltips: { enabled: true },
        elements: {
            arc: {
                borderWidth: 0

            }
        }
    };

    const ctx = document.getElementById(containerId).getContext('2d');

    if (window.progressChart instanceof Chart) {
        window.progressChart.destroy();
    }

    window.progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: progressData,
        options: progressOptions
    });
}


function createDataTable(data, containerId, columns) {

    const dataTableColumns = columns.map(column => ({ title: column, data: column }));

    if ($.fn.DataTable.isDataTable('#dataTable')) {
        $('#dataTable').DataTable().destroy();
    }

    $('#' + containerId).DataTable({
        data: data,
        columns: dataTableColumns,
        searching: true,
        lengthChange: true,
        info: true,
        paging: true,
        scrollY: "200px",
    });
}