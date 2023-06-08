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

  static getAcademicTranscriptByIdClassRoom = async (
    req: Request,
    res: Response
  ) => {
    const idClass = parseInt(req.params.idClass);
    const queryRunner = AppDataSource.manager;
    const academictranscript = await queryRunner.query(
      'SELECT tbl_class_students.id, tbl_classrooms.id AS classroom_id,tbl_students.id AS student_id, tbl_students.name AS student_name,tbl_class_students.regularScore1 AS regular_score_1,tbl_class_students.regularScore2  AS regular_score_2,tbl_class_students.regularScore3 AS  regular_score_3,tbl_class_students.midtermScore AS  midterm_score,tbl_class_students.finalScore  AS  final_score, tbl_class_students.semester  FROM tbl_class_students INNER JOIN tbl_students  ON tbl_class_students.student_id = tbl_students.id INNER JOIN tbl_classrooms  ON tbl_class_students.classroom_id = tbl_classrooms.id  WHERE tbl_classrooms.id = "' +
        idClass +
        '"'
    );
    if (academictranscript.length === 0) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Lớp học không tồn tại !'
      });
    } else {
      res.status(200).send({ error: false, data: academictranscript });
    }
  };

  
}
export default ClassroomController;
