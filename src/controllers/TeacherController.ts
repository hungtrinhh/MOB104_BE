import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { AppDataSource } from '../data-source';
import { Teacher } from '../entity/Teacher';

class TeacherController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    const teachers = await teacherRepository.find({
      select: ['id', 'name', 'phone', 'dob']
    });

    //Send the users object
    res.send(teachers);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: number = parseInt(req.params.id);
    //Get the user from database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    try {
      const user = await teacherRepository.findOneOrFail({
        where: { id: id },
        select: ['id', 'name', 'email', 'phone', 'dob']
      });
      res.send({ error: false, data: user });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy giáo viên!'
      });
    }
  };

  static getOneByEmail = async (req: Request, res: Response) => {
    //Get the ID from the url
    const email: string = req.params.email;
    //Get the user from database
    const teacherRepository = AppDataSource.getRepository(Teacher);
    try {
      const user = await teacherRepository.findOneOrFail({
        where: { email },
        select: ['id', 'name', 'email', 'phone', 'dob']
      });
      res.send({ error: false, data: user });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy giáo viên!'
      });
    }
  };

  
}

export default TeacherController;
