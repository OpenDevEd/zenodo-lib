export default function zenodoMessage(number) {
  if (number === 200) {
    console.log(
      `${number}: OK Request succeeded. Response included. Usually sent for GET/PUT/PATCH requests`,
    );
  } else if (number === 201) {
    console.log(
      `${number}: Created Request succeeded. Response included. Usually sent for POST requests.`,
    );
  } else if (number === 202) {
    console.log(
      `${number}: Accepted Request succeeded. Response included. Usually sent for POST requests, where background processing is needed to fulfill the request.`,
    );
  } else if (number === 204) {
    console.log(
      `${number}: No Content Request succeeded. No response included. Usually sent for DELETE requests.`,
    );
  } else if (number === 400)
    console.log(
      `${number}: Bad Request Request failed. Error response included.`,
    );
  else if (number === 401) {
    console.log(
      `${number}: Unauthorized Request failed, due to an invalid access token. Error response included.`,
    );
  } else if (number === 403) {
    console.log(
      `${number}: Forbidden Request failed, due to missing authorization (e.g. deleting an already submitted upload or missing scopes for your access token). Error response included.`,
    );
  } else if (number === 404) {
    console.log(
      `${number}: Not Found Request failed, due to the resource not being found. Error response included.`,
    );
  } else if (number === 405) {
    console.log(
      `${number}: Method Not Allowed Request failed, due to unsupported HTTP method. Error response included.`,
    );
  } else if (number === 409) {
    console.log(
      `${number}: Conflict Request failed, due to the current state of the resource (e.g. edit a deopsition which is not fully integrated). Error response included.`,
    );
  } else if (number === 415) {
    console.log(
      `${number}: Unsupported Media Type Request failed, due to missing or invalid request header Content-Type. Error response included.`,
    );
  } else if (number === 429) {
    console.log(
      `${number}: Too Many Requests Request failed, due to rate limiting. Error response included.`,
    );
  } else {
    console.log(
      `${number}: Internal Server Error Request failed, due to an internal server error. Error response NOT included. Don’t worry, Zenodo admins have been notified and will be dealing with the problem ASAP.`,
    );
  }
}
