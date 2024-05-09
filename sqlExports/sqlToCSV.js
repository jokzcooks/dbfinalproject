// i exported from local mysql to ./sqlFiles, then to submit for grading, i wanted to reformat the files into csv.
// the string manipulation here is a bit elementary, but it works and doesn't necessarily need to be anything more than it is

const fs = require("fs/promises");
const path = require("path");

(async() => {
    var rawFiles = await fs.readdir(path.resolve(__dirname, "./sqlFiles"))
    rawFiles = [rawFiles[4]]
    rawFiles.forEach(async (fileName) => {

        const rawData = await fs.readFile(path.resolve(__dirname, "sqlFiles", fileName), 'utf8');

        var out = ""

        var names = rawData.split("CREATE TABLE")[1].split(";")[0].split("\n")
        names.shift()
        names.pop()
        names = names.map(n => n.trim()).filter(n => n.startsWith("`")).map(n => n.split("`")[1])
        out += names.join(",")

        out+= "\n"

        var tuples = rawData.split("VALUES ")[1].split(`UNLOCK TABLES;`)[0].split(";")
        tuples.pop()
        tuples.pop()
        tuples = tuples.join(";")
        var cleaned = tuples.split("),(")
        cleaned = cleaned.map(e => e.replace(/\(/gm, "")).map(e => e.replace(/\)/gm, "").split(",").map(e => e.replace(/'/gm, "")))
        out += cleaned.join("\n")

        await fs.writeFile(path.resolve(__dirname, "csvFiles", fileName.replace(".sql", ".csv")), out, 'utf8');
    })
})()