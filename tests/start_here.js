const { mainModule } = require("process")
const zenodo = require("../build/zenodo-lib.js")

async function main() {
    const about = await zenodo.about({})
    if (about.env != "sandbox") {
        console.log("Tests should be run in the sandbox.")
        process.exit(1)
    }
    /* {
        console.log("Implicit config.")
        const list = await zenodolib.list({ page: 1, size: 1 })
        console.log(JSON.stringify(list, null, 2))
    } 
    {
        console.log("config.json (1)")
        const list = await zenodolib.list({ config: 'configx.json' })
        console.log(JSON.stringify(list[0], null, 2))
    }
    */
    const access_token = "your api key / access token here"
    access_token_v1: {
        console.log("access_token")
        const list = await zenodo.list({ access_token: access_token })
        console.log(JSON.stringify(list[0], null, 2))
    }
    access_token_v3: {
        console.log("zenodo_access_token")
        const list = await zenodo.list({ zenodo_access_token: access_token })
        console.log(JSON.stringify(list[0], null, 2))
    }
    access_token_v2a: {
        console.log("config_json: { access_token }")
        const list = await zenodo.list({ config_json: { access_token: access_token } })
        console.log(JSON.stringify(list[0], null, 2))
    }
    access_token_v2b: {
        console.log("config_json: '{ access_token }'")
        const list = await zenodo.list({ config_json: `{ "access_token": "${access_token}" }` })
        console.log(JSON.stringify(list[0], null, 2))
    }
}

main()

