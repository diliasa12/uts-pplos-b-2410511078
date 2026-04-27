import e from "express";
import dotenv from "dotenv";
import errorHandler from "./middlewares/erroHandler.js";
dotenv.config({
  path: "./.env",
});
const app = e();
const PORT = process.env.PORT;
app.use(e.json());

app.use(errorHandler);
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
