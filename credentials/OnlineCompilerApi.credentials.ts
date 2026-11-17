import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OnlineCompilerApi implements ICredentialType {
	name = 'onlineCompilerApi';

	displayName = 'OnlineCompiler.io API';

	icon = 'file:../nodes/OnlineCompiler/onlinecompiler.svg' as const;

	documentationUrl = 'https://github.com/onlinecompiler-io/n8n-nodes-onlinecompiler?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'A REST API key from the API Keys page of your OnlineCompiler.io dashboard (https://api.onlinecompiler.io/compilers/api-keys/). The free plan includes 100,000 runs a month.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// The usage endpoint checks the key without spending a run.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.onlinecompiler.io',
			url: '/api/usage/',
		},
		rules: [
			{
				// The API answers an unknown or disabled key with 404.
				type: 'responseCode',
				properties: {
					value: 404,
					message: 'The API key was not found or is disabled. Copy a REST API key from your dashboard.',
				},
			},
		],
	};
}
