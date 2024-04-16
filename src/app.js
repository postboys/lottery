const dlt = require("./dlt");

const start = async () => {
  await dlt.sync();
};

start();
