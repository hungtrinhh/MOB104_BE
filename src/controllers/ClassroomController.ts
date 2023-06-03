import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Classroom } from '../entity/Classroom';

class ClassroomController {
  static newClassroom = async (req: Request, res: Response) => {
    let { name, description, subject, teacher_id } = req.body;
    let classroom = new Classroom();
    classroom.name = name;
    classroom.description = description;
    classroom.subject = subject;
    classroom.teacherId = teacher_id;

    const errors = await validate(classroom);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    const classRoomRepository = AppDataSource.getRepository(Classroom);
    try {
      await classRoomRepository.save(classroom);
    } catch (e) {
      console.log(e);
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Server error'
      });
      return;
    }
    //Try to save. If fails, the username is already in use
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Tạo thành công!'
    });
  };

  
}
export default ClassroomController;
