// TODO: forEach does not work with async - systematically check replace with "for-in"

import axios from 'axios';
// import { debug as debug } from 'console';
import * as fs from 'fs';
import opn from 'opn';
import logger = require('./logger');

import {
  dumpJSON,
  loadConfig,
  parseId,
  parseIds,
  showDepositionJSON,
  updateMetadata,
  mydebug,
  myverbose,
  get_array,
  get_value,
} from './helper';

/*
module.exports.ZenodoAPI = ZenodoAPI

async function ZenodoAPI(args) {
    try {
  return CallFunctionWithName(args.action, args)
    } catch (e) {
  return {
      "status": "error",
      "data" : e
  }
    }
}
*/

async function apiCall(args, options, fullResponse = false) {
  mydebug(args, `API CALL -- async function apiCall`, '');
  mydebug(args, 'zenodo-lib/apiCall-config(1): args=', args);
  mydebug(args, 'zenodo-lib/apiCall-config(2): options=', options);
  mydebug(args, 'zenodo-lib/apiCall-config(3): fullResponse=', fullResponse);
  if (args.verbose) console.log('zenodo-lib/await axios');
  /*  try {
      // Should this await be here?
const resdata = await axios(options).then(res => {
  if (args.verbose)
    console.log("zenodo-lib/axios->then")
  if ("verbose" in args && args.verbose) {
    console.log(`zenodo-lib/response status code: ${res.status}`)
    zenodoMessage(res.status)
  }
  if (fullResponse) {
    mydebug(args, `THEN - FINISHED - API CALL with fullresponse. res=`, res)
    returndata = res;
  } else {
    mydebug(args, `THEN - FINISHED - API CALL. res.data=`, res.data)
    returndata = res.data;
  }
}).catch(function (err) {
  console.log("zenodo-lib/axios->error")
  if ("verbose" in args && args.verbose) {
    console.log(err);
  }
  axiosError(err)
  return null
}).then(
  //always executed
} catch (E) {

}
);
*/
  let res;
  try {
    res = await axios(options);
  } catch (err) {
    //console.log("zenodo-lib/apiCall-ERROR")
    console.log('zenodo-lib/axios->error');
    if ('verbose' in args && args.verbose) {
      console.log(err);
    }
    axiosError(err);
    mydebug(args, 'zenodo-lib/Error in calling axios', err);
    return null;
  }
  if ('verbose' in args && args.verbose) {
    console.log('zenodo-lib/axios->then');
    console.log(`zenodo-lib/response status code: ${res.status}`);
    zenodoMessage(res.status);
  }
  let returndata;
  if (fullResponse) {
    mydebug(args, `THEN - FINISHED - API CALL with fullresponse. res=`, res);
    returndata = res;
  } else {
    mydebug(args, `THEN - FINISHED - API CALL. res.data=`, res.data);
    returndata = res.data;
  }
  //if (args.verbose || args.debug)
  //  console.log("axios/resdata=" + JSON.stringify(Object.keys(res.data), null, 2))
  // mydebug(args, "zenodo-lib/apiCall-result: data=", res)
  if (args.verbose || args.debug) console.log('FINISHED - API CALL');
  return returndata;
}

// Note: This is API call for [File upload] because the [header] is different in this case.
async function apiCallFileUpload(args, options, fullResponse = false) {
  //const payload = { "data": options.data }
  const payload = fs.readFileSync(options.journal_filepath);
  const destination = options.url;
  const axiosoptions = {
    headers: { 'Content-Type': 'application/octet-stream' },
    params: options.params,
  };
  console.log(`API CALL - file upload  args = %O, options = %O`, args, options);

  try {
    const res = await axios.put(destination, payload, axiosoptions);
    console.log('axios returns');
    if ('verbose' in args && args.verbose) {
      console.log(`response status code: ${res.status}`);
      zenodoMessage(res.status);
    }
    if (fullResponse) {
      return res;
    } else {
      return res.data;
    }
  } catch (err) {
    if ('verbose' in args && args.verbose) {
      console.log(err);
    }
    axiosError(err);
  }
}

// Delete: apiCallFileDelete //  testing in progress

