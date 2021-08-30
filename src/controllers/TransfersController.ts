import { NextFunction, Request, Response, Router } from 'express';
export const TransfersController: Router = Router();

import transfersData from '../fixtures/transferData'


TransfersController.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json(transfersData);
    } catch (e) {
        next(e);
    }
});
