# @zakyyudha/cli-app

A TypeScript CLI package that wraps [commander.js](https://github.com/tj/commander.js) and [migrate-mongo](https://github.com/seppevs/migrate-mongo) to provide an easy-to-use interface for MongoDB database migrations.

## Features

- Simple and intuitive CLI interface
- MongoDB migration management
- Extensible architecture for adding custom commands
- Written in TypeScript with full type definitions

## Requirements

- Node.js >= 18.0.0
- MongoDB (for migration functionality)

## Installation

### Global Installation

```bash
npm install -g @zakyyudha/cli-app
```

### Local Installation

```bash
npm install @zakyyudha/cli-app
```

## Usage

### Basic Usage

```typescript
import { CliApp, MigrationCommand } from '@zakyyudha/cli-app';

// Initialize the CLI app
const app = new CliApp({
  name: 'my-cli',
  description: 'My custom CLI application',
  asciiLogo: `
    ___  ___         _____ _     ___
    |  \\/  |        /  __ \\ |   |_  |
    | .  . |_   _   | /  \\/ |     | |
    | |\\/| | | | |  | |   | |     | |
    | |  | | |_| |  | \\__/\\ |__/\\__/ /
    \\_|  |_/\\__, |   \\____/\\____/___/
             __/ |
            |___/
  `,
});

// Add migration commands
new MigrationCommand(app.program, {
  mongodb: {
    url: 'mongodb://localhost:27017',
    databaseName: 'my_database',
  },
  changelogCollectionName: 'migrations',
  migrationsDir: './migrations',
  moduleSystem: 'commonjs',
});

// Parse command line arguments
app.program.parse(process.argv);
```

## Available Commands

### Migration Commands

The CLI provides the following migration commands:

#### Create a new migration

```bash
cli-app migration create [description]
```

Creates a new migration file with the given description.

Options:

- `-f, --file <file>` - Use a custom config file (default: './config/migrate-mongo-config.js')

#### Run pending migrations

```bash
cli-app migration up
```

Runs all pending database migrations.

Options:

- `-f, --file <file>` - Use a custom config file (default: './config/migrate-mongo-config.js')
- `-d, --dry-run` - Simulate the migration using a database transaction. The transaction will be aborted after execution, ensuring no changes are persisted.

#### Rollback the last migration

```bash
cli-app migration down
```

Rolls back the last executed database migration.

Options:

- `-f, --file <file>` - Use a custom config file (default: './config/migrate-mongo-config.js')

#### Check migration status

```bash
cli-app migration status
```

Shows the status of all migrations.

Options:

- `-f, --file <file>` - Use a custom config file (default: './config/migrate-mongo-config.js')

### Writing Migrations

When writing migrations, you can now utilize the `ClientSession` passed as the third argument to the `up` and `down` functions. This is crucial for supporting the `--dry-run` feature, which relies on MongoDB transactions.

**Example Migration:**

```typescript
import { Db, MongoClient, ClientSession } from 'mongodb';

module.exports = {
  async up(db: Db, client: MongoClient, session?: ClientSession) {
    // Pass the session to your MongoDB operations
    await db.collection('users').insertOne(
      { name: 'John Doe', email: 'john@example.com' },
      { session }, // <--- Important!
    );
  },

  async down(db: Db, client: MongoClient, session?: ClientSession) {
    // Pass the session to your MongoDB operations
    await db.collection('users').deleteOne(
      { email: 'john@example.com' },
      { session }, // <--- Important!
    );
  },
};
```

## Development

### Building the project

```bash
npm run build
```

### Testing locally

```bash
npm run deploy:local
```

### Releasing

To release a new version of the package, use the following command:

```bash
npm run release
```

This command uses [release-it](https://github.com/release-it/release-it) to:

1. Bump the version in `package.json`
2. Generate a changelog
3. Create a Git tag
4. Push to the remote repository
5. Create a GitHub release
6. Publish to npm

## License

This project is licensed under the MIT License.
