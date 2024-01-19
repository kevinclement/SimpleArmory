import fs from 'fs';

const IGNORE_MOUNT_ID = new Set(
    [ 
        7,8,12,13,15,22,28,35,43,70,123,145,206,222,225,238,251,273,
        274,308,333,334,335,462,484,485,776,934,935,936,1269,1270,1271,
        1272,1578,1605,1771,1786,1787,1788,1789,1796,1953,1954
    ]
)

// load our mount list and their mount list
const ourMountsRAW = JSON.parse(fs.readFileSync("../../static/data/mounts.json", "utf-8"));
const theirMountsRAW = JSON.parse(fs.readFileSync("./mount-index-blizzard.json", "utf-8"));

const ourMounts = {}
const theirMounts = {}

// put our mounts into a lookup hash
ourMountsRAW.forEach((category) => {
    // console.log(category.name)

    category.subcats.forEach((subCategory) => {
        // console.log(subCategory.name)
        
        subCategory.items.forEach((item) => {
            let id = item.ID;
            let name = item.name;

            // console.log(`${id}: ${name}`)
            ourMounts[id] = item;
        });
    })
})

theirMountsRAW.mounts.forEach((mount) => {
    let id = mount.id;
    // console.log(`${mount.id}: ${mount.name}`)
    theirMounts[id] = mount;
});


// loop over our mounts and check if they are in blizzard
Object.keys(ourMounts).forEach(function(key) {
    //console.log(`${key}`);
    if (!(key in theirMounts)) {
        console.log(`WARN: Blizzard is missing our mount ${key}: ${ourMounts[key].name}`)
    }
});

// loop over their mounts and see if they are in our db
Object.keys(theirMounts).forEach(function(key) {
    //console.log(`${key}`);
    if (!(key in ourMounts) && !(IGNORE_MOUNT_ID.has(parseInt(key)))) {
        console.log(`WARN: Our DB is missing mount ${key}: ${theirMounts[key].name}`)
    }
});