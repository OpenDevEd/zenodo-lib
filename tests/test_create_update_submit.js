const zenodo = require('../build/zenodo-lib');
const logger = require('../build/logger');

async function main() {
  const about = await zenodo.about({});

  if (about.env && about.env !== 'sandbox') {
    logger.info('Tests should be run in the sandbox.');
    process.exit(1);
  }

  // This returns one record.
  let record = {};
  logger.info('creating a record');
  record = await zenodo.create({ title: 'My test item.' });
  logger.info('created a record');

  const { id } = record;
  logger.info(
    `id: ${id} (${record.state}, ${record.submitted}): ${record.title}`
  );

  // Strange issue with the API - the record isn't immediately available for querying

  logger.info('fetching record with id');
  const fetchedRecord = (await zenodo.record({ id }))[0];
  logger.info('fetched record with id');

  logger.info(
    `id: ${fetchedRecord.id} (${fetchedRecord.state}, ${fetchedRecord.submitted}): ${fetchedRecord.title}`
  );

  logger.info('updating record');
  const updatedRecord = await zenodo.update({
    id,
    title: 'Amended title',
    strict: true,
  });
  logger.info('updated record');

  logger.info(
    `id: ${updatedRecord.id} (${updatedRecord.state}, ${updatedRecord.submitted}): ${updatedRecord.title}`
  );
  logger.info('uploading file');
  record = await zenodo.upload({
    id,
    files: ['resources/ABC.txt', 'resources/communities.txt'],
  });
  logger.info('uploaded file');

  // Submit record
  logger.info('publishing...');
  const publishedRecord = (await zenodo.record({ id, publish: true }))[0];
  logger.info('published...');

  // ^^^ the record returned here is the record before final actions - should use the record returned by final actions.
  // await new Promise(resolve => setTimeout(resolve, 1000));
  record = (await zenodo.record({ id: id, strict: true }))[0];
  // The record is now published.
  logger.info(
    `Published: id: ${id} (${record.state}, ${record.submitted}): ${record.title}`
  );

  // Working up to here ^^^
  // New version: Generating a new id from an old id:
  record = await zenodo.newVersion({
    debug: true,
    verbose: true,
    id: [id],
    deletefiles: true,
    strict: true,
  });

  logger.info('complete,');
  logger.info('TEMPORARY/main=' + JSON.stringify(record, null, 2));
  logger.info(
    `id: ${id} (${record.state}, ${record.submitted}): ${record.title}`
  );
}

main();
