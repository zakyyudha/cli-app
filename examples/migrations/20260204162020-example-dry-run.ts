import { Db, MongoClient, ClientSession } from 'mongodb';

module.exports = {
  async up(db: Db, client: MongoClient, session?: ClientSession) {
    console.log('Running migration: example-dry-run');
    // Important: Pass the session to all operations to support transaction-based dry runs
    await db.collection('dry_run_test').insertOne(
      {
        name: 'test_document',
        createdAt: new Date(),
        description: 'This document should not exist after a dry-run',
      },
      { session },
    );
    console.log('Inserted document into dry_run_test collection');
  },

  async down(db: Db, client: MongoClient, session?: ClientSession) {
    console.log('Rolling back migration: example-dry-run');
    await db.collection('dry_run_test').deleteOne({ name: 'test_document' }, { session });
  },
};
