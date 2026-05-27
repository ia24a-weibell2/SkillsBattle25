// Server bootstrap

require("dotenv").config();
const app = require("./app");

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
