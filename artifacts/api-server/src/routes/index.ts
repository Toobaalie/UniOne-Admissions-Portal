import { Router, type IRouter } from "express";
import healthRouter from "./health";
import discoveryRouter from "./discovery";
import studentRouter from "./student";

const router: IRouter = Router();

router.use(healthRouter);
router.use(discoveryRouter);
router.use(studentRouter);

export default router;
