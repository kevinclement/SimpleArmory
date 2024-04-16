import { getShowHiddenUpdated } from "../util/utils";

export default class Cache {
    constructor(region, realm, character) {
        this.region = region;
        this.realm = realm;
        this.character = character;
        this.cache = undefined;
        this.updated = undefined;
    }

    isValid(reg,rel,char) {
        // console.log(`## checking if cache is valid`);
        // console.log(`  region - old: '${this.region}' new: '${reg}' comp: ${this.region === reg}`);
        // console.log(`  realm - old: '${this.realm}' new: '${rel}' comp: ${this.realm === rel}`);
        // console.log(`  char - old: '${this.character}' new: '${char}' comp: ${this.character === char}`);
        // console.log(`## VALID: ${this.region === reg && this.realm === rel && this.character === char} ####`);
        var showHiddenUpdateDate = getShowHiddenUpdated();
        if(showHiddenUpdateDate && this.updated) {
            if(showHiddenUpdateDate > this.updated) {
                return false;
            }
        }

        return this.region === reg && this.realm === rel && this.character === char
    }

    update(region, realm, character, cache) {
        this.region = region;
        this.realm = realm;
        this.character = character;
        this.cache = cache;
        this.updated = Date.now();
    }
}