async function apiCallFileDelete(args, options, fullResponse = false) {
  const destination = options.url;
  const axiosoptions = {
    headers: { 'Content-Type': 'application/octet-stream' },
    params: options.params,
  };
  console.log(`API CALL - file delete  args = %O, options = %O`, args, options);
  try {
    const res = await axios.delete(destination, axiosoptions);
    console.log('axios returns');
    if ('verbose' in args && args.verbose) {
      console.log(`response status code: ${res.status}`);
      zenodoMessage(res.status);
    }
    if (fullResponse) {
      return res;
    } else {
      return res.data;
    }
  } catch (err) {
    if ('verbose' in args && args.verbose) {
      console.log(err);
    }
    axiosError(err);
  }
}

async function publishDeposition(args, id) {
  id = parseId(id);
  const { zenodoAPIUrl, params } = loadConfig(args);
  if ('verbose' in args && args.verbose) {
    console.log(`publishDeposition`);
  }
  const options = {
    method: 'post',
    url: `${zenodoAPIUrl}/${id}/actions/publish`,
    params: params,
    headers: { 'Content-Type': 'application/json' },
  };
  const responseDataFromAPIcall = await apiCall(args, options);
  return responseDataFromAPIcall;
}

async function showDeposition(args, id) {
  console.log('--->' + id);
  const info = await getData(args, parseId(id));
  console.log('TEMPORARY=' + JSON.stringify(info, null, 2));
  showDepositionJSON(info);
}

async function getData(args, id) {
  const { zenodoAPIUrl, params } = loadConfig(args);
  myverbose(args, `getting data for ${id}`, null);
  id = parseId(id);
  myverbose(args, `ParseID for ${id}`, null);
  let options = {
    method: 'get',
    url: `${zenodoAPIUrl}`,
    params: params,
    headers: { 'Content-Type': 'application/json' },
  };
  /*
Two ways of getting the record:
(1) Retrieve the record directly from the ID. I can do this if I know whether the ID is a 'plain record' or a 'concept record'. 
If I get this right, the request will fail.

(2) I can retrieve the record via a search. This will always return the record (both both plain and concept). 
However, the search index seems to take ~ 1 second to update. Therefore, if I can just created a record,
it cannot be retrieved via this method.
*/
  if ('strict' in args && args.strict) {
    options.url = options.url + '/' + id;
  } else {
    //Checking Concept.
    options['params']['q'] = String('conceptrecid:' + id + ' OR recid:' + id);
  }
  //const searchParams = { params };
  //searchParams["q"] = String("conceptrecid:" + id + " OR recid:" + id);
  try {
    //const responseDataFromAPIcall = await axios.get(`${zenodoAPIUrl}`, searchParams)
    const responseDataFromAPIcall = await apiCall(args, options);
    if (args.verbose) console.log(`done`);
    // If the id was a conceptid, we need to let the calling function know.
    // Called id=077
    // Function returns data anyway.
    // Calling function assumes that id=077 is a valid id.
    // TODO
    // Check whether data.metadata.id == id
    /*
    if (data.metadata.id != id) {
      console.log("WARNING: concept id provided (077). Record ID is 078. Operate on 078? Y/N")
      if (yes) {
        id = data.metadata.id
      }
    }
    // Instead of this we could say 
      console.log("WARNING: concept id provided (077). Record ID is 078. In order to use concept ids, please add the following switch: --allowconceptids ")
      */

    const finaldata =
      'strict' in args && args.strict
        ? responseDataFromAPIcall
        : responseDataFromAPIcall[0];
    myverbose(args, 'final data: ', finaldata);
    return finaldata;
  } catch (error) {
    console.log('ERROR getData/responseDataFromAPIcall: ' + error);
    process.exit(1);
  }
}

async function getMetadata(args, id) {
  return await getData(args, id)['metadata'];
}

async function createRecord(args, metadata) {
  if (args.verbose) console.log('Creating record.');
  mydebug(args, 'zenodo.createRecord', args);
  const { zenodoAPIUrl, params } = loadConfig(args);
  /* 
    console.log(`URI:    ${zenodoAPIUrl}`)
    const zenodoAPIUrlWithToken = zenodoAPIUrl+"?access_token="+params["access_token"]

    At present, the file blank.json is used as a default, therefore the checks below will pass.
    However, blank.json does not contain a date - Zenodo will use todays date
    const requiredMetadataFields = ["title", "description", "authors"]
    var raiseErrorMissingMetadata = false
    requiredMetadataFields.forEach(metadatafield => {
    if (!(metadatafield in metadata)) {
      console.log(`To create a new record, you need to supply the ${metadatafield}.`);
      raiseErrorMissingMetadata = true
      }  else {
       console.log(`Go to ${metadatafield} = ${metadata[metadatafield]}`)
      }
    });
    if (raiseErrorMissingMetadata) {
     console.log("One or more required fields are missing. Please consult 'create -h'.")
     process.exit(1)
    } 

   */
  const payload = { metadata: metadata };
  //console.log(JSON.stringify(payload))
  const options = {
    method: 'post',
    url: zenodoAPIUrl,
    params: params,
    headers: { 'Content-Type': 'application/json' },
    data: payload,
  };

  const responseDataFromAPIcall = await apiCall(args, options);
  mydebug(args, 'zenodo.createRecord/final', responseDataFromAPIcall);

  return responseDataFromAPIcall;
}

