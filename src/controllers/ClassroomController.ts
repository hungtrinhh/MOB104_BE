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

  static listAll = async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let classroom = await queryRunner.manager.query('SELECT tbl_classrooms.name, tbl_classrooms.description, tbl_classrooms.subject, tbl_classrooms.teacher_id,COUNT(tbl_students.id) AS count FROM tbl_classrooms INNER JOIN tbl_class_students  ON tbl_class_students.classroom_id = tbl_classrooms.id INNER JOIN tbl_students ON tbl_class_students.student_id = tbl_students.id WHERE tbl_class_students.semester = 1 GROUP BY tbl_classrooms.id')
    res.status(200).send({ error: false, data: classroom });

  };
  
}
export default ClassroomController;
