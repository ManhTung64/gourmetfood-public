import { IsNotEmpty, IsOptional, Length, MinLength, minLength } from "class-validator";
import { IUser } from "../../user/user.model";

export class SearchResult{
    users:SearchUser[]
    recipes:SearchRecipe[]
    articles:SearchArticle[]
    hashtags:SearchHashtag[]
    _id:string
}
abstract class Search{
    _id:string
    type:string
}
export class SearchUser extends Search{
    name:string
    avatar:string
}
export class SearchRecipe extends Search{
    name:string
    image:string
    category:string
}
export class SearchArticle extends Search{
    name:string
    content:string
    timeUpload:Date
}
export class SearchHashtag extends Search{
    hashtag:string
    name:string
    content:string
}
export class HistorySearch{
    keyword:string
    time:Date
    _id:string
}
export class GetHistorySearch{
    history:HistorySearch[]
    trend:TrendSearch[]
    hashtag:TrendSearch[]
    _id:string
}
export class TrendSearch{
    keyword:string
    count:number
}
export class InputSearch{
    @IsNotEmpty()
    @MinLength(1)
    keyword:string
    @IsNotEmpty()
    isEnd:boolean
    @IsNotEmpty()
    _id:string
    @IsNotEmpty()
    isHashtag:boolean
}
export class InputGetHistory{
    @IsNotEmpty()
    _id:string
}
