const express = require("express");
const userRouter = require("./user.router");

const mainRouter = express.Router();
mainRouter.use(userRouter);

mainRouter.get("/", (req,res)=> {
      res.send("welcome!");
     });

module.exports = mainRouter;