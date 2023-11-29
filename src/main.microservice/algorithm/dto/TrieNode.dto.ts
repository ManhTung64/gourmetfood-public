import { Unit } from "./food.dto"

export class TrieNode {
    public children:any
    constructor() {
        this.children = new Map()
    }
}
export class FoodTrieNode extends TrieNode {
    public calo:number = null
    public units:Unit[] = []
    public category:string = ''
    constructor() {
        super()
        this.calo = null
    }
}
export abstract class Trie<T>{
    protected root
    public abstract insertElement(element:T)
    public abstract search(key:string)
}

export class BadWordNode extends TrieNode {
    public endWord:boolean
    public fullWord:string = null
    constructor(){
        super()
        this.endWord = false
    }
}