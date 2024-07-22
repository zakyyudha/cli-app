import path from 'node:path';

export function createStub (fileName: string) {
  const stubPath = path.resolve(__dirname, '../stubs/default_migration.stub');
  const fs = require('fs');
  const stub = fs.readFileSync(stubPath, 'utf8');
  fs.writeFileSync(fileName, stub);
}
