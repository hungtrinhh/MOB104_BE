import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { ClassStudent } from '../entity/ClassStudent';
import { Parent } from '../entity/Parent';
import { Student } from '../entity/Student';
interface parentObj {
  parent_id: string;
  parent_name: string;
  parent_phone: string;
}
interface studentObj {
  id: string;
  name: string;
  parent_id: any;
  parent_phone?: string;
  dob: string;
  gender: string;
}
interface studentScore {
  regular_score_1: number;
  regular_score_2: number;
  regular_score_3: number;
  midterm_score: number;
  final_score: number;
  semester: number;
}
interface studentDetail extends studentScore {
  id: number;
  classroom_id: any;
  student_id: any;
}
export class StudentController {
  static newStudent = async (req: Request, res: Response) => {
    const studentRepository = AppDataSource.getRepository(Student);
    const studentDetailRepository = AppDataSource.getRepository(ClassStudent);
    const studentList = await studentRepository.find();
    const { id, name, gender, dob, parent_id, classroom_id, scores } = req.body;
    const studentTemp = studentList.filter(item => {
      return name === item.name && dob === item.dob;
    });
    let student = new Student();
    if (studentTemp.length === 0) {
      student.id = id;
      student.name = name;
      student.dob = dob;
      student.gender = gender;
      student.parentId = parent_id;

      const errors = await validate(student);
      if (errors.length > 0) {
        res.status(400).send({
          error: true,
          code: 400,
          message: errors[0].constraints
        });
        return;
      }
    } else {
      student = studentTemp[0];
    }
    const studentDetailArr = [];
    for (let i = 1; i <= 2; i++) {
      const studentDetail = new ClassStudent();
      studentDetail.classroomId = classroom_id;
      studentDetail.studentId = student;
      studentDetail.semester = i;
      scores.forEach((s: studentScore) => {
        if (s.semester === i) {
          studentDetail.regularScore1 = s.regular_score_1;
          studentDetail.regularScore2 = s.regular_score_2;
          studentDetail.regularScore3 = s.regular_score_3;
          studentDetail.midtermScore = s.midterm_score;
          studentDetail.finalScore = s.final_score;
        }
      });
      studentDetailArr.push(studentDetail);
    }
    try {
      await studentRepository.save(student);
      await studentDetailRepository.save(studentDetailArr);
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

  static editStudent = async (req: Request, res: Response) => {
    const studentData: studentObj = req.body.student;
    const studentScore = req.body.scores;
    const studentDetailRepository = AppDataSource.getRepository(ClassStudent);
    const studentRepository = AppDataSource.getRepository(Student);
    const scoreUpdate = [];
    studentScore.forEach((item: studentDetail) => {
      const score = new ClassStudent();
      score.id = item.id;
      score.classroomId = item.classroom_id;
      score.studentId = item.student_id;
      score.regularScore1 = item.regular_score_1 ? item.regular_score_1 : null;
      score.regularScore2 = item.regular_score_2 ? item.regular_score_2 : null;
      score.regularScore3 = item.regular_score_3 ? item.regular_score_3 : null;
      score.midtermScore = item.midterm_score ? item.midterm_score : null;
      score.finalScore = item.final_score ? item.final_score : null;
      score.semester = item.semester;
      scoreUpdate.push(score);
    });
    let student: Student;
    try {
      student = await studentRepository.findOneOrFail({
        where: { id: studentData.id }
      });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Học sinh không tồn tại!'
      });
      return;
    }
    //Validate the new values on model
    student.name = studentData.name;
    student.dob = studentData.dob;
    student.gender = studentData.gender;
    student.parentId = studentData.parent_id;
    const errors = await validate(student);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }
    try {
      await studentRepository.save(student);
      await studentDetailRepository.save(scoreUpdate);
      res.status(204).send();
    } catch (e) {
      console.log(e);
      res.status(500).send({
        error: true,
        code: 500,
        message: 'Server error!'
      });
    }
  };

  static deleteStudent = async (req: Request, res: Response) => {
    const id = req.params.id;
    const studentRepository = AppDataSource.getRepository(Student);
    try {
      await studentRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin học sinh'
      });
      return;
    }
    studentRepository
      .delete(id)
      .then(() => {
        res.status(204).send();
      })
      .catch(e => {
        console.log(e);
        res.status(500).send({
          error: true,
          code: 500,
          message: 'Server error'
        });
      });
  };

  static getOneById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const classId = parseInt(req.params.classId);
    const studentRepository = AppDataSource.getRepository(Student);
    const studentDetailRepository = AppDataSource.getRepository(ClassStudent);
    const parentRepository = AppDataSource.getRepository(Parent);
    try {
      let student = await studentRepository
        .createQueryBuilder('student')
        .where('student.id = :id', { id })
        .loadAllRelationIds()
        .getOneOrFail();
      const parent = await parentRepository.findOneOrFail({
        where: { id: '' + student.parentId }
      });
      student = {
        ...student,
        parentId: parent
      };
      const scoreDetail = await studentDetailRepository.find({
        where: { studentId: { id }, classroomId: { id: classId } },
        loadRelationIds: true
      });
      res.status(200).send({
        error: false,
        data: { student, scores: scoreDetail }
      });
    } catch (error) {
      console.log(error);
      res.status(404).send({
        error: true,
        code: 404,
        message: 'Không tìm thấy thông tin học sinh'
      });
      return;
    }
  };

  
}

export default StudentController;
