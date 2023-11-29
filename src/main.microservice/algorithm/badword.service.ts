import { Injectable } from "@nestjs/common";
import { BadWordNode, Trie } from "./dto/TrieNode.dto";
import { BadWord } from "./dto/badword.dto";
import { readFile } from 'xlsx';
import { join, resolve } from 'path';

@Injectable()
export class BadWordService {
    public badword: BadWordTrie
    constructor() {
        this.badword = this.getBadWordFromFile()
    }
    private getBadWordFromFile(): BadWordTrie {
        const sheet = readFile(resolve(join(__dirname, '../../../../bad-words.xlsx'))).Sheets['bad-words']
        const badwordTrie: BadWordTrie = new BadWordTrie()
        for (let rowNum = 1; ; rowNum++) {
            const cellName = sheet['A' + rowNum]
            if (!cellName) break
            const name: string = cellName.v.toLowerCase()
            const newBadword: BadWord = { name: name }
            badwordTrie.insertElement(newBadword)
        }
        return badwordTrie
    }
    public addOneBadWord(name: string): boolean {
        try {
            this.badword.insertElement({ name: name })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    public addManyBadWord(words: Array<string>): boolean {
        try {
            words.map((word) => {
                this.badword.insertElement({ name: word })
            })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}
export class BadWordTrie extends Trie<BadWord>{
    private IS_END_WORD: boolean = true
    private SKIP_VALUE:boolean = true
    constructor() {
        super()
        this.root = new BadWordNode()
    }
    public override insertElement(badword: BadWord) {
        let node: BadWordNode = this.root;
        for (const char of badword.name) {
            if (!node.children.has(char)) {
                node.children.set(char, new BadWordNode())
            }
            node = node.children.get(char)
        }
        node.fullWord = badword.name
        node.endWord = this.IS_END_WORD
    }
    public override search(name: string) {
        try {
            name = name.replace(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\|\\/=]/g, ' ')
            let results: Array<string> = []
            let skip: boolean = !this.SKIP_VALUE
            let node: BadWordNode = this.root
            let i = 0
            for (const char of name) {
                if (skip){
                    if (char == ' ' && name[i + 1] != ' ') skip = !this.SKIP_VALUE
                }
                else if (!node.children.has(char)){
                    skip = true
                    node = this.root
                }else if (node.children.get(char).endWord == true && ((name[i + 1] == ' ') || (i == name.length - 1))){
                    results.push(node.children.get(char).fullWord)
                    node = this.root
                }
                else{
                    node = node.children.get(char)
                }
                i++
            }

            return results
        } catch (error) {
            console.log(error)
        }
    }
}
