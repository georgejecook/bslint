import { parse } from 'jsonc-parser';
import { BsLintConfig, BsLintRules, RuleSeverity, BsLintSeverity } from './index';
import { readFileSync, existsSync } from 'fs';
import * as path from 'path';
import { Program } from 'brighterscript';
import { DiagnosticSeverity } from 'brighterscript/dist/parser/ASTUtils';

export function getDefaultRules(): BsLintConfig['rules'] {
	return {
		'assign-all-paths': 'error',
		'unsafe-path-loop': 'error',
		'unsafe-iterators': 'error',
		'unreachable-code': 'info',
		// 'case-sensitivity': 'off',
		// 'no-stop': 'off',
		'consistent-return': 'error',
		// 'only-function': 'off',
		// 'only-sub': 'off',
		// 'no-single-line-if': 'off',
		// 'no-optional-then': 'off'
	};
}

export function getDefaultSeverity() {
	return rulesToSeverity(getDefaultRules());
}

export function normalizeConfig(options: BsLintConfig) {
	const baseConfig = {
		rules: getDefaultRules()
	};
	const projectConfig = mergeConfigs(loadConfig(options), { rules: options.rules });
	return mergeConfigs(baseConfig, projectConfig);
}

export function mergeConfigs(a: BsLintConfig, b: BsLintConfig): BsLintConfig {
	return {
		...a,
		...b,
		rules: {
			...(a.rules || {}),
			...(b.rules || {})
		}
	};
}

function loadConfig(options: BsLintConfig) {
	if (options.lintConfig) {
		const bsconfig = tryLoadConfig(options.lintConfig);
		if (bsconfig) return { ...options, ...bsconfig };
		else throw `Configuration file '${options.lintConfig}' not found`;
	}
	if (options.project) {
		const bsconfig = tryLoadConfig(path.join(path.dirname(options.project), 'bslint.json'));
		if (bsconfig) return { ...options, ...bsconfig };
	}
	if (options.rootDir) {
		const bsconfig = tryLoadConfig(path.join(options.rootDir, 'bslint.json'));
		if (bsconfig) return { ...options, ...bsconfig };
	}
	const bsconfig = tryLoadConfig('./bslint.json');
	if (bsconfig) return { ...options, ...bsconfig };
	return options;
}

function tryLoadConfig(filename: string): BsLintConfig | undefined {
	if (!existsSync(filename)) return undefined;

	const bserrors = [];
	const bsconfig = parse(readFileSync(filename).toString(), bserrors);
	if (bserrors.length) {
		throw `Invalid bslint configuration file '${filename}': ${bserrors}`;
	}
	return bsconfig;
}

export interface PluginContext {
	program?: Program;
	severity: BsLintRules;
}

let context: PluginContext;

export function resolveContext(program: Program) {
	if (context?.program === program) {
		return context;
	}
	const rules = normalizeConfig(program.options).rules;
	context = {
		program,
		severity: rulesToSeverity(rules)
	};
	return context;
}

function rulesToSeverity(rules: BsLintConfig['rules']) {
	return {
		assignAllPath: ruleToSeverity(rules['assign-all-paths']),
		unreachableCode: ruleToSeverity(rules['unreachable-code']),
		unsafePathLoop: ruleToSeverity(rules['unsafe-path-loop']),
		unsafeIterators: ruleToSeverity(rules['unsafe-iterators']),
		consistentReturn: ruleToSeverity(rules['consistent-return']),
		optionalReturn: ruleToSeverity(rules['optional-return'])
	};
}

function ruleToSeverity(rule: RuleSeverity): BsLintSeverity {
	switch (rule) {
		case 'error':
			return DiagnosticSeverity.Error;
		case 'warn':
			return DiagnosticSeverity.Warning;
		case 'info':
			return DiagnosticSeverity.Information;
		default:
			return DiagnosticSeverity.Hint;
	}
}
