import * as mongo from 'mongodb';

export interface Config {
  mongodb: {
    url: Parameters<typeof mongo.MongoClient['connect']>[0];
    databaseName?: mongo.Db['databaseName'];
    options?: mongo.MongoClientOptions;
  };
  migrationsDir?: string | undefined;
  changelogCollectionName: string;
  migrationFileExtension?: string | undefined;
  useFileHash?: boolean | undefined;
  moduleSystem: 'commonjs';
}
