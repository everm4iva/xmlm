# XMLM - XML Analysis Tool

A simple terminal tool that reads one or more XML files and processes them using natural language. Summarize, analyze, and compare XML files with ease.

**In a nerdy way to say:**

> XMLM is a Node.js-based CLI tool that integrates Ollama to provide smart analysis of XML files. It can generate summaries of individual files or compare multiple files to identify differences and similarities.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Ollama installed and running locally
- The XMLM model created in Ollama

### Steps

1. Clone the repository:
   ```
   git clone https://github.com/everm4iva/xmlm.git
   cd xmlm
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create the Ollama model:
   ```
   npm run model
   ```

4. Verify Ollama is running:
   ```
   npm run alive
   ```

## Usage

Start the tool with your XML file(s) and an optional task parameter.

### Basic Syntax
```
node main.js <file.xml> [task]
```

### Available Tasks
- `summary` - Generate a summary of the XML file (default)
- `compare` - Compare two or more XML files

### Examples

**Summarize a single file:**
```
node main.js ./examples/plants.xml
```

**Explicit summary:**
```
node main.js ./examples/big-books.xml summary
```

**Compare two files:**
```
node main.js ./examples/old.xml ./examples/new.xml compare
```

## Requirements

- Ollama service running on `http://localhost:11434`
- XMLM model initialized in Ollama
- Valid XML files to process

## License

See [LICENSE](./LICENSE) for more information.
