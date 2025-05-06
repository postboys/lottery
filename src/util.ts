import axios from "axios";
import config from "./config";

export const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate();
};

export const notify = async (message: unknown) => {
    if (config.notifyKey) {
        const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${config.notifyKey}`;
        await axios.post(url, message);
    }
};
