import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Service } from '../../../base/base.service';
import { CategoryRepository } from './category.repository';
import { Category } from './category.model';
import { ConstValue } from '../../otherModule/shared/defaultValues';
import S3 from '../../otherModule/shared/s3.service';
import { UploadFile } from '../file/dto/file.dto';
import { BaseCategory, CategoryWithId } from './dto/category.dto';

@Injectable()
export class CategoryService extends Service{
    constructor(private readonly repository:CategoryRepository, private readonly value:ConstValue, private readonly s3:S3){
        super()
    }
    public getAll = async():Promise<Array<Category> | null>=>{
        try{
            return await this.repository.getAll()
        }catch(error){
            console.log(error)
            return null
        }
    }
    public addNewCategory = async(category:BaseCategory):Promise<Category | null>=>{
        try{
            if(!category.name || !category.image) throw new HttpException("Missing information", HttpStatus.BAD_REQUEST)
            return await this.repository.addNew(category)
        }catch(error){
            console.log(error)
            return null
        }
    }
    public uploadImage = async(file:UploadFile):Promise<string>=>{
        try{
            if(!file) throw new HttpException("Missing information", HttpStatus.BAD_REQUEST)
            return await this.s3.UploadOneFile(file)
        }catch(error){
            console.log(error)
            return ''
        }
    }
    public checkExisted = async(name:string,isUpdate:boolean):Promise<boolean>=>{
        try{
            const category:Category | null = await this.repository.findCategoryByName(name)
            if(!category) return this.value.NotExisted()
            else return (isUpdate == true)|| isUpdate == false  ? this.value.Existed() : this.value.NotExisted()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
    public updateCategory = async(category:CategoryWithId):Promise<Category | null>=>{
        try{
            if(!category._id) throw new HttpException("Missing information",HttpStatus.BAD_REQUEST)
            const updateCategory:Category | null = await this.repository.updateCategoryById(category)
            return updateCategory
        }catch(error){
            console.log(error)
            return null
        }
    }
    public deleteCategory = async(_id:string):Promise<boolean>=>{
        try{
            if(!_id) throw new HttpException("Missing information",HttpStatus.BAD_REQUEST)
            else if (!await this.repository.findById(_id)) throw new HttpException("Category is not existed",HttpStatus.BAD_REQUEST)
            if(await this.repository.delete(_id)) return this.value.Success()
            else return this.value.Fail()
        }catch(error){
            console.log(error)
            return this.value.Fail()
        }
    }
}
