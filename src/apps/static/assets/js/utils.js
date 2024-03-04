async function fetchApiJsonData(url) {
    try {
        var data = await fetch(url)
            .then(response => response.json());
        return data;
    } catch (error) {
        console.error(`There was a problem with the fetch operation: ${url}`, error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


function calculateDaysLeft(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const differenceMs = date - today;
    const daysLeft = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
    return daysLeft;
}

function getExpenseData(budgetData, masterData) {
    let committeeDict = {};
    let purposeDict = {};

    const committee = budgetData.committee;
    const budget = budgetData.budget;
    const committeeLength = committee.length

    for (let i = 0; i < committeeLength; i++) {
        committeeDict[committee[i]] = {
            "income": 0,
            "expense": 0,
            "budget": parseFloat(budget[i])
        }
    }

    for (let i = 0; i < masterData.length; i++) {

        const amount = masterData[i].Amount;
        const purpose = masterData[i].Purpose;
        const budget = masterData[i].Budget;

        if (!(purpose in purposeDict)) {
            purposeDict[purpose] = {
                "income": 0,
                "expense": 0
            }
        }

        if (!(budget in committeeDict)) {
            committeeDict[budget] = {
                "income": 0,
                "expense": 0,
                "budget": 0
            }
        }


        if (amount >= 0) {
            purposeDict[purpose]["income"] += parseFloat(amount);
            committeeDict[budget]["income"] += parseFloat(amount);
        } else {
            purposeDict[purpose]["expense"] += parseFloat(Math.abs(amount));
            committeeDict[budget]["expense"] += parseFloat(Math.abs(amount));
        }


    }

    return {
        "committee": committeeDict,
        "purpose": purposeDict
    }
}

function calculateDailyIncomeExpense(transactions) {
    const dailyData = {};

    transactions.forEach(transaction => {
        const date = formatDate(transaction.Date);
        const amount = parseFloat(transaction.Amount);

        if (!(date in dailyData)) {
            dailyData[date] = { date: date, income: 0, expense: 0 };
        }

        if (amount >= 0) {
            dailyData[date].income += amount;
        } else {
            dailyData[date].expense += Math.abs(amount);
        }
    });

    return Object.keys(dailyData)
    .sort((a, b) => new Date(a) - new Date(b))
    .map(key => dailyData[key]);;
}

function calculateIncomeExpenseByPurpose(transactions) {
    const result = {};

    transactions.forEach(transaction => {
        const purpose = transaction.Purpose;
        const amount = parseFloat(transaction.Amount);

        if (!result[purpose]) {
            result[purpose] = { purpose: purpose, income: 0, expense: 0 };
        }

        if (amount >= 0) {
            result[purpose].income += amount;
        } else {
            result[purpose].expense -= amount;
        }
    });

    return Object.values(result);
}
