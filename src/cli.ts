import { program } from "commander";
import { name, version } from "../package.json";
import DLTService from "./dlt.service";

program.name(`${name}-cli`).version(version);

program.command("check")
    .argument("<type>", "类型，仅支持 dlt")
    .argument("<numbers>", "号码，用逗号分隔")
    .action(async (type: string, numbers: string) => {
        if (type !== "dlt") {
            console.error("仅支持 type 为 \"dlt\"");
            process.exit(1);
        }

        const numberList = numbers.split(",").map(n => n.trim());
        if (!numberList.every(n => /^\d+$/.test(n))) {
            console.error("号码必须为逗号分隔的纯数字");
            process.exit(1);
        }

        const dlt = new DLTService();
        await dlt.check(numberList.map(n => parseInt(n, 10)));
    });

program.parse(process.argv);
