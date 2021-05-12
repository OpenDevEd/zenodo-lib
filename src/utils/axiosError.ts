import zenodoMessage from './zendoMessage';

export default function axiosError(error) {
  if (error.response) {
    console.log(
      'The request was made and the server responded with a status code that falls out of the range of 2xx',
    );
    console.log('ZENODO: Error in creating new record (other than 2xx)');
    console.log(
      'ZENODO: List of error codes: https://developers.zenodo.org/?shell#http-status-codes',
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
      'Something happened in setting up the request that triggered an Error',
    );
    console.log('Error', error.message);
  }

  // process.exit(1);
}
