import { type Command } from 'commander';
import Table from 'cli-table';
import migrateMongo, { type MigrationStatus } from 'migrate-mongo';
import path from 'node:path';

import { type Config } from '../types/migration';
import { createStub } from '../utils/migration';
import { handleError } from '../utils/shared';

class MigrationCommand {
  private readonly program: Command;
  private readonly config: Config | undefined;

  constructor(program: Command, config?: Config) {
    this.program = program;
    this.config = config;
    migrateMongo.config.set(this.config as Partial<Config>);
    this.init();
  }

  private printMigrated(migrated: string[] = []): void {
    migrated.forEach((migratedItem) => {
      console.log(`MIGRATED UP: ${migratedItem}`);
    });
  }

  private async printStatusTable(statusItems: MigrationStatus[]): Promise<void> {
    try {
      const config = await migrateMongo.config.read();
      const useFileHash = config.useFileHash === true;
      const table = new Table({ head: useFileHash ? ['Filename', 'Hash', 'Applied At'] : ['Filename', 'Applied At'] });
      statusItems.forEach((item) => {
        table.push(
          useFileHash ? [item.fileName, item.fileHash ?? 'N/A', item.appliedAt] : [item.fileName, item.appliedAt],
        );
      });
      console.log(table.toString());
    } catch (err: unknown) {
      handleError(err as Error);
    }
  }

  private init(): void {
    const group = this.program.command('migration').description('jalankan perintah migration --help untuk detail');

    group
      .command('create [description]')
      .description('buat migration database baru dengan dilengkapi deskripsi')
      .option('-f --file <file>', 'menggunakan custom config file', './config/migrate-mongo-config.js')
      .action(async (description, options) => {
        try {
          global.options = options;
          const fileName = await migrateMongo.create(description as string);
          const config = await migrateMongo.config.read();
          const migrationsDir = typeof config.migrationsDir === 'string' ? config.migrationsDir : 'migrations';
          createStub(`${migrationsDir}/${fileName}`);
          console.log(`Created: ${migrationsDir}/${fileName}`);
          process.exit(0);
        } catch (err: unknown) {
          handleError(err as Error);
        }
      });

    group
      .command('up')
      .description('menjalankan semua database migration yang pending')
      .option('-f --file <file>', 'menggunakan custom config file', './config/migrate-mongo-config.js')
      .option('-d, --dry-run', 'simulasikan migrasi dengan database transaction')
      .action(async (options) => {
        try {
          global.options = options;
          const { db, client } = await migrateMongo.database.connect();

          if (options.dryRun === true) {
            const session = client.startSession();
            try {
              session.startTransaction();
              const statusItems = await migrateMongo.status(db);
              const pendingItems = statusItems.filter((item) => item.appliedAt === 'PENDING');

              console.log(`Found ${pendingItems.length} pending migrations.`);

              const config = await migrateMongo.config.read();

              for (const item of pendingItems) {
                console.log(`Applying (dry-run): ${item.fileName}`);
                const migrationPath = path.resolve(config.migrationsDir ?? 'migrations', item.fileName);
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const migration = require(migrationPath);
                if (typeof migration.up === 'function') {
                  await migration.up(db, client, session);
                }
              }

              console.log('Dry run completed successfully. Rolling back transaction...');
              await session.abortTransaction();
            } catch (err) {
              console.error('Dry run failed during execution:', err);
              await session.abortTransaction();
              process.exit(1);
            } finally {
              await session.endSession();
              process.exit(0);
            }
          } else {
            const migrated = await migrateMongo.up(db, client);
            this.printMigrated(migrated);
            process.exit(0);
          }
        } catch (err: unknown) {
          handleError(err as Error);
        }
      });

    group
      .command('down')
      .description('rollback database migration yang terakhir dijalankan')
      .option('-f --file <file>', 'menggunakan custom config file', './config/migrate-mongo-config.js')
      .action(async (options) => {
        try {
          global.options = options;
          const { db, client } = await migrateMongo.database.connect();
          const migrated = await migrateMongo.down(db, client);
          migrated.forEach((migratedItem) => {
            console.log(`MIGRATED DOWN: ${migratedItem}`);
          });
          process.exit(0);
        } catch (err: unknown) {
          handleError(err as Error);
        }
      });

    group
      .command('status')
      .description('menampilkan status migrasi dari database')
      .option('-f --file <file>', 'menggunakan custom config file', './config/migrate-mongo-config.js')
      .action(async (options) => {
        try {
          global.options = options;
          const { db } = await migrateMongo.database.connect();
          const statusItems = await migrateMongo.status(db);
          await this.printStatusTable(statusItems);
          process.exit(0);
        } catch (err: unknown) {
          handleError(err as Error);
        }
      });
  }
}

export default MigrationCommand;
