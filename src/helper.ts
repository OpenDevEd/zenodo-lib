import * as fs from 'fs';
import * as os from 'os';
import logger from './logger';

export function get_value(value) {
  if (Array.isArray(value)) {
    value = value[0];
  } else {
  }
  return value;
}

export function get_array(value) {
  let out = [];
  if (value) {
    if (!Array.isArray(value)) {
      out = [value];
    } else {
      out = value;
    }
  }
  return out;
}

export function loadConfig(args) {
  const config_keys = [
    'api-key',
    'env',
    'accessToken',
    'access-token',
    'sandbox',
  ];

  // Step 1. Read config files
  // const FALLBACK_CONFIG_FILE = (process.env.HOME + "/.config/zenodo-cli/config.json");
  //console.log("load file checking ...")
  /*
  let configFile =
    args.config ? args.config :
      args.zenodo_config ? args.zenodo_config :
        fs.statSync(FALLBACK_CONFIG_FILE).isFile() ? FALLBACK_CONFIG_FILE :
          fs.statSync("config.json").isFile() ? "config.json" :
            fs.statSync("zenodo-config.json").isFile() ? "zenodo-config.json" :
              fs.statSync("zenodo_config.json").isFile() ? "zenodo_config.json" :
                null
  */
  const configFile: string = [
    args.config,
    args.zenodo_config,
    'config.json',
    'zenodo-config.json',
    'zenodo_config.json',
    `${os.homedir()}/.config/zenodo-cli/config.json`,
  ].find((cfg) => fs.existsSync(cfg));

  /*
  if (args.config) {
    const config: string = [args.config, 'zotero-cli.toml', `${os.homedir()}/.config/zotero-cli/zotero-cli.toml`].find(cfg => fs.existsSync(cfg))
    this.config = config ? toml.parse(fs.readFileSync(config, 'utf-8')) : {}
  }
  */

  let config = {
    accessToken: '',
    env: '',
  };

  if (configFile) {
    if (args.verbose) console.log(`Config file: ${configFile}`);
    const content = fs.readFileSync(configFile, 'utf8');
    config = JSON.parse(content);
  }

  // STEP 2. Apply --config_json option
  if (args.config_json) {
    if (args.verbose) console.log(`Setting from config_json`);
    const confobj =
      typeof args.config_json == 'string'
        ? JSON.parse(args.config_json)
        : args.config_json;
    Object.keys(confobj).forEach((x) => {
      //console.log(`Setting: ${x}`)
      config[x] = confobj[x];
    });
  }

  // STEP 3. Canonical forms.
  // Change "-" to "_"
  config_keys.forEach((key) => {
    const key_zenodo = 'zenodo-' + key;
    const key_underscore = key.replace(/\-/g, '_');
    const key_zenodo_underscore = key_zenodo.replace(/\-/g, '_');
    /*
    api-key
    api_key
    zenodo-api-key
    zenodo_api_key
    --> api_key
    */
    // console.log(key_underscore+ " "+key_zenodo_underscore)
    if (key != key_underscore) {
      // Fix existing config
      if (config[key]) {
        config[key_underscore] = config[key];
        delete this.config[key];
      }
      // Fix existing arg
      if (args[key]) {
        args[key_underscore] = args[key];
        delete args[key];
      }
    } else {
      // Key is underscored already - nothing to do.
    }
    // Now we just have the underscore form of the key.
    // If there is a "zotero-" form, copy to "zotero_" form.
    if (args[key_zenodo]) {
      args[key_zenodo_underscore] = args[key_zenodo];
      delete args[key_zenodo];
    }
    // If there is a key_zotero_underscore, let it override key_underscore
    if (args[key_zenodo_underscore]) {
      args[key_underscore] = args[key_zenodo_underscore];
      // retain the key.
    }
    // finally, copy available value to config:
    if (args[key_underscore]) {
      args[key_underscore] = get_value(args[key_underscore]);
      config[key_underscore] = args[key_underscore];
    }
  });

  if (config['api_key']) {
    config.accessToken = config['api_key'];
    delete config['api_key'];
  }

  if (config['access_token']) {
    config.accessToken = config['access_token'];
    delete config['access_token'];
  }

  if (config['sandbox']) {
    config.env = 'sandbox';
    delete config['sandbox'];
  }

  if (!config['accessToken'] || config['accessToken'] == '') {
    console.log('Invalid config');
    process.exit(1);
  }

  const params = { access_token: config['accessToken'], env: config['env'] };

  let zenodoAPIUrl = '';
  if (config['env'] === 'sandbox') {
    zenodoAPIUrl = 'https://sandbox.zenodo.org/api/deposit/depositions';
  } else {
    zenodoAPIUrl = 'https://zenodo.org/api/deposit/depositions';
  }

  return { params, zenodoAPIUrl };
}

