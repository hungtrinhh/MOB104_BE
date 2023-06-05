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

  static newTeacher = async (req: Request, res: Response) => {
    //Get parameters from the body
    const { phone, password, name, email } = req.body;
    const teacher = new Teacher();
    teacher.phone = phone;
    teacher.password = password;
    teacher.name = name;
    teacher.email = email;

    //Validade if the parameters are ok
    const errors = await validate(teacher);
    if (errors.length > 0) {
      res.status(400).send({
        error: true,
        code: 400,
        message: errors[0].constraints
      });
      return;
    }

    //Hash the password, to securely store on DB
    teacher.hashPassword();

    //Try to save. If fails, the username is already in use
    const teacherRepository = AppDataSource.getRepository(Teacher);
    try {
      await teacherRepository.save(teacher);
    } catch (e) {
      console.log(e);
      res.status(409).send({
        error: true,
        code: 409,
        message:
          'Email hoặc số điện thoại đã được đăng ký, vui lòng đăng nhập hoặc thử lại với thông tin khác!'
      });
      return;
    }
    //If all ok, send 201 response
    res.status(201).send({
      error: false,
      code: 201,
      message: 'Đăng ký thành công!'
    });
  };

  
}

export default TeacherController;
