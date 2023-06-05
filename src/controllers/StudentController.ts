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

 
}

export default StudentController;