async function editDeposit(args, dep_id) {
  /*
  Unlock already submitted deposition for editing.
  
  curl -i -X POST https://zenodo.org/api/deposit/depositions/1234/actions/edit?access_token=ACCESS_TOKEN
  HTTP Request
  POST /api/deposit/depositions/:id/actions/edit
  
  Scopes
  deposit:actions
  
  Success response
  Code: 201 Created
  Body: a deposition resource.
  */
  console.log('\tMaking deposit editable (actions/edit).');
  const { params, zenodoAPIUrl } = loadConfig(args);
  const options = {
    method: 'post',
    url: `${zenodoAPIUrl}/${parseId(dep_id)}/actions/edit`,
    params: params,
    headers: { 'Content-Type': 'application/json' },
  };
  const responseDataFromAPIcall = await apiCall(args, options, false);
  return responseDataFromAPIcall;
}

async function updateRecord(args, dep_id, metadata) {
  if (args.verbose) console.log('Updating record.');
  //-->
  const { params, zenodoAPIUrl } = loadConfig(args);
  const payload = { metadata: metadata };
  const options = {
    method: 'put',
    url: `${zenodoAPIUrl}/${parseId(dep_id)}`,
    params: params,
    headers: { 'Content-Type': 'application/json' },
    data: payload,
  };

  const responseDataFromAPIcall = await apiCall(args, options);

  if (args.debug)
    console.log(
      'updateRecord=' + JSON.stringify(responseDataFromAPIcall, null, 2)
    );

  // process.exit(1)

  return responseDataFromAPIcall;
}

async function fileUpload(args, bucket_url, journal_filepath) {
  const { params } = loadConfig(args);
  console.log('Uploading file.');
  const fileName = journal_filepath.replace('^.*\\/', '');
  console.log(`----------> ${journal_filepath}`);
  //console.log(data)
  const destination = `${bucket_url}/${fileName}`;
  const options = {
    method: 'put',
    url: destination,
    params: params,
    header: { 'Content-Type': 'application/octet-stream' },
    journal_filepath: journal_filepath,
  };
  const responseDataFromAPIcall = await apiCallFileUpload(args, options).then(
    (res) => {
      logger.info(`UploadSuccessfully: ${destination}`);
      return res;
    }
  );

  return responseDataFromAPIcall;
}

async function finalActions(args, id, deposit_url) {
  return finalActions2(args, {
    id: id,
    links: { html: deposit_url },
  });
}

async function finalActions2(args, data) {
  mydebug(args, 'finalActions2', data);
  // the record need to contains files.
  // TODO: Whether whethr this is the case?
  let returnValue = data;
  const id = data['id'];
  const deposit_url = data['links']['html'];
  if ('publish' in args && args.publish) {
    // publishDeposition will change the data, hence collecting return_value
    returnValue = await publishDeposition(args, id);
  }
  if ('show' in args && args.show) {
    await showDeposition(args, id);
  }
  if ('dump' in args && args.dump) {
    await dumpDeposition(args, id);
  }
  if ('open' in args && args.open) {
    // webbrowser.open_new_tab(deposit_url);
    opn(deposit_url);
  }
  mydebug(args, 'finalActions2, rv', returnValue);
  return returnValue;
}

export async function about(args) {
  const { zenodoAPIUrl, params } = loadConfig(args);
  const out = {
    zenodoAPIUrl,
    ...params,
  };
  return out;
}

