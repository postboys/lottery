import { DLTData } from "./dlt";
import { executeQuery } from "./mysql";

const rule: Record<number, Record<number, number>> = {
    0: {
        3: 9,
        4: 7,
        5: 3,
    },
    1: {
        2: 9,
        3: 8,
        4: 5,
        5: 2,
    },
    2: {
        0: 9,
        1: 9,
        2: 8,
        3: 6,
        4: 4,
        5: 1,
    },
};

const dodo = async (fromPeriod?: string) => {
    let sql = "SELECT * FROM dlt";

    if (fromPeriod) {
        sql += ` WHERE period >= '${fromPeriod}'`;
    }

    sql += " ORDER BY period DESC LIMIT 15";

    const data = await executeQuery<DLTData[]>(sql);
    const arr1 = ["01", "08", "09", "21", "33"];
    const arr2 = ["03", "05"];

    for (const item of data) {
        const result = item.result.split(" ");
        const arr3 = result.slice(0, 5);
        const arr4 = result.slice(5);

        const arr5 = arr1.filter(v => arr3.includes(v));
        const arr6 = arr2.filter(v => arr4.includes(v));

        const rewards = rule[arr6.length]?.[arr5.length];
        if (rewards) {
            console.log(item.time.toLocaleDateString(), item.period, arr5, arr6, rewards);
        }
    }

    console.log(`Total: ${data.length.toString()}`);
};

dodo(process.argv.slice(2)[0]).catch((error: unknown) => {
    console.log(error);
});
