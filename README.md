# n8n-nodes-onlinecompiler

An [n8n](https://n8n.io) community node for [OnlineCompiler.io](https://onlinecompiler.io): run code in 46 languages and judge it against test cases. Every run starts in a fresh sandbox (gVisor) with no network, so it is safe for code you didn't write, including code an AI agent wrote.

n8n's own Code node runs JavaScript and Python inside your n8n instance. Use this node when you need another language (C, C++, Java, Go, Rust, SQL, R and 40 more), an isolated sandbox for untrusted code, or a verdict for each test case.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Examples](#examples) · [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n documentation and install `n8n-nodes-onlinecompiler`.

## Operations

- **Run Code**: runs a program with optional standard input and returns `output`, `error`, `status`, `exit_code`, `time` (seconds) and `memory` (KB).
- **Run Tests**: runs a program once per test case and returns an overall `verdict`, a `score` from 0 to 100, `passed`, `total` and a verdict for each test. Choose how output is compared (trim, exact, tokens, float, rows, table, table ordered) and how the score is worked out (percent, or all or nothing).
- **List Compilers**: returns every language with the compiler ID to use in the other operations (one item per language).

The node can also be used as a tool by n8n's AI Agent, so an agent can run the code it writes and see the result.

Limits per run: 30 seconds, 512 MB of memory (up to 2 GB on Pro and above) and no network.

## Credentials

1. Sign in at [onlinecompiler.io](https://onlinecompiler.io) (Google or an email link).
2. Create a REST API key on the [API Keys page](https://api.onlinecompiler.io/compilers/api-keys/).
3. In n8n, create an **OnlineCompiler.io API** credential and paste the key.

The free plan includes 100,000 runs a month, commercial use allowed, no credit card. Each test in Run Tests counts as one run. See [pricing](https://onlinecompiler.io/pricing).

## Examples

**Run a C++ program from a form or webhook.** Set Language to `C++ (g++ 15)` (ID `g++-15`), put `{{ $json.code }}` in Code and `{{ $json.input }}` in Input. The next node gets `output` and `exit_code`.

**Grade student submissions.** Use Run Tests with the exercise's test cases, Scoring set to Percent, and write `score` and `verdict` back to a sheet or your LMS.

**Let an AI agent check its own code.** Add the node as a tool to an AI Agent with Run Code; the agent sends the program and reads the output before answering.

## Compatibility

Built with n8n's node CLI for n8n 1.x (nodes API version 1). The node uses only n8n's built-in request handling and has no runtime dependencies.

## Resources

- [OnlineCompiler.io API documentation](https://onlinecompiler.io/docs)
- [Languages and compiler IDs](https://onlinecompiler.io/languages)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## License

[MIT](LICENSE)
