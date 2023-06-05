import { Router } from 'express';
import teacher from './teacher';
import classroom from './classroom';
import student from './student';

const routes = Router();

routes.use('/teacher', teacher);
routes.use('/classroom', classroom);
routes.use('/student', student);

export default routes;
