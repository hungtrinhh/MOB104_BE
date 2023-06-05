import { Router } from 'express';
import auth from './auth';
import student from './student';

const routes = Router();

routes.use('/auth', auth);
routes.use('/student', student);

export default routes;
