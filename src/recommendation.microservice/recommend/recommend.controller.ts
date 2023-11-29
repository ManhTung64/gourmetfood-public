import { Controller, Get, HttpStatus, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { AuthenticationGuard } from '../../main.microservice/auth/auth.guard';
import { Roles } from '../../main.microservice/auth/role.decorator';
import { RolesGuard } from '../../main.microservice/auth/role.guard';
import { RecipeService } from '../../main.microservice/recipe/recipe.service';
import { Role } from '../../main.microservice/user/dto/user.dto';
import { Message } from 'src/otherModule/message.dto';

@Controller('api/recommend')
export class RecommendController {
    constructor(@Inject('RECOMMEND_SERVICE') private readonly recommendService: ClientProxy,
        private readonly recipeService: RecipeService) {

    }
    @Get('getListRecommend')
    @UseGuards(AuthenticationGuard, RolesGuard)
    public async getListUserPackage(@Req() req: Request, @Res() res: Response) {
        try {
            this.recommendService.send({ cmd: 'recommend' }, { _id: req['user'].accountId }).subscribe(
                async (result: Message) => {
                    if (HttpStatus.OK == result.httpStatus) {
                        let listRecipeOfCategory = []
                        for (let i = 0; i < result.data.length; i++) {
                            listRecipeOfCategory[i] = (await this.recipeService.getAllRecipe(result.data[i].category)).slice(0, 20)
                        }
                        let randomIndexs = []
                        let resu = []
                        result.data.map((category,index)=>{
                            for(let i = 0; i < 2; i++){
                                do{
                                    var randomIndex = Math.floor(Math.random() * listRecipeOfCategory[index].length);
                                }while(randomIndexs.length > 0 && randomIndexs.find((random)=>{return randomIndex == random}))
                                resu.push(listRecipeOfCategory[index][randomIndex])
                            }
                        })
                        return res.status(result.httpStatus).json({ success: true, data: resu });
                    }else return res.status(HttpStatus.BAD_REQUEST).json({ success: false });
                },
                (error) => {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
                }
            );
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
        }

    }
}