// TODO
export function parseId(id) {
  var dot_split, slash_split;
  if (!isNaN(id.toString())) {
    return id;
  }
  slash_split = id.toString().split('/').slice(-1)[0];
  if (!isNaN(slash_split)) {
    id = slash_split;
  } else {
    dot_split = id.toString().split('.').slice(-1)[0];
    if (!isNaN(dot_split)) {
      id = dot_split;
    }
  }
  return id;
}

export function showDepositionJSON(info) {
  console.log(`Title: ${info['title']}`);
  if ('publication_date' in info['metadata']) {
    console.log(`Date: ${info['metadata']['publication_date']}`);
  } else {
    console.log('Date: N/A');
  }
  console.log(`RecordId: ${info['id']}`);
  if ('conceptrecid' in info) {
    console.log(`ConceptId: ${info['conceptrecid']}`);
  } else {
    console.log('ConceptId: N/A');
  }
  console.log(`DOI: ${info['metadata']['prereserve_doi']['doi']}`);
  console.log(`Published: ${info['submitted'] ? 'yes' : 'no'}`);
  console.log(`State: ${info['state']}`);
  console.log(
    `URL: https://zenodo.org/${info['submitted'] ? 'record' : 'deposit'}/${info['id']
    }`,
  );
  if ('bucket' in info['links']) {
    console.log(`BucketURL: ${info['links']['bucket']}`);
  } else {
    console.log('BucketURL: N/A');
  }
  console.log('\n');
}

export function dumpJSON(info) {
  console.log(info);
  console.log('\n');
}

export function parseIds(genericIds) {
  let ids = [];
  if (Array.isArray(genericIds)) {
    genericIds.forEach((id) => {
      ids.push(parseId(id));
    });
  } else {
    ids.push(parseId(genericIds));
  }
  return ids;
}

