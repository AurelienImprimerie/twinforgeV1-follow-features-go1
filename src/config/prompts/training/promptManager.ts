/**
 * Training Prompt Management System
 * Centralized system for managing, versioning, and validating AI prompts
 */

import logger from '../../../lib/utils/logger';
import type { AgentType, CoachCategory } from '../../../domain/ai/trainingAiTypes';

// ============================================================================
// Prompt Structure
// ============================================================================

export interface PromptTemplate {
  version: string;
  system: string;
  user: string;
  variables: string[];
  description: string;
  lastUpdated: string;
  author: string;
  testCases?: PromptTestCase[];
}

export interface PromptTestCase {
  name: string;
  variables: Record<string, any>;
  expectedOutput?: string;
  validation: (output: string) => boolean;
}

export interface PromptVersions {
  [version: string]: PromptTemplate;
}

// ============================================================================
// Prompt Registry
// ============================================================================

export class PromptRegistry {
  private static instance: PromptRegistry;
  private prompts: Map<AgentType, PromptVersions> = new Map();
  private activeVersions: Map<AgentType, string> = new Map();

  private constructor() {
    this.initializePrompts();
  }

  static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry();
    }
    return PromptRegistry.instance;
  }

  private initializePrompts(): void {
    logger.info('PROMPT_REGISTRY', 'Initializing prompt registry');
  }

  registerPrompt(agentType: AgentType, version: string, template: PromptTemplate): void {
    if (!this.prompts.has(agentType)) {
      this.prompts.set(agentType, {});
    }

    const versions = this.prompts.get(agentType)!;
    versions[version] = template;

    if (!this.activeVersions.has(agentType)) {
      this.activeVersions.set(agentType, version);
    }

    logger.debug('PROMPT_REGISTRY', 'Prompt registered', {
      agentType,
      version,
      variablesCount: template.variables.length
    });
  }

  getPrompt(agentType: AgentType, version?: string): PromptTemplate | null {
    const versions = this.prompts.get(agentType);
    if (!versions) {
      logger.warn('PROMPT_REGISTRY', 'No prompts found for agent', { agentType });
      return null;
    }

    const targetVersion = version || this.activeVersions.get(agentType);
    if (!targetVersion || !versions[targetVersion]) {
      logger.warn('PROMPT_REGISTRY', 'Version not found', { agentType, version: targetVersion });
      return null;
    }

    return versions[targetVersion];
  }

  setActiveVersion(agentType: AgentType, version: string): boolean {
    const versions = this.prompts.get(agentType);
    if (!versions || !versions[version]) {
      logger.error('PROMPT_REGISTRY', 'Cannot set active version', { agentType, version });
      return false;
    }

    this.activeVersions.set(agentType, version);
    logger.info('PROMPT_REGISTRY', 'Active version updated', { agentType, version });
    return true;
  }

  getActiveVersion(agentType: AgentType): string | null {
    return this.activeVersions.get(agentType) || null;
  }

  listVersions(agentType: AgentType): string[] {
    const versions = this.prompts.get(agentType);
    return versions ? Object.keys(versions) : [];
  }

  validatePrompt(template: PromptTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.system || template.system.trim().length === 0) {
      errors.push('System prompt is required');
    }

    if (!template.user || template.user.trim().length === 0) {
      errors.push('User prompt is required');
    }

    if (!template.version || !template.version.match(/^\d+\.\d+\.\d+$/)) {
      errors.push('Version must follow semantic versioning (x.y.z)');
    }

    const systemVars = this.extractVariables(template.system);
    const userVars = this.extractVariables(template.user);
    const declaredVars = new Set(template.variables);
    const usedVars = new Set([...systemVars, ...userVars]);

    usedVars.forEach(v => {
      if (!declaredVars.has(v)) {
        errors.push(`Undeclared variable used: ${v}`);
      }
    });

    declaredVars.forEach(v => {
      if (!usedVars.has(v)) {
        errors.push(`Declared variable not used: ${v}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private extractVariables(template: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = template.matchAll(regex);
    return Array.from(matches, m => m[1]);
  }

  renderPrompt(agentType: AgentType, variables: Record<string, any>, version?: string): {
    system: string;
    user: string;
  } | null {
    const template = this.getPrompt(agentType, version);
    if (!template) {
      return null;
    }

    const missingVars = template.variables.filter(v => !(v in variables));
    if (missingVars.length > 0) {
      logger.error('PROMPT_REGISTRY', 'Missing variables', {
        agentType,
        missingVars
      });
      return null;
    }

    const system = this.replaceVariables(template.system, variables);
    const user = this.replaceVariables(template.user, variables);

    return { system, user };
  }

  private replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      if (varName in variables) {
        const value = variables[varName];
        return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      }
      return match;
    });
  }
}

// ============================================================================
// Prompt Builder Utility
// ============================================================================

export class PromptBuilder {
  private template: Partial<PromptTemplate> = {
    variables: [],
    testCases: []
  };

  setVersion(version: string): this {
    this.template.version = version;
    return this;
  }

  setSystem(system: string): this {
    this.template.system = system;
    return this;
  }

  setUser(user: string): this {
    this.template.user = user;
    return this;
  }

  addVariable(name: string): this {
    if (!this.template.variables) {
      this.template.variables = [];
    }
    if (!this.template.variables.includes(name)) {
      this.template.variables.push(name);
    }
    return this;
  }

  addVariables(names: string[]): this {
    names.forEach(name => this.addVariable(name));
    return this;
  }

  setDescription(description: string): this {
    this.template.description = description;
    return this;
  }

  setAuthor(author: string): this {
    this.template.author = author;
    return this;
  }

  addTestCase(testCase: PromptTestCase): this {
    if (!this.template.testCases) {
      this.template.testCases = [];
    }
    this.template.testCases.push(testCase);
    return this;
  }

  build(): PromptTemplate {
    if (!this.template.version || !this.template.system || !this.template.user) {
      throw new Error('Missing required fields: version, system, user');
    }

    return {
      version: this.template.version,
      system: this.template.system,
      user: this.template.user,
      variables: this.template.variables || [],
      description: this.template.description || '',
      lastUpdated: new Date().toISOString(),
      author: this.template.author || 'unknown',
      testCases: this.template.testCases
    };
  }
}

// ============================================================================
// Prompt Testing Utilities
// ============================================================================

export async function testPromptTemplate(
  template: PromptTemplate,
  executor: (system: string, user: string) => Promise<string>
): Promise<{ passed: number; failed: number; results: any[] }> {
  if (!template.testCases || template.testCases.length === 0) {
    logger.warn('PROMPT_TEST', 'No test cases defined');
    return { passed: 0, failed: 0, results: [] };
  }

  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of template.testCases) {
    try {
      const system = new PromptBuilder()
        .setSystem(template.system)
        .setUser(template.user)
        .build()
        .system;

      const user = template.user.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
        return testCase.variables[varName] || '';
      });

      const output = await executor(system, user);
      const valid = testCase.validation(output);

      if (valid) {
        passed++;
      } else {
        failed++;
      }

      results.push({
        name: testCase.name,
        passed: valid,
        output: output.substring(0, 200)
      });
    } catch (error) {
      failed++;
      results.push({
        name: testCase.name,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return { passed, failed, results };
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const promptRegistry = PromptRegistry.getInstance();

// ============================================================================
// Utility function for creating prompt builders
// ============================================================================

export function createPrompt(): PromptBuilder {
  return new PromptBuilder();
}
