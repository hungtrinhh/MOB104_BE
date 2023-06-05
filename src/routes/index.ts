import { Router } from 'express';
import classroom from './classroom';
const routes = Router();


routes.use('/classroom', classroom);


export default routes;
