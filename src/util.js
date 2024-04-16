const isToday = (date) => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
};

const isLotteryDay = (date) => {
  const day = date.getDay();
  return day === 1 || day === 3 || day === 6;
};

module.exports = {
  isToday,
  isLotteryDay,
};
