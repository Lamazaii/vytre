import { NextFunction, Request, Response } from 'express';
import UserManager from '../managers/user.manager';

export default class UserController {
    public getUser(req: Request, res: Response, next: NextFunction): void {
        try {
            const manager = UserManager.instance;
            res.json(manager.getUser());
        } catch (error) {
            next(error);
        }
    }
}
