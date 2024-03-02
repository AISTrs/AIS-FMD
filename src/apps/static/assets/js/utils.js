async function fetchApiJsonData(url) {
    try {
        var data = await fetch(url)
            .then(response => response.json());
        return data;
    } catch (error) {
        console.error(`There was a problem with the fetch operation: ${url}`, error);
    }
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

        if (!(purpose in purposeDict)) {
            purposeDict[purpose] = {
                "income": 0,
                "expense": 0
            }
        }

        if (amount >= 0) {
            purposeDict[purpose]["income"] += parseFloat(amount);
        } else {
            purposeDict[purpose]["income"] += parseFloat(Math.abs(amount));
        }

        if (masterData[i].Budget in committeeDict) {
            if (amount >= 0) {
                committeeDict[masterData[i].Budget]["income"] += parseFloat(amount);
            } else {
                committeeDict[masterData[i].Budget]["expense"] += parseFloat(Math.abs(amount));
            }
        }


    }

    return {
        "committee": committeeDict,
        "purpose": purposeDict
    }
}