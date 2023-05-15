# log-analyzer

- This repository contains the code for a coding exercise project.

## Description

This project serves as a log-analyzer. It includes dependencies, development dependencies, and scripts for running, testing, and linting the code.

### Task Includes:

The task is to parse a log file containing HTTP requests and to report on its contents. For a given log file we want to know:

1. The number of unique IP addresses
2. The top 3 most visited URLs
3. The top 3 most active IP addresses

### Installation

To install the project and its dependencies, follow these steps:

1. Clone the repository:

   ```shell
    git clone https://github.com/priyapatel1412/log-analyzers.git
   ```

2. Navigate to the project directory

   ```shell
   cd log-analyzers
   ```

3. Install the dependencies

   ```shell
   npm install
   ```

## Dev Quick Start

The following scripts are available for usage:

1. Install all the dependencies

- start: Starts the project by running the main script. Use the following command:

  ```shell
   npm start
  ```

- test: Runs the test suite using Jest. Use the following command:
  ```shell
  npm test
  ```
- lint: Checks the code for quality and style issues using ESLint. Use the following command:
  ```shell
  npm run lint
  ```

### Command Line File Input for npm start
This project utilizes a command line interface to specify a file input for the `npm start` command. The file input is passed as the third command line argument, following the `npm start` command.

#### Usage
To run the application with a file input, use the following command:
  ```shell
   npm start <file-input>
  ```
  - Replace <`file-input`> with the desired file name or path.

  - If no file input is provided as a command line argument, the application will prompt the user to enter a file input interactively. If the user does not provide any input, the application will use a default file as the input.

#### Example: 
- To run the application with the file sample.log, use the following command:

```shell
npm start sample.log
```

- If you do not provide a file input, the application will prompt you to enter a file input:
```shell
npm start
```
```shell
Please enter a file path:
```
- Enter the desired file name or path, and press Enter to proceed.

- If you do not provide any input at this prompt, the application will use the default file as the input.
### Dependencies

The project has the following dependencies:

- lodash: ^4.17.21

These dependencies are automatically installed during the installation process.

### Development Dependencies

- eslint: ^8.32.0
- eslint-config-google: ^0.14.0
- eslint-config-standard: ^17.0.0
- eslint-plugin-import: ^2.27.5
- eslint-plugin-n: ^15.6.1
- eslint-plugin-promise: ^6.1.1
- jest: ^27.5.1

These development dependencies are used for linting, testing, and code quality checks during the development process. They are automatically installed during the installation process.
