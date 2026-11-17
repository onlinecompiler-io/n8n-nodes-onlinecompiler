import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

// Calls the OnlineCompiler.io REST API (https://onlinecompiler.io/docs): every run starts in a
// fresh sandbox with no network. Run Code uses /api/run-code-sync/, Run Tests /api/run-tests/,
// and the language list /api/compilers/ (which needs no key).
const runOperations = ['runCode', 'runTests'];

export class OnlineCompiler implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OnlineCompiler.io',
		name: 'onlineCompiler',
		icon: { light: 'file:onlinecompiler.svg', dark: 'file:onlinecompiler.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Run code in 46 languages in a fresh sandbox with no network, and judge it against test cases',
		defaults: {
			name: 'OnlineCompiler.io',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'onlineCompilerApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.onlinecompiler.io',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'List Compilers',
						value: 'listCompilers',
						action: 'List compilers',
						description: 'List every language with the compiler ID to use in Run Code and Run Tests',
						routing: {
							request: {
								method: 'GET',
								url: '/api/compilers/',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'compilers',
										},
									},
								],
							},
						},
					},
					{
						name: 'Run Code',
						value: 'runCode',
						action: 'Run code',
						description:
							'Run a program and get its output, errors, exit code, time and memory',
						routing: {
							request: {
								method: 'POST',
								url: '/api/run-code-sync/',
								timeout: 60000,
							},
						},
					},
					{
						name: 'Run Tests',
						value: 'runTests',
						action: 'Run code against test cases',
						description:
							'Run a program against test cases and get a verdict and score for each one',
						routing: {
							request: {
								method: 'POST',
								url: '/api/run-tests/',
								timeout: 120000,
							},
						},
					},
				],
				default: 'runCode',
			},
			{
				displayName: 'Language Name or ID',
				name: 'compiler',
				type: 'options',
				typeOptions: {
					loadOptions: {
						routing: {
							request: {
								method: 'GET',
								url: '/api/compilers/',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'compilers',
										},
									},
									{
										type: 'setKeyValue',
										properties: {
											name: '={{$responseItem.name}}',
											value: '={{$responseItem.id}}',
										},
									},
									{
										type: 'sort',
										properties: {
											key: 'name',
										},
									},
								],
							},
						},
					},
				},
				default: 'python-3.14',
				required: true,
				displayOptions: {
					show: {
						operation: runOperations,
					},
				},
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: {
					send: {
						type: 'body',
						property: 'compiler',
					},
				},
			},
			{
				displayName: 'Code',
				name: 'code',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: runOperations,
					},
				},
				description: 'The source code of the program',
				routing: {
					send: {
						type: 'body',
						property: 'code',
					},
				},
			},
			{
				displayName: 'Input',
				name: 'input',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['runCode'],
					},
				},
				description: 'What the program reads from standard input',
				routing: {
					send: {
						type: 'body',
						property: 'input',
					},
				},
			},
			{
				displayName: 'Tests',
				name: 'tests',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Test',
				default: {},
				displayOptions: {
					show: {
						operation: ['runTests'],
					},
				},
				description: 'The test cases; the program runs once for each',
				options: [
					{
						name: 'test',
						displayName: 'Test',
						values: [
							{
								displayName: 'Input',
								name: 'input',
								type: 'string',
								typeOptions: {
									rows: 3,
								},
								default: '',
								description: 'What the program reads from standard input in this test',
							},
							{
								displayName: 'Expected Output',
								name: 'expectedOutput',
								type: 'string',
								typeOptions: {
									rows: 3,
								},
								default: '',
								description: 'The output the program must print to pass this test',
							},
						],
					},
				],
				routing: {
					send: {
						type: 'body',
						property: 'tests',
						value:
							'={{ ($value.test || []).map(t => ({ input: t.input, expected_output: t.expectedOutput })) }}',
					},
				},
			},
			{
				displayName: 'Scoring',
				name: 'scoring',
				type: 'options',
				options: [
					{
						name: 'All or Nothing',
						value: 'all_or_nothing',
						description: 'Score 100 only if every test passes; stops at the first failure',
					},
					{
						name: 'Percent',
						value: 'percent',
						description: 'Score is the share of tests passed; runs every test',
					},
				],
				default: 'percent',
				displayOptions: {
					show: {
						operation: ['runTests'],
					},
				},
				description: 'How the score from 0 to 100 is worked out',
				routing: {
					send: {
						type: 'body',
						property: 'scoring',
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: runOperations,
					},
				},
				options: [
					{
						displayName: 'Checker',
						name: 'checker',
						type: 'options',
						options: [
							{
								name: 'Exact',
								value: 'exact',
								description: 'The output must match byte for byte',
							},
							{
								name: 'Float',
								value: 'float',
								description: 'Numbers match within a small tolerance',
							},
							{
								name: 'Rows',
								value: 'rows',
								description: 'Lines compared as an unordered set, numbers within tolerance',
							},
							{
								name: 'Table',
								value: 'table',
								description: 'CSV tables with a header row, compared by column name, rows in any order',
							},
							{
								name: 'Table Ordered',
								value: 'table_ordered',
								description: 'CSV tables with a header row, compared by column name, rows in order',
							},
							{
								name: 'Tokens',
								value: 'tokens',
								description: 'Ignores all differences in whitespace',
							},
							{
								name: 'Trim',
								value: 'trim',
								description: 'Ignores trailing whitespace',
							},
						],
						default: 'trim',
						displayOptions: {
							show: {
								'/operation': ['runTests'],
							},
						},
						description: 'How each test output is compared with the expected output',
						routing: {
							send: {
								type: 'body',
								property: 'checker',
							},
						},
					},
					{
						displayName: 'Time Limit (Seconds)',
						name: 'timeLimit',
						type: 'number',
						typeOptions: {
							minValue: 0.1,
							maxValue: 30,
							numberPrecision: 1,
						},
						default: 5,
						description:
							'Seconds the program may run: for the whole run in Run Code (default 30), for each test in Run Tests (default 2)',
						routing: {
							send: {
								type: 'body',
								property: 'time_limit',
							},
						},
					},
				],
			},
		],
	};
}
