
async function getJsonDb(db) {
    const res = await fetch(`data/${db}.json`);
    return await res.json();
}

export { getJsonDb };