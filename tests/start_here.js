const { mainModule } = require("process")
const zenodolib = require("../build/zenodo-lib.js")

async function main() {
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
    const access_token = "6JciD0YQavXuXd2RGjmto4C7oToln6QYn8poOOB34urPIViyvA35waVXsQuQ"
    access_token_v1: {
        console.log("access_token")
        const list = await zenodolib.list({ access_token: access_token })
        console.log(JSON.stringify(list[0], null, 2))
    }
    access_token_v3: {
        console.log("zenodo_access_token")
        const list = await zenodolib.list({ zenodo_access_token: access_token })
        console.log(JSON.stringify(list[0], null, 2))
    }
    access_token_v2a: {
        console.log("config_json: { access_token }")
        const list = await zenodolib.list({ config_json: { access_token: access_token } })
        console.log(JSON.stringify(list[0], null, 2))
    }
    access_token_v2b: {
        console.log("config_json: '{ access_token }'")
        const list = await zenodolib.list({ config_json: `{ "access_token": "${access_token}" }` })
        console.log(JSON.stringify(list[0], null, 2))
    }
}

main()

