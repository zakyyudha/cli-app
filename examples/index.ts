import { CliApp, MigrationCommand, type Config } from '@zakyyudha/cli-app';

// Example configuration for the CLI App
const app = new CliApp({
  name: 'example-cli',
  description: 'An example implementation of the cli-app package',
  asciiLogo: `
  _____  _      _____ 
 / ____|| |    |_   _|
| |     | |      | |  
| |     | |      | |  
| |____ | |____ _| |__
 \\_____||______|_____|
`,
});

// Example configuration for the Migration Command
// Replace the values below with your actual MongoDB connection details
const migrationConfig: Config = {
  mongodb: {
    url: 'mongodb://localhost:27017',
    databaseName: 'test',
    options: {
      // useNewUrlParser: true, // No longer needed in newer MongoDB drivers
      // useUnifiedTopology: true, // No longer needed in newer MongoDB drivers
    },
  },
  migrationsDir: './examples/migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.ts',
  useFileHash: false,
  moduleSystem: 'commonjs',
};

// Initialize the Migration Command with the program instance and configuration
new MigrationCommand(app.program, migrationConfig);

// Parse command line arguments
app.program.parse(process.argv);
