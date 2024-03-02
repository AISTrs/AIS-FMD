
async function initSemester() {

    let fiscalDropdown = document.getElementById("fiscal-term-drop-down");

    let budgetData = await fetchApiJsonData("/api/committee_budget_data/").then(data => data);

    let startDate = document.getElementById('start-date-label');
    let endDate = document.getElementById('end-date-label');
    let daysLeft = document.getElementById('days-left-date-label');

    startDate.innerText = `Start Date: ${budgetData[0].start_date}`;
    endDate.innerText = `End Date: ${budgetData[0].end_date}`;
    daysLeft.innerText = `Days left: ${calculateDaysLeft(budgetData[0].end_date)}`;
    budgetData.forEach((option, index) => {
        const newOption = document.createElement("option");
        newOption.value = index;
        newOption.text = option.semester;
        fiscalDropdown.add(newOption);
    });

    fiscalDropdown.addEventListener('change', function () {
        startDate.innerText = `Start Date: ${budgetData[fiscalDropdown.selectedIndex].start_date}`;
        endDate.innerText = `Start Date: ${budgetData[fiscalDropdown.selectedIndex].end_date}`;
        daysLeft.innerText = `Days left: ${calculateDaysLeft(budgetData[fiscalDropdown.selectedIndex].end_date)}`;
    });

    return budgetData;
}
