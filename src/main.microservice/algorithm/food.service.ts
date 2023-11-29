import { readFile } from 'xlsx'
import { join, resolve } from 'path'
import { Injectable } from '@nestjs/common'
import { FoodTrieNode, Trie } from './dto/TrieNode.dto'
import { Food, Unit } from './dto/food.dto'

@Injectable()
export class FoodService {
    private food: FoodTrie
    private categories: string[] = []
    constructor() {
        this.food = this.getCaloFromFile()
    }
    public getFood():FoodTrie | null{
        if(this.food) return this.food
        else return null
    }
    public getCategories():string[] | null{
        if(this.categories) return this.categories
        else return null
    }
    public getSearchFood(name:string):Food[]|null{
        if(this.food) return this.food.search(name)
        else return null
    }
    private getCaloFromFile(): FoodTrie {
        const sheet = readFile(resolve(join(__dirname, '../../../../food.xlsx'))).Sheets['ABBREV']
        const caloTrie: FoodTrie = new FoodTrie()
        for (let rowNum = 2; ; rowNum++) {
            // get base information
            const cellTotalName = sheet['C' + rowNum]
            const cellCalo = sheet['E' + rowNum]

            const cellUnit1 = sheet['AX' + rowNum]
            const cellUnit1Des = sheet['AY' + rowNum]
            const cellUnit2 = sheet['AZ' + rowNum]
            const cellUnit2Des = sheet['BA' + rowNum]

            //nutrion
            const cellProtein = sheet['F' + rowNum]
            const cellCarbs = sheet['I' + rowNum]
            const cellFat = sheet['G' + rowNum]
            const cellSugar = sheet['K' + rowNum]
            const cellFiber = sheet['J' + rowNum]
            const cellSolium = sheet['Q' + rowNum]
            
            if (!cellTotalName || !cellCalo) break
            // set unit type each ingredient
            let unitType:any[] = [{unit:'grams',quantity:100}]
            if (cellUnit1 && cellUnit1Des) unitType.push({unit:cellUnit1Des.v,quantity:cellUnit1.v})
            if (cellUnit2 && cellUnit2Des) unitType.push({unit:cellUnit2Des.v,quantity:cellUnit2.v})
            // clean
            let totalName: string = cellTotalName.v
            totalName = totalName.toLowerCase().replace(/,/g, ' ')
            const totalNameSplit: string[] = totalName.split(' ')
            const category: string = totalNameSplit.shift()
            const name: string = totalNameSplit.join(' ')

            let units:Unit[] = []
            unitType.map((type,index)=>{
                let unit:Unit = {calo:0, protein:0, carbs:0, fat:0, sugar:0, fiber:0, sodium:0, unit:type.unit}
                if (cellCalo)    unit.calo    = parseFloat(cellCalo.v) / parseFloat(type.quantity)
                if (cellProtein) unit.protein = parseFloat(cellProtein.v) / parseFloat(type.quantity)
                if (cellCarbs)   unit.carbs   = parseFloat(cellCarbs.v) / parseFloat(type.quantity)
                if (cellFat)     unit.fat     = parseFloat(cellFat.v) / parseFloat(type.quantity)
                if (cellSugar)   unit.sugar   = parseFloat(cellSugar.v) / parseFloat(type.quantity)
                if (cellFiber)   unit.fiber   = parseFloat(cellFiber.v) / parseFloat(type.quantity)
                if (cellSolium)  unit.sodium  = parseFloat(cellSolium.v) / parseFloat(type.quantity) / 1000 //convert to grams
                units[index] = unit
            })
            //add new
            const newFood: Food = { category: category, name: category + ' ' + name, units: units }
            this.insertCategory(category)
            caloTrie.insertElement(newFood)
        }
        return caloTrie
    }
    private insertCategory = (category: string) => {
        try {
            let insert: boolean = true
            if (this.categories == null) {
                this.categories[0] = category
                return
            }
            for (let i = 0; i < this.categories.length; i++) {
                if (category == this.categories[i]) insert = false
            }
            if (insert) this.categories.push(category)
        } catch (error) {
            console.log(error)
        }
    }
}
export class FoodTrie extends Trie<Food>{
    constructor() {
        super()
        this.root = new FoodTrieNode()
    }
    public override insertElement(food: Food) {
        let node = this.root;
        for (const char of food.name) {
            if (!node.children.has(char)) {
                node.children.set(char, new FoodTrieNode())
            }
            node = node.children.get(char)
        }
        node.category = food.category
        node.units = food.units
    }
    public override search(name: string) {
        const results: Food[] = []
        const searchRecursive = (node: FoodTrieNode, currentName: string) => {
            if (node.units.length > 0) results.push({ category: node.category, name: currentName, units: node.units })

            for (const [char, childNode] of node.children.entries()) {
                searchRecursive(childNode, currentName + char)
            }
        }
        let node = this.root
        for (const char of name) {
            if (!node.children.has(char)) return null
            node = node.children.get(char)
        }

        searchRecursive(node, name)

        return results
    }
}
