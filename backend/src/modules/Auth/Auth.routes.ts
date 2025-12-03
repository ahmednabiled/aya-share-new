import express, { type Request, type Response} from "express";
import passport from "../../config/passport.js";
import { handleCallBack } from "./Auth.controller.js";
import { isAuth } from "./Auth.service.js";

const router = express.Router();

router.get('/google', passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/google/callback", passport.authenticate("google", {
    failureRedirect: "/login", //to do
    session: false
}), handleCallBack);

router.post("/logout", isAuth, (req: Request, res: Response) => {
    res.clearCookie("refreshtoken");
    res.status(200).json({
        status: "Success"
    })
})


export default router;