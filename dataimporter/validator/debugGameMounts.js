import fs from 'fs';

// load our mount list and their mount list
const inGameCollectedRAW = JSON.parse(fs.readFileSync("./mounts-in-game.json", "utf-8"));
const inSimpleArmoryRAW = JSON.parse(fs.readFileSync("./mounts-in-sa-marko-merged.json", "utf-8"));

const saMounts = {}
const gameMounts = {}
let inGameCount = 0;
let saMountCountAll = 0;
let saMountCountCollected = 0;

// Create quick lookup for simple armory collection
inSimpleArmoryRAW.categories.forEach((category) => {
    // console.log(category.name)

    category.subCategories.forEach((subCategory) => {
        // console.log(subCategory.name)
        
        subCategory.items.forEach((item) => {
            let id = item.ID;
            let name = item.name;

            // console.log(`${id}: ${name}`)
            if (item.collected) {
                saMounts[id] = item;
                saMountCountCollected++;
            }
            saMountCountAll++;
        });
    })
})

let foundDiff = 0
inGameCollectedRAW.forEach((mount) => {
    // console.log(`game: ${mount.id} ${mount.name}`)
    gameMounts[mount.id] = mount
    inGameCount++;

    if (!(mount.id in saMounts)) {
        console.log(`FOUND MISSING: ${mount.id}: ${mount.name}`)
        foundDiff++
    }
});

console.log()
console.log(`Game Total:         ${inGameCount}`);
console.log(`SimpleArmory Total: ${saMountCountCollected}`);
console.log(`Found Diff:         ${foundDiff}`)

// const ourMounts = {}
// const theirMounts = {}

// // put our mounts into a lookup hash
// ourMountsRAW.forEach((category) => {
//     // console.log(category.name)

//     category.subcats.forEach((subCategory) => {
//         // console.log(subCategory.name)
        
//         subCategory.items.forEach((item) => {
//             let id = item.ID;
//             let name = item.name;

//             // console.log(`${id}: ${name}`)
//             ourMounts[id] = item;
//         });
//     })
// })

// theirMountsRAW.mounts.forEach((mount) => {
//     let id = mount.id;
//     // console.log(`${mount.id}: ${mount.name}`)
//     theirMounts[id] = mount;
// });


// // loop over our mounts and check if they are in blizzard
// Object.keys(ourMounts).forEach(function(key) {
//     //console.log(`${key}`);
//     if (!(key in theirMounts)) {
//         console.log(`WARN: Blizzard is missing our mount ${key}: ${ourMounts[key].name}`)
//     }
// });

// // loop over their mounts and see if they are in our db
// Object.keys(theirMounts).forEach(function(key) {
//     //console.log(`${key}`);
//     if (!(key in ourMounts) && !(IGNORE_MOUNT_ID.has(parseInt(key)))) {
//         console.log(`WARN: Our DB is missing mount ${key}: ${theirMounts[key].name}`)
//     }
// });