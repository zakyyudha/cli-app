import { Command } from 'commander';
import Table from 'cli-table';
import migrateMongo, { MigrationStatus } from 'migrate-mongo';

import { Config } from '../types/migration';
import { createStub } from '../utils/migration';
import { handleError } from '../utils/shared';

class MigrationCommand {
  private program: Command;
  private config: Config | undefined;

  constructor (program: Command, config?: Config) {
    this.program = program;
    this.config = config;
    migrateMongo.config.set(this.config as any);
    this.init();
  }

  private printMigrated (migrated: string[] = []) {
    migrated.forEach(migratedItem => {
      console.log(`MIGRATED UP: ${migratedItem}`);
    });
  }

  private async printStatusTable (statusItems: MigrationStatus[]) {
    try {
      const config = await migrateMongo.config.read();
      const useFileHash = config.useFileHash === true;
      const table = new Table({ head: useFileHash ? ['Filename', 'Hash', 'Applied At'] : ['Filename', 'Applied At'] });
      statusItems.forEach(item => {
        table.push(useFileHash ? [item.fileName, item.fileHash as string, item.appliedAt] : [item.fileName, item.appliedAt]);
      });
      console.log(table.toString());
    } catch (err: any) {
      handleError(err);
    }
  }

  private init () {
    const group = this.program.command('migration')
      .description('jalankan perintah migration --help untuk detail');

    group
      .command('create [description]')
      .description('buat migration database baru dengan dilengkapi deskripsi')
      .option('-f --file <file>', 'menggunakan custom config file', './config/migrate-mongo-config.js')
      .action(async (description, options) => {
        try {
          global.options = options;
          const fileName = await migrateMongo.create(description);
          const config = await migrateMongo.config.read();
          createStub(`${config.migrationsDir}/${fileName}`);
          console.log(`Created: ${config.migrationsDir}/${fileName}`);
          process.exit(0);
        } catch (err: any) {
          handleError(err);
        }
      });

    group
      .command('up')
      .description('menjalankan semua database migration yang pending')
      .option('-f --file <file>', 'menggunakan custom config file', './config/migrate-mongo-config.js')
      .action(async options => {
        try {
          global.options = options;
          const { db, client } = await migrateMongo.database.connect();
          const migrated = await migrateMongo.up(db, client);
          this.printMigrated(migrated);
          process.exit(0);
        } catch (err: any) {
          handleError(err);
        }
      });

    group
      .command('down')
      .description('rollback database migration yang terakhir dijalankan')
      .option('-f --file <file>', 'menggunakan custom config file', './config/migrate-mongo-config.js')
      .action(async options => {
        try {
          global.options = options;
          const { db, client } = await migrateMongo.database.connect();
          const migrated = await migrateMongo.down(db, client);
          migrated.forEach(migratedItem => {
            console.log(`MIGRATED DOWN: ${migratedItem}`);
          });
          process.exit(0);
        } catch (err: any) {
          handleError(err);
        }
      });

    group
      .command('status')
      .description('menampilkan status migrasi dari database')
      .option('-f --file <file>', 'menggunakan custom config file', './config/migrate-mongo-config.js')
      .action(async options => {
        try {
          global.options = options;
          const { db, client } = await migrateMongo.database.connect();
          const statusItems = await migrateMongo.status(db);
          await this.printStatusTable(statusItems);
          process.exit(0);
        } catch (err: any) {
          handleError(err);
        }
      });
  }
}

export default MigrationCommand;
