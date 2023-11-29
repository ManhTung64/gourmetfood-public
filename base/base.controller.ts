import { Response } from "express"
import { Res, HttpStatus, Param, Body, Post, Put, Delete, Get } from '@nestjs/common';

export abstract class BaseController {
    constructor() { }
    // public async getAll (@Res() res: Response):Promise<any>{}
    // public async create(){}
    // public async update (req:Request,res:Response):Promise<any>{}
    // public async delete (req:Request,res:Response):Promise<any>{}
}

