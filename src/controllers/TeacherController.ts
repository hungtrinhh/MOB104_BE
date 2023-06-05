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

  
}

export default TeacherController;
