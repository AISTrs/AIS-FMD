document.addEventListener("DOMContentLoaded", function () {

    let fiscalDropdown = document.getElementById("fiscal-term-drop-down");
    google.charts.load('current', { 'packages': ['corechart'] });

    google.charts.setOnLoadCallback(function() {
        console.log('Google Charts loaded');
        initSemester().then(budgetData => {
            let budget = budgetData[fiscalDropdown.selectedIndex];

            fetchApiJsonData('/api/master_ledger_data/').then(masterData => {

                populateSemesterOverview(budget, masterData);

                fiscalDropdown.addEventListener('change', function () {

                    let budget = budgetData[fiscalDropdown.selectedIndex];

                    populateSemesterOverview(budget, masterData);

                });

            });

        });
});


});

function populateSemesterOverview(budget, masterData) {

    let data = masterData.filter(item => {
        const itemDate = new Date(item.Date);
        const startDate = new Date(budget.start_date)
        const endDate = new Date(budget.end_date);

        return itemDate >= startDate && itemDate <= endDate;
    });

    const expenseData = getExpenseData(budget, data);
    const committeeDict = expenseData.committee

    let tableData = []

    for (committee in committeeDict) {
        const income = parseFloat(committeeDict[committee].income.toFixed(2));
        const expense = parseFloat(committeeDict[committee].expense.toFixed(2));
        const budget = parseFloat(committeeDict[committee].budget.toFixed(2));
        const net = parseFloat((budget + income - expense).toFixed(2));
        const usage = budget > 0 ? parseFloat((((budget - net) / budget) * 100).toFixed(2)) : 0;

        tableData.push({ "Committee": committee, "Budget": `$${budget}`, "Expenses": `$${expense}`, "Income": `$${income}`, "Net": `$${net}`, "Usage": `${usage}%` });
    }

    const columns = ["Committee", "Budget", "Expenses", "Income", "Net", "Usage"];

    createDataTable(tableData, 'dataTable', columns);
    updateCashSummary(tableData);
    updatePurposeSummary(expenseData.purpose);

}

function createDataTable(data, containerId, columns) {

    const dataTableColumns = columns.map(column => ({ title: column, data: column }));

    if ($.fn.DataTable.isDataTable('#dataTable')) {
        $('#dataTable').DataTable().destroy();
    }

    $('#' + containerId).DataTable({
        data: data,
        columns: dataTableColumns,
        searching: false,
        lengthChange: false,
        info: true,
        paging: false,
        scrollY: "200px",
    });
}


function updateCashSummary(data) {
    const cashInflowText = document.getElementById('cash-inflow-text');
    const cashOutflowText = document.getElementById('cash-outflow-text');
    const cashNetflowText = document.getElementById('cash-netflow-text');
    const budgetText = document.getElementById('estimated-budget');
    const usageText = document.getElementById('budget-usage');
    const budgetRemainingText = document.getElementById('budget-usage-remaining');

    let cashInflow = 0;
    let cashOutflow = 0;
    let totalBudget = 0;
    let usage = 0;
    let remaining = 0;

    for (budget of data) {
        cashInflow += parseFloat(budget.Income.replace('$', ''));
        cashOutflow += parseFloat(budget.Expenses.replace('$', ''));
        totalBudget += parseFloat(budget.Budget.replace('$', ''));
    }

    usage = (cashOutflow / totalBudget).toFixed(2) * 100;
    remaining = Math.max((totalBudget - cashOutflow).toFixed(2), 0 );

    cashInflowText.innerText = `$${cashInflow.toFixed(2)}`;
    cashOutflowText.innerText = `$${cashOutflow.toFixed(2)}`;
    cashNetflowText.innerText = `$${(cashInflow - cashOutflow).toFixed(2)}`;
    budgetText.innerText = `$${totalBudget.toFixed(2)}`;
    usageText.innerText = `$${cashOutflow.toFixed(2)}`;
    budgetRemainingText.innerText = `$${remaining.toFixed(2)}`;

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

    const ctx = document.getElementById('progressChart').getContext('2d');

    if (window.progressChart instanceof Chart) {
        window.progressChart.destroy();
    }

    window.progressChart = new Chart(ctx, {
        type: 'doughnut',
        data: progressData,
        options: progressOptions
    });

}

function updatePurposeSummary(data) {


    // Purpose Income Data
    let sortedData = Object.entries(data).sort(([, a], [, b]) => b.income - a.income);
    let top3Incomes = sortedData.slice(0, 3);
    let sumOfOthers = sortedData.slice(3).reduce((acc, [, { income }]) => acc + income, 0);
    let chartData = [
        ...top3Incomes.map(([key, { income }]) => ({ category: key, value: income.toFixed(2) })),
        { category: "Others", value: sumOfOthers.toFixed(2) }
    ];

    if (chartData.length == 1) {
        chartData[0] = { category: "Others", value: 0.00001 }
    }

    drawChart(chartData, "Purpose Income", "purpose-income-pie-chart");
    populateTable(chartData, "purpose-income-table");

    // Purpose Expense Data

    sortedData = Object.entries(data).sort(([, a], [, b]) => b.expense - a.expense);
    top3Expenses = sortedData.slice(0, 3);
    sumOfOthers = sortedData.slice(3).reduce((acc, [, { expense }]) => acc + expense, 0);
    chartData = [
        ...top3Expenses.map(([key, { expense }]) => ({ category: key, value: expense.toFixed(2) })),
        { category: "Others", value: sumOfOthers.toFixed(2) }
    ];

    if (chartData.length == 1) {
        chartData[0] = { category: "Others", value: 0.00001 }
    }

    drawChart(chartData, "Purpose Expenses", "purpose-expense-pie-chart");
    populateTable(chartData, "purpose-expense-table");

}

function drawChart(data, title, containerId) {

    const chartData = [["Category", "Value"], ...data.map(item => [item.category, parseFloat(item.value)])];

    var data = google.visualization.arrayToDataTable(chartData);

    var options = {
        title: title
    };

    var chart = new google.visualization.PieChart(document.getElementById(containerId));

    chart.draw(data, options);
}

function populateTable(data, containerId) {

    const table = document.getElementById(containerId).getElementsByTagName('tbody')[0];
    table.innerHTML = "";
    data.forEach(item => {
        const row = table.insertRow();
        const category = row.insertCell();
        const value = row.insertCell();

        category.textContent = item.category;
        value.textContent = `$${parseFloat(item.value).toFixed(2)}`;
    });

}