// Top-level function - "zenodo-cli record'
// TODO: Separate this out into getRecords and getRecord
export async function getRecord(args) {
  // check arguments
  // args.strict is a value
  if ('strict' in args) {
    args.strict = get_value(args.strict);
  } else {
    args.strict = true;
  }

  //
  let data;
  const ids = parseIds(args.id);
  const output = [];
  for (const id of ids) {
    //console.log(`saveIdsToJson ---0`)
    data = await getData(args, id);
    output.push(data);
    // console.log(JSON.stringify(data))
    // Write record - TODO - should make this conditional
    //console.log(`saveIdsToJson ---1a`)
    let path = `${id}.json`;
    // console.log(`saveIdsToJson ---1b`)
    if (data && data['metadata']) {
      let buffer = Buffer.from(JSON.stringify(data['metadata']));
      //console.log(`saveIdsToJson ---2`)
      fs.open(path, 'w', function (err, fd) {
        if (err) {
          throw 'could not open file: ' + err;
        }
        /*
         write the contents of the buffer, from position 0 to the end, to the file descriptor 
        returned in opening our file
        */
        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
          if (err) throw 'error writing file: ' + err;
          fs.close(fd, function () {
            console.log('wrote the file successfully');
          });
        });
      });
      //console.log(`saveIdsToJson ---3`)
      await finalActions(args, id, data['links']['html']);
      //console.log(`saveIdsToJson ---4`)
    } else {
      console.log('DATA=' + JSON.stringify(data, null, 2));
      console.log(
        'Request completed successfully, but no data was retrieved. Do you have access to the record?'
      );
    }
  }
  return output;
}

export async function dumpDeposition(args, id) {
  const info = await getData(args, parseId(id));
  dumpJSON(info);
}

export async function duplicate(args, subparsers) {
  // ACTION: check arguments
  // ACTIONS...
  let bucket_url, deposit_url, metadata, response_data;
  let data = await getData(args, args.id[0]);
  //getMetadata(args,args.id[0]);
  metadata = data['metadata'];
  //console.log(metadata);
  delete metadata['doi'];
  metadata['prereserve_doi'] = true;
  //console.log(metadata);
  metadata = updateMetadata(args, metadata);
  response_data = await createRecord(args, metadata);
  //console.log(response_data);
  bucket_url = response_data['links']['bucket'];
  deposit_url = response_data['links']['html'];
  if (args.files) {
    for (const filePath of args.files) {
      await fileUpload(args, bucket_url, filePath);
      // await finalActions(args, response_data["id"], deposit_url);
    }
  }
  await finalActions(args, response_data['id'], deposit_url);
  // TODO: this should have proper return value other than 0
  return 0;
}

export async function upload(args, subparsers) {
  // ACTION: check arguments
  if ('files' in args) args.files = get_array(args.files);
  // ACTIONS...
  let bucket_url, deposit_url, response;
  if ('bucketurl' in args && args.bucketurl) {
    bucket_url = args.bucketurl;
  } else {
    if (args.id) {
      // Problem - for the response to include the bucket url, the requeste may not work like this...
      args.strict = true;
      response = await getData(args, args.id);
      //console.log("TEMPORARY XXX=" + JSON.stringify(response, null, 2))
      bucket_url = response['links']['bucket'];
      deposit_url = response['links']['html'];
    } else {
      console.log('No bucket url.');
    }
  }
  console.log(bucket_url);
  let output = { files: [], final: {} };
  if (bucket_url) {
    // (1) It might be good to take an MD5 sum first and then check that against what is returned.
    //     It could also be an idea to let the user submit each file with an MD5 sum.
    // (2) Check that all upload complete before the output is returned. (Should be ok, but is not tested.)
    for (const filePath of args.files) {
      const file = await fileUpload(args, bucket_url, filePath);
      output.files.push(file);
    }
    output.final = await finalActions(args, args.id, deposit_url);
  } else {
    console.log('Unable to upload: bucketurl both not specified.');
  }
  return output;
}

// Top-level function - "zenodo-cli update'
export async function update(args) {
  let bucket_url, data, deposit_url, id;
  let metadata;

  id = parseIds(args.id);
  data = await getData(args, id);
  if (Array.isArray(data)) data = data[0];
  if (args.verbose) console.log('update/data=' + JSON.stringify(data, null, 2));
  metadata = data['metadata'];
  //console.log(metadata);
  if (data.submitted == true && data.state == 'done') {
    logger.info('Making record editable.');
    let response = await editDeposit(args, id);
    logger.info('response editDeposit: %O', response);
  }

  let metadataNew = await updateMetadata(args, metadata);
  let responseUpdateRecord = await updateRecord(args, id, metadataNew);

  bucket_url = responseUpdateRecord['links']['bucket'];
  deposit_url = responseUpdateRecord['links']['html'];
  if (args.files) {
    for (const filePath of args.files) {
      await fileUpload(args, bucket_url, filePath);
      // await finalActions(args, id, deposit_url);
    }
  }
  // As top-level function, execute final actions.
  await finalActions(args, id, deposit_url);

  // retrieve the record again, to get the final version after all updates... Really final actins should do that too.
  // TODO: See whether this can be optimised.
  data = await getData(args, id);
  if (Array.isArray(data)) data = data[0];
  responseUpdateRecord = data;
  return responseUpdateRecord;
}

