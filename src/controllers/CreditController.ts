import { Request, Response, Router } from "express";
import { CreditDao } from "@/dao/CreditDAO";
import { verifyToken } from "@/middlewares/jwt";
import { isUserAdmin, isUserRecovery } from "@/middlewares/Roles";
import { ErrorControl } from "@/constants/ErrorControl";
import { CheckCache } from "@/middlewares/Cache";
import { Cache } from "@/utils/cache";

export class CreditController extends CreditDao {
  private router: Router;

  constructor() {
    super();
    this.router = Router();
  }

  public routes(): Router {
    //get Late Credits
    this.router.get(
      "/late",
      verifyToken,
      isUserRecovery,
      async (req: Request, res: Response) => {
        const data = await CreditDao.getCreditsLate();
        if (data[0] === ErrorControl.SUCCESS) {
          return res
            .status(data[2])
            .json({
              message: "Late Credits found successfully",
              data: data[1],
            })
        }
        return res.status(data[2]).send(data[1]);
      }
    );

    this.router.get(
      "/user/:id",
      verifyToken,
      isUserRecovery,
      CheckCache,
      async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const data = await CreditDao.getCreditByUserId(id);
        if (data[0] === ErrorControl.SUCCESS) {
          Cache.set(req.body.cacheKey, {
            message: "Credits found successfully",
            data: data[1],
          }, 60);
          return res
            .status(data[2])
            .json({
              message: "Credits found successfully",
              data: data[1],
            })
        }
        return res.status(data[2]).send(data[1]);
      }
    );

    //get all
    this.router.get("/", verifyToken, isUserRecovery,
      CheckCache, async (req: Request, res: Response) => {
        const data = await CreditDao.getCredits();
        if (data[0] === ErrorControl.SUCCESS) {
          Cache.set(req.body.cacheKey, {
            message: "Credits found successfully",
            data: data[1],
          }, 60);
          return res
            .status(data[2])
            .json({
              message: "Credits found successfully",
              data: data[1],
            })
        }
        return res.status(data[2]).send(data[1]);
      });

    // get credit contract info 
    this.router.get("/contract/:id", verifyToken, isUserRecovery,
      CheckCache, async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const data = await CreditDao.getCreditContractInfo(id);
        if (data[0] === ErrorControl.SUCCESS) {
          Cache.set(req.body.cacheKey, {
            message: "Credit contract found successfully",
            data: data[1],
          }, 60);
          return res
            .status(data[2])
            .json({
              message: "Credit contract found successfully",
              data: data[1],
            });
        }
        return res.status(data[2]).json(data[1]);
      });

    // get credit info
    this.router.get("/:id", verifyToken, isUserRecovery,
      CheckCache, async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const data = await CreditDao.getCreditById(id);
        if (data[0] === ErrorControl.SUCCESS) {
          Cache.set(req.body.cacheKey, {
            message: "Credit found successfully",
            data: data[1],
          }, 60);
          return res
            .status(data[2])
            .json({
              message: "Credit found successfully",
              data: data[1],
            });
        }
        return res.status(data[2]).json(data[1]);
      });

    this.router.post("/", verifyToken, isUserRecovery, async (req: Request, res: Response) => {
      const data = await CreditDao.add(req.body);
      if (data[0] === ErrorControl.SUCCESS) {
        return res
          .status(data[2])
          .json(
            {
              message: "Credit created successfully",
              content: data[1]
            }
          );
      }
      return res.status(data[2]).send(data[1]);
    });

    // save signed contract
    this.router.put("/contract/:id", verifyToken, isUserRecovery, async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const data = await CreditDao.saveContract(id, req.body.signedContract);
      if (data[0] === ErrorControl.SUCCESS) {
        return res
          .status(data[2])
          .json({
            message: "Credit contract saved successfully",
            content: data[1]
          });
      }
      return res.status(data[2]).send(data[1]);
    });

    this.router.put(
      "/aprove/:id",
      verifyToken,
      isUserAdmin,
      async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const data = await CreditDao.approve(id);
        if (data[0] === ErrorControl.SUCCESS) {
          return res
            .status(data[2])
            .send("Credit aproved successfully: " + data[1]);
        }
        return res.status(data[2]).send(data[1]);
      }
    );

    this.router.put(
      "/reject/:id",
      verifyToken,
      isUserAdmin,
      async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const data = await CreditDao.reject(id);
        if (data[0] === ErrorControl.SUCCESS) {
          return res
            .status(data[2])
            .send("Credit rejected successfully: " + data[1]);
        }
        return res.status(data[2]).send(data[1]);
      }
    );

    this.router.put("/:id", verifyToken, isUserRecovery, async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);
      const data = await CreditDao.update(req.body, id);
      if (data[0] === ErrorControl.SUCCESS) {
        return res
          .status(data[2])
          .send("Credit updated successfully: " + data[1]);
      }
      return res.status(data[2]).send(data[1]);
    });

    this.router.delete(
      "/:id",
      verifyToken,
      isUserAdmin,
      async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const data = await CreditDao.delete(id);
        if (data[0] === ErrorControl.SUCCESS) {
          return res
            .status(data[2])
            .send("Credit deleted successfully: " + data[1]);
        }
        return res.status(data[2]).send(data[1]);
      }
    );

    return this.router;
  }
}
