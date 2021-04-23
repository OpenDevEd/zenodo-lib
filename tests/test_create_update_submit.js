const { isAbsolute } = require("path")
const { mainModule } = require("process")
const zenodo = require("../build/zenodo-lib.js")

async function main() {
    const about = await zenodo.about({})
    if (about.env != "sandbox") {
        console.log("Tests should be run in the sandbox.")
        process.exit(1)
    }
    // This returns one record.
    let record = {}
    record = await zenodo.create({ title: "My test item." })
    //console.log("TEMPORARY=" + JSON.stringify(record, null, 2))
    // process.exit(1)
    const id = record.id
    //let [ state , submitted ] = [record.state, record.submitted]
    console.log(`id: ${id} (${record.state}, ${record.submitted}): ${record.title}`)
    // Strange issue with the API - the record isn't immediately available for querying - using 'strict' might help?
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // This might return more than one:
    record = (await zenodo.record({ id: id, strict: true }))[0]
    //console.log("main() returns")
    console.log(`id: ${id} (${record.state}, ${record.submitted}): ${record.title}`)
    record = await zenodo.update({ id: id, title: "Amended title", strict: true })
    console.log(`id: ${id} (${record.state}, ${record.submitted}): ${record.title}`)
    console.log('upload')
    // File upload.
    record = await zenodo.upload({ id: id, files: ["resources/a.txt", "resources/test.pdf"], strict: true})
    // Submit record
    console.log('publishing...')
    record = (await zenodo.record({ id: id, publish: true, strict: true }))[0]
    // ^^^ the record returned here is the record before final actions - should use the record returned by final actions.
    // await new Promise(resolve => setTimeout(resolve, 1000));
    record = (await zenodo.record({ id: id, strict: true }))[0]
    // The record is now published.
    console.log(`Published: id: ${id} (${record.state}, ${record.submitted}): ${record.title}`)
    // Working up to here ^^^
    // New version: Generating a new id from an old id:
    // record = (await zenodo.newVersion({ debug: true, verbose: true, id: [id], deletefiles: true, strict: true }))
    record = (await zenodo.newVersion({ id: [id], deletefiles: true, strict: true }))
    console.log("complete,")
    //console.log("TEMPORARY/main=" + JSON.stringify(record, null, 2))
    //console.log(`id: ${id} (${record.state}, ${record.submitted}): ${record.title}`)
}

main()