export async function copy(args, subparsers) {
  // ACTION: check arguments
  // ACTIONS...
  var bucket_url, metadata, response_data;
  metadata = getMetadata(args, args.id);
  delete metadata['doi'];
  delete metadata['prereserve_doi'];
  var arr = args.files;
  for (const journal_filepath of arr) {
    console.log('Processing: ' + journal_filepath);
    response_data = await createRecord(args, metadata);
    bucket_url = response_data['links']['bucket'];
    await fileUpload(args, bucket_url, journal_filepath);
    await finalActions(
      args,
      response_data['id'],
      response_data['links']['html']
    );
  }
  return 0;
}

// Top-level function - "zenodo-cli list'
export async function listDepositions(args) {
  // listDepositions: check arguments
  mydebug(args, 'listDepositions', args);
  const { zenodoAPIUrl, params } = loadConfig(args);
  params['page'] = args.page;
  params['size'] = args.size ? args.size : 1000;
  // actions
  const options = {
    method: 'get',
    url: zenodoAPIUrl,
    params: params,
  };
  const res = await apiCall(args, options);
  mydebug(args, 'listDepositions: apiCall', res);
  // Perform a separate dump to capture this response.
  if ('dump' in args && args.dump) {
    dumpJSON(res);
  }
  if ('publish' in args && args.publish) {
    console.log(
      "Warning: using 'list' with '--publish' means that all of your depositions will be published. Please confirm by typing yes."
    );
    // TODO
    // Capture user input. If yser types yes, continue. If user types anything else, then abort.
    var stdin = process.openStdin();
    stdin.addListener('data', function (d) {
      // note:  d is an object, and when converted to a string it will
      // end with a linefeed.  so we (rather crudely) account for that
      // with toString() and then substring()
      console.log('you entered: [' + d.toString().trim() + ']');
    });
    // TODO ^^^ Fix this
    process.exit(1);
  }
  if (res.length > 0) {
    var newres = [];
    await res.forEach(async function (item) {
      // console.log(item["record_id"], item["conceptrecid"]);
      const resfa = finalActions2(args, item);
      newres.push({
        record_id: item['record_id'],
        concept_id: item['conceptrecid'],
        finalactions: resfa,
      });
    });
    // TODO - check. This is the right array, but contains a promise... ?
    mydebug(args, 'listDepositions: final', newres);
    return newres;
  }
  // return data to calling function:
  return res;
}

