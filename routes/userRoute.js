import express from "express";
import { fetch,createUser,update,deleteUser } from "../controller/userController.js";

const route = express.Router();


route.get("/getAllUsers", fetch);
route.post("/create", createUser);
route.put("/update/:id", update);

route.delete("/test", (req, res) => {
    res.send("DELETE is working");
});

route.delete("/delete/:id", deleteUser);
export default route;