export function updateMetadata(args, metadata) {
  /*
  The object 'metadata' is updated with fields from 'args' and returned.
  */
  //console.log("--------------------------------------------------------------------------")
  //console.log("updateMetadata TEMPORARY=" + JSON.stringify(args, null, 2))
  //console.log("updateMetadata TEMPORARY=" + JSON.stringify(metadata, null, 2))
  //console.log("--------------------------------------------------------------------------")
  if (args.help) {
    const help = {
      args: {
        json: 'file with a json record',
        title: 'string',
        date: 'date string',
        description: 'string',
        authordata: 'file with authordata',
        authors: 'first last; first last; first last',
        communities: 'file to communities',
        zotero_link: 'string (zotero://...)',
      },
      metadata: {
        title: 'title of zenodo record etc',
      },
    };
    console.log(JSON.stringify(help));
    return 0;
  }
  if (!metadata) {
    console.log(`Error in code: metadata is undefined.`);
    process.exit(1);
  }
  // This function takes an existing object (metadata) and applies changes indicated by args.
  if (args.verbose) console.log('Updating metadata');
  let authorInformationDict = {};
  let authorInfo;
  let authorProvided = false;
  authorInformationDict = {};
  // If the --json/args.json argument is given, load the file, and overwrite metadata accordingly.
  if ('json' in args && args.json) {
    if (fs.existsSync(args.json)) {
      const contents = fs.readFileSync(args.json, 'utf-8');
      let metaIn = {};
      try {
        metaIn = JSON.parse(contents);
      } catch (e) {
        console.log(`Invalid json: ${contents}`);
        process.exit(1);
      }
      Object.keys(metaIn).forEach(function (key) {
        metadata[key] = metaIn[key];
      });
      if (Object.keys(metaIn).indexOf('creators') != -1) {
        authorProvided = true;
      }
    } else {
      console.log(`File does not exist: ${args.json}`);
      process.exit(1);
    }
  }
  // Process authors
  // Step 1. Read author information from file
  if ('authordata' in args && args.authordata) {
    if (fs.existsSync(args.authordata)) {
      const authFile = fs.readFileSync(args.authordata, 'utf-8');
      let authorData = authFile.split(/\n/);
      authorData.forEach((line) => {
        if (line) {
          //console.log(`line: ${line}`)
          authorInfo = line.split('\t');
          if (authorInfo.length >= 1) {
            authorInformationDict[authorInfo[0]] = { name: authorInfo[0] };
          }
          if (authorInfo.length >= 2) {
            authorInformationDict[authorInfo[0]] = {
              name: authorInfo[0],
              affiliation: authorInfo[1],
            };
          }
          if (authorInfo.length >= 3) {
            authorInformationDict[authorInfo[0]] = {
              name: authorInfo[0],
              affiliation: authorInfo[1],
              orcid: authorInfo[2],
            };
          }
          //console.log(JSON.stringify(authorInformationDict))
        }
      });
    } else {
      console.log(`Error, authordata file missing ${args.authordata}`);
      process.exit(1);
    }
  }
  // Step 2. Collect authors
  if ('authors' in args && args.authors) {
    logger.info('args = %O', args);
    let creatorsNew = [];
    if ('creators' in metadata) {
      if (authorProvided) {
        creatorsNew = metadata['creators'];
      }

      let authorsArray;
      if (Array.isArray(args.authors)) {
        authorsArray = args.authors;
      } else {
        authorsArray = [args.authors];
      }

      try {
        authorsArray.forEach((creator) => {
          console.log('creator: ', creator);
          const name =
            typeof creator === 'string'
              ? creator
              : creator.name ||
              `${creator.firstName} ${creator.lastName};${creator.affiliation}`;
          const entry = name.split(/ *; */);
          let newentry = {};
          // TODO
          // This should result in an error:
          // npm start -- create --authors
          if (entry[0] == '') {
            console.log(
              'Error: The author provided with --authors was blank. You need to provide at least one author.',
            );
            process.exit(1);
          }
          newentry['name'] = entry[0];
          try {
            if (entry.length >= 2 && entry[1] != '') {
              newentry['affiliation'] = entry[1];
            } else if (
              'affiliation' in (authorInformationDict[entry[0]] || {})
            ) {
              console.log('Do we get here?');
              // Excercise left to the developer: Why do we not need to write && "affliation" in authorInformationDict[entry[0]] ?
              newentry = authorInformationDict[entry[0]];
            }
            if (entry.length >= 3) {
              newentry['orcid'] = entry[2];
            } else if (
              authorInformationDict[entry[0]] &&
              'orcid' in authorInformationDict[entry[0]]
            ) {
              newentry['orcid'] = authorInformationDict[entry[0]]['orcid'];
            }
          } catch (e) {
            console.log(
              'Error in author affiliations - data likely to be incomplete. ' +
              e,
            );
          }
          creatorsNew.push(newentry);
        });
      } catch (e) {
        console.log('Error in authors - data likely to be incomplete. ' + e);
      }
    }
    if (creatorsNew.length) {
      metadata.creators = creatorsNew;
    }
  }

  //console.log(`Step 1. ${metadata}`);
  //console.log(typeof metadata)

  if ('title' in args && args.title) {
    metadata['title'] = args.title;
  }
  if ('date' in args && args.date) {
    metadata['publication_date'] = args.date;
  }
  if ('publication_date' in args && args.publication_date) {
    metadata['publication_date'] = args.publication_date;
  }
  if ('description' in args && args.description) {
    metadata['description'] = args.description;
  }

  if (!('suppressDOI' in args) && !args.suppressDOI) {
    if ('doi' in args && args.doi) {
      metadata['doi'] = args.doi;
    }
  }

  // Handle communities. Communities identifiers are added to the communitiesArray.
  let communitiesArray = [];
  // Step 1. Get the original communities
  //let dataIn = {metadata};
  //console.log(`DataIn: ${dataIn}`);
  if (Object.keys(metadata).indexOf('communities') !== -1) {
    let metadataCommunities = metadata['communities'];
    metadataCommunities.forEach((thisCommunity) => {
      communitiesArray.push(thisCommunity['identifier']);
    });
  }
  // Step 2. Add communities specified with --add-communities
  if ('add_communities' in args && args.add_communities) {
    args.add_communities.forEach((community) => {
      communitiesArray.push(community);
    });
  }
  // Step 3. Read communities from file, via --communities file.txt
  if ('communities' in args && args.communities) {
    if (fs.existsSync(args.communities)) {
      const comm = fs.readFileSync(args.communities, 'utf-8');
      console.log(comm);
      communitiesArray = communitiesArray.concat(comm.split(/\cM?\n/));
    } else {
      console.log(`Did not find file ${args.communities}`);
      process.exit(1);
    }
  }
  // Step 4. Add communities back to metadata, unless the community has been listed with --remove-communities
  let communitiesArrayFinal = [];
  // Make communitiesArray unique:
  communitiesArray = [...new Set(communitiesArray)];
  communitiesArray.forEach((community) => {
    if (
      !(
        'remove_communities' in args &&
        args.remove_communities &&
        args.remove_communities.indexOf(community) !== -1
      ) &&
      community !== ''
    ) {
      communitiesArrayFinal.push({ identifier: community });
    }
  });
  metadata['communities'] = communitiesArrayFinal;
  // Done with communities

  if ('zotero_link' in args && args.zotero_link) {
    metadata['related_identifiers'] = [
      {
        identifier: args.zotero_link,
        relation: 'isAlternateIdentifier',
        resource_type: 'other',
        scheme: 'url',
      },
    ];
  }
  if (args.verbose) console.log(JSON.stringify(metadata, null, 2));
  // console.log("updateMetadata TEMPORARY=" + JSON.stringify(metadata, null, 2))
  // console.log("--------------------------------------------------------------------------")
  return metadata;
}

export function mydebug(args, msg, data) {
  if (args && 'debug' in args && args.debug) {
    console.log('DEBUG: ' + msg);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

export function myverbose(args, msg, data) {
  if (
    args &&
    (('verbose' in args && args.verbose) || ('debug' in args && args.debug))
  ) {
    console.log('VERBOSE: ' + msg);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}
