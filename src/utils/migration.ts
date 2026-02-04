import path from 'node:path';
import fs from 'node:fs';

export function createStub(fileName: string): void {
  const stubPath = path.resolve(__dirname, '../stubs/default_migration.stub');
  const stub = fs.readFileSync(stubPath, 'utf8');
  fs.writeFileSync(fileName, stub);
}
