import { Injectable } from "@nestjs/common";
import { UserRepository } from "../user/user.repository";
import { RecipeRepository } from "../recipe/recipe.repository";
import { IUser } from "../user/user.model";
import { IRecipe } from "../recipe/recipe.model";
import { GetHistorySearch, HistorySearch, InputSearch, SearchResult } from "./dto/search.dto";
import { ArticleRepository } from "../article/article.repository";
import { IArticle } from "../article/article.model";

@Injectable()
export class SearchService {
    private listSearch:HistorySearch[] = []
    private listUsers: IUser[] 
    private listRecipes: IRecipe[] 
    private listArticles: IArticle[] 
    constructor(private readonly userRepository: UserRepository, private readonly recipeRepository: RecipeRepository,
        private readonly articleRepository: ArticleRepository) {
        this.updateData()
    }
    private updateData = ()=>{
        try{
            this.listUsers = this.userRepository.getAll()
            this.listRecipes = this.recipeRepository.getAll()
            this.listArticles = this.articleRepository.getAll()
        }catch(error){
            console.log(error)
            return null
        }
    }
    public getListSearch = (_id:string):GetHistorySearch=>{
        try{
            let results:GetHistorySearch = {trend:[],history:[],_id:_id,hashtag:[]}
            if (this.getListSearch.length == 0)return null
            let listKeyword = this.listSearch.filter((keyword)=>{return (keyword.keyword.charAt(0) !== '#' && new Date().getDate() - keyword.time.getDate() <= 7) })
            listKeyword.map((keyword)=>{
                if (results.trend.length == 0) results.trend.push({keyword:keyword.keyword, count:1})
                else {
                    for (let i = 0; i < results.trend.length; i++){
                        if (results.trend[i].keyword == keyword.keyword){
                            results.trend[i].count += 1
                            break;
                        } 
                    }
                }
            })
            results.trend = results.trend.sort((a,b)=>b.count - a.count)
            let listHashtag = this.listSearch.filter((keyword)=>{return (keyword.keyword.charAt(0) === '#' && new Date().getDate() - keyword.time.getDate() <= 7) })
            listHashtag.map((keyword)=>{
                if (results.hashtag.length == 0) results.hashtag.push({keyword:keyword.keyword, count:1})
                else {
                    for (let i = 0; i < results.hashtag.length; i++){
                        if (results.hashtag[i].keyword == keyword.keyword){
                            results.hashtag[i].count += 1
                            break;
                        } 
                    }
                }
            })
            results.hashtag = results.hashtag.sort((a,b)=>b.count - a.count)
            if (_id.length == 24) results.history = this.listSearch.filter((keyword)=>{return keyword._id == _id})
            return results
        }catch(error){
            console.log(error)
            return null
        }
    }
    public search = (data:InputSearch): SearchResult => {
        try {
            this.updateData()
            if (data.isEnd == true && data._id.length == 24) this.listSearch.unshift({keyword:data.keyword,time:new Date(),_id:data._id})
            let results: SearchResult = {users:[],recipes:[],articles:[],hashtags:[],_id:data._id}
            this.listUsers.map((user: IUser) => {
                if (user.name.includes(data.keyword.toLowerCase())) results.users.push({
                    _id: user._id.toString(),
                    name: user.name,
                    type: "user",
                    avatar: user.avatar
                })
            })
            this.listRecipes.map((recipe: IRecipe) => {
                if (recipe.name.includes(data.keyword.toLowerCase())) results.recipes.push({
                    _id: recipe._id.toString(),
                    name: recipe.name,
                    type: "recipe",
                    image: recipe.image,
                    category: recipe.Category.toString()
                })
            })
            this.listArticles.map((article: IArticle) => {
                if (article.title.includes(data.keyword.toLowerCase()) || article.content.includes(data.keyword.toLowerCase())) results.articles.push({
                    _id: article._id.toString(),
                    name: article.title,
                    type: "article",
                    content: article.content,
                    timeUpload: article.timeUpload
                })
            })
            return results
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public searchHashtag = (data:InputSearch):SearchResult => {
        try {
            this.updateData()
            if (data.isEnd == true && data._id.length == 24) this.listSearch.unshift({keyword:data.keyword,time:new Date(),_id:data._id})
            let results:SearchResult = {users:[],recipes:[],articles:[],hashtags:[],_id:data._id}
            this.listArticles.map((article)=>{
                if (article.hashtag.length > 0){
                    if (article.hashtag.includes(data.keyword)) results.hashtags.push({
                        _id:article._id.toString(),
                        type:"hashtag",
                        name: article.title,
                        content: article.content,
                        hashtag:article.hashtag
                    })
                }
            })
            return results
        } catch (error) {
            console.log(error)
            return null
        }
    }
}