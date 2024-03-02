document.addEventListener("DOMContentLoaded", function () {

    let fiscalDropdown = document.getElementById("fiscal-term-drop-down");


    initSemester().then(budgetData => {
        let budget = budgetData[fiscalDropdown.selectedIndex];

        fetchApiJsonData('api/master_ledger_data/').then(masterData => {

            populateSemesterOverview(budget, masterData);

            fiscalDropdown.addEventListener('change', function () {

                let budget = budgetData[fiscalDropdown.selectedIndex];

                populateSemesterOverview(budget, masterData);

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
        const usage = parseFloat((((budget - net) / budget) * 100).toFixed(2));

        tableData.push({ "Committee": committee, "Budget": budget, "Expenses": expense, "Income": income, "Net": net, "Usage": usage });
    }

    const columns = ["Committee", "Budget", "Expenses", "Income", "Net", "Usage"];

    createDataTable(tableData, 'dataTable', columns);
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