export async function newVersion(args, subparsers) {
  // ACTION: check arguments
  // TODO
  // ACTIONS...
  // Load config.
  const { zenodoAPIUrl, params } = loadConfig(args);
  // ids can be provided in different ways, so we alway parse the id.
  // TODO: Check this is the case for all function.
  let id_of_old_record = parseId(args.id[0]);
  // In order to make a new version for args.id[0], we need to check that record.
  // Let's check a new version is possible.
  const data = await getData(args, id_of_old_record);
  //if (!(data["state"] == "done" && data["submitted"])) {
  if (!(data['state'] === 'done')) {
    console.log(`The state of the record is ${data.state}.`);
  }
  if (!data['submitted']) {
    console.log('This record is not final - cannot create new version.');
    return {
      status: 1,
      message: 'This record is not final - cannot create new version.',
      record: data,
    };
  }
  // TODO: Generally across all of the zotero-lib, zenodo-lib, zotzen-lib: migrate to using console.log/error/verbose... select a package: winston
  // New version is possible - make one.
  console.log('Trying to create new record.');
  const options = {
    method: 'post',
    url: `${zenodoAPIUrl}/${id_of_old_record}/actions/newversion`,
    params: params,
    headers: { 'Content-Type': 'application/json' },
  };
  // This is the second call to the API, to get the existing recod.
  const responseDataFromAPIcall = await apiCall(args, options);
  //console.log(responseDataFromAPIcall);
  //return responseDataFromAPIcall;
  let response_data = responseDataFromAPIcall;
  console.log('latest_draft: ', response_data['links']['latest_draft']);
  const latest = response_data['links']['latest_draft'];
  const newid = latest.match(/(\d+)$/);
  var id_for_new_record = '';
  if (newid) {
    if (id_of_old_record != newid[1]) {
      id_for_new_record = newid[1];
      args.id = id_for_new_record;
      console.log('Moving forward to new record: ' + id_for_new_record);
    } else {
      console.log('Unable to determine new id (no record created)');
      // return with error -> TODO make better error message
      process.exit(1);
    }
  } else {
    console.log('Unable to determine new id');
    // return with error -> TODO make better error message
    process.exit(1);
  }
  const metadata = responseDataFromAPIcall['metadata'];
  const newmetadata = updateMetadata(args, metadata);
  if (newmetadata !== metadata) {
    //delete newmetadata.do
    //delete newmetadata.prereserve_doi
    //console.log("newmeta="+JSON.stringify(   newmetadata        ,null,2))
    response_data = await updateRecord(args, id_for_new_record, newmetadata);
    //console.log("newmeta="+JSON.stringify(   response_data         ,null,2))
  } else {
    //retrieve the record again
    args.strict = true;
    //TODO: discuss id_for_new_record seems erroraneous here
    // response_data = await getRecord(args, id_for_new_record);
    response_data = await getRecord(args);
  }
  // Now response data holds the new record.
  response_data = response_data[0];
  console.log(
    'This should be the new record. data=' +
      JSON.stringify(response_data, null, 2)
  );
  console.log('Updated metadata');

  if ('deletefiles' in args && args.deletefiles) {
    const { params } = loadConfig(args);
    console.log('attempting to delete files');
    const id = response_data.id;
    // To check: Is this the new id -  id_for_new_record ?
    // TODO: Replace forEach with
    // for (file in response_data.files) { ... }
    // also collect return data from api call.
    if (
      !Array.isArray(response_data.files) ||
      response_data.files.length == 0
    ) {
      console.log('No files found for deletion - critical error');
      process.exit(1);
    }

    var deletionlog = [];
    for (const file of response_data.files) {
      console.log(`Deleting ${file.id}`);
      const file_id = file.id;
      // await deletefile(id, file_id)
      // -> DELETE /api/deposit/depositions/:id/files/:file_id

      //code testing in progress ..
      const options = {
        url: `${zenodoAPIUrl}/${id}/files/${file_id}`,
        headers: { 'Content-Type': 'application/json' },
        params,
      };
      deletionlog.push(await apiCallFileDelete(args, options));

      console.log(`DELETE /api/deposit/depositions/${id}/files/${file_id}`);
    }
    // Question: need to call finalActions here?
    console.log('deletion of files complete');
  }
  console.log('something wrong from here...');
  // You have two ids: The original one, and the new one.
  // const deposit_url = response_data["links"]["latest_html"];
  var uploadlog = [];
  if (args.files) {
    const bucket_url = response_data['links']['bucket'];
    for (const filePath of args.files) {
      uploadlog.push(await fileUpload(args, bucket_url, filePath));
    }
    //  await finalActions(args, response_data["id"], deposit_url);
  }
  args.id = response_data['id'];
  // Task 1: Determine the correct deposit_url
  const deposit_url_2 = response_data['id']['deposit_url'];
  // Task 2: There is a problem with await in finalAction
  const finalactions = await finalActions(
    args,
    response_data['id'],
    deposit_url_2
  );
  console.log('latest_draft: ', deposit_url_2);
  console.log('Done');
  return {
    status: 0,
    message: '',
    response: response_data,
    final: finalactions,
    uploadlog: uploadlog,
    deletionlog: deletionlog,
  };
}

