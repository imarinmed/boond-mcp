import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { Workflow } from '../types/workflow.js';

const WORKFLOW_SCHEMA_VERSION = '1.0';

interface WorkflowConfig {
  version: string;
  workflows: Workflow[];
}

export function loadWorkflows(configPath: string): Workflow[] {
  if (!existsSync(configPath)) {
    return [];
  }
  
  try {
    const data = readFileSync(configPath, 'utf-8');
    const config: WorkflowConfig = JSON.parse(data);
    return config.workflows || [];
  } catch {
    return [];
  }
}

export function saveWorkflows(configPath: string, workflows: Workflow[]): void {
  const config: WorkflowConfig = {
    version: WORKFLOW_SCHEMA_VERSION,
    workflows,
  };
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
