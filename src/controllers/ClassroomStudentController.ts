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

  static getAllInformationParentAndStudent = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const idClass = parseInt(req.params.idClass);
    const queryRunner = AppDataSource.manager;
    const getAllInformation = await queryRunner.query(
      'SELECT tbl_students.name AS student_name ,tbl_students.dob AS student_dob ,tbl_students.gender AS student_gender,tbl_class_students.regularScore1 AS regular_score_1,tbl_class_students.regularScore2 AS regular_score_2 ,tbl_class_students.regularScore3 AS regular_score_3,tbl_class_students.midtermScore AS midterm_score,tbl_class_students.finalScore AS final_score, tbl_class_students.semester,tbl_parents.name AS parent_name ,tbl_parents.email AS parent_email,tbl_parents.dob AS parent_dob,tbl_parents.phone AS parent_phone,tbl_parents.fcmToken AS parent_fcmtoken FROM tbl_class_students INNER JOIN tbl_students  ON tbl_class_students.student_id = tbl_students.id INNER JOIN tbl_classrooms  ON tbl_class_students.classroom_id = tbl_classrooms.id INNER JOIN tbl_parents ON tbl_parents.id = tbl_students.parent_id   WHERE tbl_students.id = "' +
        id +
        '" AND tbl_classrooms.id = "' +
        idClass +
        '"'
    );
    if (getAllInformation.length === 0) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Học sinh không tồn tại !'
      });
    } else {
      res.status(200).send({ error: false, data: getAllInformation });
    }
  };

  static deleteStudentInClassUser = async (req: Request, res: Response) => {
    const idStudent = req.params.idStudent;
    const idClassRoom = parseInt(req.params.idClass);
    const queryRunner = AppDataSource.manager;
    const deleteClassStudent = await queryRunner.query(
      'DELETE FROM tbl_class_students  WHERE tbl_class_students.student_id = "' +
        idStudent +
        '" AND tbl_class_students.classroom_id = "' +
        idClassRoom +
        '"'
    );
    if (deleteClassStudent.length === 0) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Học sinh hoặc lớp không tồn tại'
      });
    } else {
      res.status(204).send({ error: false, data: deleteClassStudent });
    }
  };

  static newClassStudent = async (req: Request, res: Response) => {
    const {
      classroom_Id,
      student_Id,
      regularScore1,
      regularScore2,
      regularScore3,
      midtermScore,
      finalScore,
      semester
    } = req.body;
    const classStudent = new ClassStudent();
    classStudent.classroomId = classroom_Id;
    classStudent.studentId = student_Id;
    classStudent.regularScore1 = regularScore1;
    classStudent.regularScore2 = regularScore2;
    classStudent.regularScore3 = regularScore3;
    classStudent.midtermScore = midtermScore;
    classStudent.finalScore = finalScore;
    classStudent.semester = semester;

    const errors = await validate(ClassStudent);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    const classStudentRepository = AppDataSource.getRepository(ClassStudent);
    try {
      await classStudentRepository.save(classStudent);
    } catch (e) {
      console.log(e);
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Server error'
      });
      return;
    }
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Tạo thành công!'
    });
  };

 
}
export default ClassroomController;