export async function download(args) {
  // ACTION: check arguments
  // ACTIONS...
  var data, id, name;
  id = parseId(args.id[0]);
  data = await getData(args, id);
  const { params } = loadConfig(args);
  //IF NO uploaded files: data["files"] => undefined.
  if (data['files']) {
    //the record should be [published] to have this option.
    data['files'].forEach(async function (fileObj) {
      name = fileObj['filename'];
      console.log(`Downloading ${name}`);
      const res = await axios.get(fileObj['links']['download'], {
        params: params,
      });

      fs.open(name, 'wx+', (err, fd) => {
        if (err) {
          console.log(err);
        } else {
          //uniquely referencing a specific file.
          console.log(fd);
          let buf = Buffer.from(res.data),
            pos = 0,
            offset = 0,
            len = buf.length;
          fs.write(fd, buf, offset, len, pos, (err, bytes, buff) => {
            let buf2 = Buffer.alloc(len);
            //testing
            fs.read(fd, buf2, offset, len, pos, (err, bytes, buff2) => {
              console.log(buff2.toString());
            });
            //testing
          });
        }
      });

      //----------checksum
      fs.open(name + '.md5', 'w+', (err, fd) => {
        if (err) {
          console.log(err);
        } else {
          //uniquely referencing a specific file.
          console.log(fd);
          let buf = Buffer.from(
              fileObj['checksum'] + ' ' + fileObj['filename']
            ),
            pos = 0,
            offset = 0,
            len = buf.length;
          fs.write(fd, buf, offset, len, pos, (err, bytes, buff) => {
            let buf2 = Buffer.alloc(len);
            //testing
            fs.read(fd, buf2, offset, len, pos, (err, bytes, buff2) => {
              console.log(buff2.toString());
            });
            //testing
          });
        }
      });
    });
  } else {
    console.log('the record should be published and files uploaded');
  }

  /*
  OLD code:
    data["files"].forEach(async function (fileObj) {
    name = fileObj["filename"];
    console.log(`Downloading ${name}`);
    const res = await axios.get(fileObj["links"]["download"], { "params": params });
    fp = open(name, "wb+");
    fp.write(res.data);
    fp.close();
    fp = open((name + ".md5"), "w+");
    fp.write(((fileObj["checksum"] + " ") + fileObj["filename"]));
    fp.close();
  })
  */
  return 0;
}

export async function concept(args) {
  // ACTION: check arguments
  // ACTIONS...
  const { zenodoAPIUrl, params } = loadConfig(args);
  params['q'] = `conceptrecid:${parseId(args.id[0])}`;
  const res = await axios.get(zenodoAPIUrl, { params: params });
  if (res.status !== 200) {
    console.log(`Failed in concept(args): `, res.data);
    return this.message(1, `Failed in concept(args): `, res.data);
  }
  if ('dump' in args && args.dump) {
    dumpJSON(res.data);
  }
  // TODO: Create array, write pairs to array
  res.data.forEach(async function (dep) {
    console.log(dep['record_id'], dep['conceptrecid']);
    // TODO replace what's below with finalactions.
    if ('publish' in args && args.publish) {
      await publishDeposition(args, dep['id']);
    }
    // TODO: ^^^ get value from publishDeposition (to indicate success); add that value to the array.
    if ('show' in args && args.show) {
      showDepositionJSON(dep);
    }
    if ('open' in args && args.open) {
      opn(dep['links']['html']);
    }
  });
  // return the array.
  return 0;
}

// Top-level function - "zenodo-cli create'
export async function create(args, subparsers?) {
  // ACTION: check arguments
  mydebug(args, 'zenodolib.create', args);
  // Note that Zenodo does not require a date or a DOI, but it will generate those on creation.
  const zenodoDefault = {
    access_right: 'open',
    creators: [
      {
        name: 'No name available.',
        affiliation: 'No affiliation available.',
      },
    ],
    title: 'No title available.',
    description: 'No description available.',
    communities: [
      {
        identifier: 'zenodo',
      },
    ],
    doi: '',
    publication_type: 'report',
    upload_type: 'publication',
  };
  //const f = fs.readFileSync("blank.json", { encoding: 'utf8' });
  const metadata = updateMetadata(args, zenodoDefault);
  let response_data;
  response_data = await createRecord(args, metadata);
  if (args.verbose) console.log('RESP: ' + JSON.stringify(response_data));
  let response_data_2 = null;
  if (response_data) {
    response_data_2 = await finalActions2(args, response_data);
  } else {
    console.log('Record creation failed.');
  }
  if (response_data_2) {
    response_data = response_data_2;
  }
  mydebug(args, 'zenodo.create/final', response_data);
  return response_data;
}

