"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myverbose = exports.mydebug = exports.updateMetadata = exports.parseIds = exports.dumpJSON = exports.showDepositionJSON = exports.parseId = exports.loadConfig = void 0;
const fs = __importStar(require("fs"));
const FALLBACK_CONFIG_FILE = (process.env.HOME + "/.config/zenodo-cli/config.json");
function loadConfig(configFile) {
    //console.log("load file checking ...")
    if (fs.statSync(FALLBACK_CONFIG_FILE).isFile()) {
        configFile = FALLBACK_CONFIG_FILE;
    }
    else {
        console.log(`Config file not present at config.json or ${FALLBACK_CONFIG_FILE}`);
        process.exit(1);
    }
    const content = fs.readFileSync(configFile, "utf8");
    const config = JSON.parse(content);
    const params = { "access_token": config["accessToken"] };
    let zenodoAPIUrl = "";
    if ((config["env"] === "sandbox")) {
        zenodoAPIUrl = "https://sandbox.zenodo.org/api/deposit/depositions";
    }
    else {
        zenodoAPIUrl = "https://zenodo.org/api/deposit/depositions";
    }
    return { params, zenodoAPIUrl };
}
exports.loadConfig = loadConfig;
// TODO
function parseId(id) {
    var dot_split, slash_split;
    if (!(isNaN(id.toString()))) {
        return id;
    }
    slash_split = id.toString().split("/").slice((-1))[0];
    if (!(isNaN(slash_split))) {
        id = slash_split;
    }
    else {
        dot_split = id.toString().split(".").slice((-1))[0];
        if (!(isNaN(dot_split))) {
            id = dot_split;
        }
    }
    return id;
}
exports.parseId = parseId;
function showDepositionJSON(info) {
    console.log(`Title: ${info["title"]}`);
    if ("publication_date" in info["metadata"]) {
        console.log(`Date: ${info["metadata"]["publication_date"]}`);
    }
    else {
        console.log("Date: N/A");
    }
    console.log(`RecordId: ${info["id"]}`);
    if ("conceptrecid" in info) {
        console.log(`ConceptId: ${info["conceptrecid"]}`);
    }
    else {
        console.log("ConceptId: N/A");
    }
    console.log(`DOI: ${info["metadata"]["prereserve_doi"]["doi"]}`);
    console.log(`Published: ${info["submitted"] ? "yes" : "no"}`);
    console.log(`State: ${info["state"]}`);
    console.log(`URL: https://zenodo.org/${info["submitted"] ? "record" : "deposit"}/${info["id"]}`);
    if ("bucket" in info["links"]) {
        console.log(`BucketURL: ${info["links"]["bucket"]}`);
    }
    else {
        console.log("BucketURL: N/A");
    }
    console.log("\n");
}
exports.showDepositionJSON = showDepositionJSON;
function dumpJSON(info) {
    console.log(info);
    console.log("\n");
}
exports.dumpJSON = dumpJSON;
function parseIds(genericIds) {
    let ids = [];
    if (Array.isArray(genericIds)) {
        genericIds.forEach(id => {
            ids.push(parseId(id));
        });
    }
    else {
        ids.push(parseId(genericIds));
    }
    return ids;
}
exports.parseIds = parseIds;
function updateMetadata(args, metadata) {
    /*
    The object 'metadata' is updated with fields from 'args' and returned.
    */
    if (args.help) {
        const help = {
            args: {
                json: "file with a json record",
                title: "string",
                date: "date string",
                description: "string",
                authordata: "file with authordata",
                authors: "first last; first last; first last",
                communities: "file to communities",
                zotero_link: "string (zotero://...)"
            },
            metadata: {
                title: "title of zenodo record etc"
            }
        };
        console.log(JSON.stringify(help));
        return 0;
    }
    if (!metadata) {
        console.log(`Error in code: metadata is undefined.`);
        process.exit(1);
    }
    // This function takes an existing object (metadata) and applies changes indicated by args.
    console.log("Updating metadata");
    let authorInformationDict, authorInfo;
    let authorProvided = false;
    authorInformationDict = {};
    // If the --json/args.json argument is given, load the file, and overwrite metadata accordingly.
    if (("json" in args && args.json)) {
        if (fs.existsSync(args.json)) {
            const contents = fs.readFileSync(args.json, 'utf-8');
            let metaIn = {};
            try {
                metaIn = JSON.parse(contents);
            }
            catch (e) {
                console.log(`Invalid json: ${contents}`);
                process.exit(1);
            }
            Object.keys(metaIn).forEach(function (key) {
                metadata[key] = metaIn[key];
            });
            if (Object.keys(metaIn).indexOf("creators") != -1) {
                authorProvided = true;
            }
        }
        else {
            console.log(`File does not exist: ${args.json}`);
            process.exit(1);
        }
    }
    // Process authors
    // Step 1. Read author information from file
    if (("authordata" in args && args.authordata)) {
        if (fs.existsSync(args.authordata)) {
            const authFile = fs.readFileSync(args.authordata, 'utf-8');
            let authorData = authFile.split(/\n/);
            authorData.forEach(line => {
                if (line) {
                    //console.log(`line: ${line}`)
                    authorInfo = line.split("\t");
                    if (authorInfo.length >= 1) {
                        authorInformationDict[authorInfo[0]] = { "name": authorInfo[0] };
                    }
                    if (authorInfo.length >= 2) {
                        authorInformationDict[authorInfo[0]] = { "name": authorInfo[0], "affiliation": authorInfo[1] };
                    }
                    if (authorInfo.length >= 3) {
                        authorInformationDict[authorInfo[0]] = { "name": authorInfo[0], "affiliation": authorInfo[1], "orcid": authorInfo[2] };
                    }
                    //console.log(JSON.stringify(authorInformationDict))
                }
            });
        }
        else {
            console.log(`Error, authordata file missing ${args.authordata}`);
            process.exit(1);
        }
    }
    // Step 2. Collect authors
    if ("authors" in args && args.authors) {
        let creatorsNew = [];
        if ("creators" in metadata) {
            if (authorProvided) {
                creatorsNew = metadata["creators"];
            }
            let auth_arr;
            if (Array.isArray(args.authors)) {
                auth_arr = args.authors;
            }
            else {
                auth_arr = [args.authors];
            }
            try {
                auth_arr.forEach(creator => {
                    const entry = creator.split(/ *; */);
                    let newentry = {};
                    // TODO
                    // This should result in an error:
                    // npm start -- create --authors
                    if (entry[0] == "") {
                        console.log("Error: The author provided with --authors was blank. You need to provide at least one author.");
                        process.exit(1);
                    }
                    newentry["name"] = entry[0];
                    if (entry.length >= 2 && entry[1] != "") {
                        newentry["affiliation"] = entry[1];
                    }
                    else if ("affiliation" in authorInformationDict[entry[0]]) {
                        console.log("Do we get here?");
                        // Excercise left to the developer: Why do we not need to write && "affliation" in authorInformationDict[entry[0]] ?
                        newentry = authorInformationDict[entry[0]];
                    }
                    if (entry.length >= 3) {
                        newentry["orcid"] = entry[2];
                    }
                    else if (authorInformationDict[entry[0]] && "orcid" in authorInformationDict[entry[0]]) {
                        newentry["orcid"] = authorInformationDict[entry[0]]["orcid"];
                    }
                    creatorsNew.push(newentry);
                });
            }
            catch (e) {
                console.log("Error in authors setting inside zenodo-lib - authors will have missing data.");
            }
            metadata["creators"] = creatorsNew;
        }
    }
    //console.log(`Step 1. ${metadata}`);
    //console.log(typeof metadata)
    if ("title" in args && args.title) {
        metadata["title"] = args.title;
    }
    if (("date" in args && args.date)) {
        metadata["publication_date"] = args.date;
    }
    if (("description" in args && args.description)) {
        metadata["description"] = args.description;
    }
    // Handle communities. Communities identifiers are added to the communitiesArray.
    let communitiesArray = [];
    // Step 1. Get the original communities
    //let dataIn = {metadata};
    //console.log(`DataIn: ${dataIn}`);
    if (Object.keys(metadata).indexOf("communities") !== -1) {
        let metadataCommunities = metadata["communities"];
        metadataCommunities.forEach(thisCommunity => {
            communitiesArray.push(thisCommunity["identifier"]);
        });
    }
    // Step 2. Add communities specified with --add-communities
    if (("add_communities" in args && args.add_communities)) {
        args.add_communities.forEach(community => {
            communitiesArray.push(community);
        });
    }
    // Step 3. Read communities from file, via --communities file.txt
    if (("communities" in args && args.communities)) {
        if (fs.existsSync(args.communities)) {
            const comm = fs.readFileSync(args.communities, 'utf-8');
            console.log(comm);
            communitiesArray = communitiesArray.concat(comm.split(/\cM?\n/));
        }
        else {
            console.log(`Did not find file ${args.communities}`);
            process.exit(1);
        }
    }
    // Step 4. Add communities back to metadata, unless the community has been listed with --remove-communities
    let communitiesArrayFinal = [];
    // Make communitiesArray unique:
    communitiesArray = [...new Set(communitiesArray)];
    communitiesArray.forEach(community => {
        if (!("remove_communities" in args && (args.remove_communities) && (args.remove_communities.indexOf(community) !== -1))
            && community !== "") {
            communitiesArrayFinal.push({ "identifier": community });
        }
    });
    metadata["communities"] = communitiesArrayFinal;
    // Done with communities
    if (("zotero_link" in args && args.zotero_link)) {
        metadata["related_identifiers"] = [{
                "identifier": args.zotero_link,
                "relation": "isAlternateIdentifier",
                "resource_type": "other",
                "scheme": "url"
            }];
    }
    // console.log(JSON.stringify(metadata))
    return metadata;
}
exports.updateMetadata = updateMetadata;
function mydebug(args, msg, data) {
    if (args &&
        (("debug" in args && args.debug))) {
        console.log('DEBUG: ' + msg);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
}
exports.mydebug = mydebug;
function myverbose(args, msg, data) {
    if (args &&
        (("verbose" in args && args.verbose)
            ||
                ("debug" in args && args.debug))) {
        console.log('VERBOSE: ' + msg);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
}
exports.myverbose = myverbose;
//# sourceMappingURL=helper.js.map