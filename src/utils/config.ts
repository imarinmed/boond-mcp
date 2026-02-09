import { readFileSync, writeFileSync, existsSync } from 'fs';
import { UsersConfig, UsersConfigSchema, User } from '../types/auth.js';

/**
 * Load users from a JSON configuration file
 * @param configPath Path to the users configuration JSON file
 * @returns Array of active users
 */
export function loadUsers(configPath: string): User[] {
  if (!existsSync(configPath)) {
    return [];
  }
  const data = readFileSync(configPath, 'utf-8');
  const parsed = JSON.parse(data);
  const validated = UsersConfigSchema.parse(parsed);
  return validated.users.filter(u => u.isActive);
}

/**
 * Save users to a JSON configuration file
 * @param configPath Path to the users configuration JSON file
 * @param users Array of users to save
 */
export function saveUsers(configPath: string, users: User[]): void {
  const config: UsersConfig = { users };
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
