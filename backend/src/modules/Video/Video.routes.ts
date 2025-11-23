import express, { type Request, type Response} from "express";
import uploadAudio from "../../config/multer.js";
import { spawn } from "child_process";
import path from "path";

const router = express.Router();

function processAudio(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log(filePath);
        const py = spawn("python", ["../scripts/app.py", filePath]);

        let result = "";
        let error = "";

        py.stdout.on("data", d => result += d.toString());
        py.stderr.on("data", d => error += d.toString());

        py.on("close", code => {
            if (code === 0) resolve(result.trim());
            else reject(error);
        });
    })
}

router.post("/createVideo", uploadAudio.single("audio"), (req: Request, res: Response) => {

    processAudio(req.file?.path!)
    .then(output => res.json({ result: output }))
    .catch(err => res.status(500).json({ error: err.toString() }));

    // res.status(200).json({
    //     status: "Success",
    //     data: {
    //         file: req.file
    //     },
    // });
})

router.delete("/deleteVideo/:id", (req: Request, res: Response) => {

})

router.get("/allVidoes", (req: Request, res: Response) => {

})

export default router;