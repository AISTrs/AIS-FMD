async function fetchApiJsonData(url) {
    try {
        var data = await fetch(url)
            .then(response => response.json());
        return data;
    } catch (error) {
        console.error(`There was a problem with the fetch operation: ${url}`, error);
    }
}