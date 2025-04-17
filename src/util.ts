export const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate();
};

export const isLotteryDay = (date: Date) => {
    const day = date.getDay();
    return day === 1 || day === 3 || day === 6;
};
