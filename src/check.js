const mysql = require("./mysql");

const dodo = async () => {
    const sql = "SELECT * FROM dlt ORDER BY period DESC LIMIT 15";
    const data = await mysql.executeQuery(sql);
    const arr1 = ["01", "08", "09", "21", "33"];
    const arr2 = ["03", "05"];

    for (const item of data) {
        const result = item.result.split(" ");
        const arr3 = result.slice(0, 5);
        const arr4 = result.slice(5);

        const arr5 = arr1.filter(v => arr3.includes(v));
        const arr6 = arr2.filter(v => arr4.includes(v));

        if (arr5.length + arr6.length > 2) {
            console.log(item.period, arr5, arr6);
        }
    }
};

dodo();
