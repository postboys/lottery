import { ConnectionOptions } from "mysql2";

export default {
    mysql: {
        host: process.env.DATABASE_HOST ?? "localhost",
        port: process.env.DATABASE_PORT ?? 3306,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
    } as ConnectionOptions,
    dlt: {
        drawDay: [1, 3, 6], // 周一、周三、周六
        drawHour: 21,
        drawMinute: 25,

        isDrawDateTime() {
            const date = new Date();
            const day = date.getDay();
            const hour = date.getHours();
            const minute = date.getMinutes();

            return this.drawDay.includes(day) && hour >= this.drawHour && minute >= this.drawMinute;
        },

        checkInterval: 1000 * 60 * 10, // 5分钟

        rule: {
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
        } as Record<number, Record<number, number>>,
    },
    notifyKey: process.env.NOTIFY_KEY,
};
