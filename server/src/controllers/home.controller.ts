import { NextFunction, Request, Response } from 'express';
import HomeManager from '../managers/home.manager';

export default class HomeController {
    public renderHome(req: Request, res: Response, next: NextFunction): void {
        try {
            const title = HomeManager.instance.getHomeTitle();
            res.json({ title });
        } catch (error) {
            next(error);
        }
    }
}