async function axiosError(error) {
  if (error.response) {
    console.log(
      'The request was made and the server responded with a status code that falls out of the range of 2xx'
    );
    console.log(`ZENODO: Error in creating new record (other than 2xx)`);
    console.log(
      'ZENODO: List of error codes: https://developers.zenodo.org/?shell#http-status-codes'
    );
    console.log('status:' + error.response.status);
    zenodoMessage(error.response.status);
    console.log('Error1', error.message);
    console.log('Error2', JSON.stringify(error.response.errors));
    console.log('Error3', error.response.data.status);
    console.log('Error4', error.response.data.message);
    console.log('Error5', JSON.stringify(error.response.data, null, 2));
    // if (verbose) {
    //  console.log(error.response.data);
    //  console.log(error.response.headers);
    // }
  } else if (error.request) {
    console.log(`The request was made but no response was received
    'error.request' is an instance of XMLHttpRequest in the browser and an instance of
    http.ClientRequest in node.js`);
    console.log(error.request);
  } else if (error.config) {
    console.log(error.config);
    console.log(`Fatal error in create->axios.post: ${error}`);
  } else {
    console.log(
      'Something happened in setting up the request that triggered an Error'
    );
    console.log('Error', error.message);
  }

  //process.exit(1);
}

function zenodoMessage(number) {
  if (number === 200)
    console.log(
      `${number}: OK	Request succeeded. Response included. Usually sent for GET/PUT/PATCH requests`
    );
  else if (number === 201)
    console.log(
      `${number}: Created	Request succeeded. Response included. Usually sent for POST requests.`
    );
  else if (number === 202)
    console.log(
      `${number}: Accepted	Request succeeded. Response included. Usually sent for POST requests, where background processing is needed to fulfill the request.`
    );
  else if (number === 204)
    console.log(
      `${number}: No Content	Request succeeded. No response included. Usually sent for DELETE requests.`
    );
  else if (number === 400)
    console.log(
      `${number}: Bad Request	Request failed. Error response included.`
    );
  else if (number === 401)
    console.log(
      `${number}: Unauthorized	Request failed, due to an invalid access token. Error response included.`
    );
  else if (number === 403)
    console.log(
      `${number}: Forbidden	Request failed, due to missing authorization (e.g. deleting an already submitted upload or missing scopes for your access token). Error response included.`
    );
  else if (number === 404)
    console.log(
      `${number}: Not Found	Request failed, due to the resource not being found. Error response included.`
    );
  else if (number === 405)
    console.log(
      `${number}: Method Not Allowed	Request failed, due to unsupported HTTP method. Error response included.`
    );
  else if (number === 409)
    console.log(
      `${number}: Conflict	Request failed, due to the current state of the resource (e.g. edit a deopsition which is not fully integrated). Error response included.`
    );
  else if (number === 415)
    console.log(
      `${number}: Unsupported Media Type	Request failed, due to missing or invalid request header Content-Type. Error response included.`
    );
  else if (number === 429)
    console.log(
      `${number}: Too Many Requests	Request failed, due to rate limiting. Error response included.`
    );
  else
    console.log(
      `${number}: Internal Server Error	Request failed, due to an internal server error. Error response NOT included. Don’t worry, Zenodo admins have been notified and will be dealing with the problem ASAP.`
    );
}

export {
  getRecord as record,
  dumpDeposition as dump,
  listDepositions as list,
  newVersion as newversion,
};

// module.exports.record = getRecord;
// module.exports.about = about;
// module.exports.dump = dumpDeposition;
// module.exports.duplicate = duplicate;
// module.exports.upload = upload;
// module.exports.update = update;
// module.exports.copy = copy;
// module.exports.list = listDepositions;
// module.exports.newversion = newVersion;
// module.exports.download = download;
// module.exports.concept = concept;
// module.exports.create = create;

/* OLD axios post code:
  const options = { headers: { 'Content-Type': "application/json" }, params: params }
  const resData = await axios.post(zenodoAPIUrl, JSON.stringify(payload), options)
  .then(res => {
  if (verbose) {
  console.log(res.status)
  zenodoMessage(res.status)
  console.log(res)
  }
  return res.data;
  }).catch(err => {
  axiosError(err)
  });

  /*
  option to zenodo-cli --verbose
  if (verbose) {
    console.log(zenodoMessage(res.status))
  }
  */

/*
The functions should be migrated in the following priority:
P1: list - done, get - done, show - done, dump - done, create - done, update - done, upload-done, publish(no)
P2: new version(no), download -tested by Zeina, concept - done, open-done
P3: duplicate-(no), multi-duplicate-(no)

*/
