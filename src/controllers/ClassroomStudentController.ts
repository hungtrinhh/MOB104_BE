import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { ClassStudent } from '../entity/ClassStudent';

class ClassroomController {
  static listAll = async (req: Request, res: Response) => {
    const classStudentRepository = AppDataSource.getRepository(ClassStudent);
    const classStudent = await classStudentRepository.find({
      select: [
        'id',
        'classroomId',
        'studentId',
        'regularScore1',
        'regularScore2',
        'regularScore3',
        'midtermScore',
        'finalScore',
        'semester'
      ]
    });
    res.status(200).send({ error: false, code: 200, data: classStudent });
  };

  
}
export default ClassroomController;
