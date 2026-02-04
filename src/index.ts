import { Command } from 'commander';
import { type ICliAppConfig } from './types/config';
import { type Config } from './types/migration';
import MigrationCommand from './commands/migration';

class CliApp {
  public program: Command;
  private readonly config: ICliAppConfig;

  constructor(config: ICliAppConfig = {}) {
    this.config = config;
    this.program = new Command();
    this.program.name(this.config.name || 'cli-app');
    this.program.addHelpText('beforeAll', this.config.asciiLogo || '');
    this.program.description(this.config.description || 'A CLI package that wraps commander.js and mongo migration');
  }
}

export { CliApp, MigrationCommand, type ICliAppConfig, type Config };
