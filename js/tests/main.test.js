const fs = require('fs');
const readline = require('readline');

const {
  parseFile,
  getFileExtension,
  isValidExtension,
  createLineReader,
  extractIpAddresses,
  extractUrl,
  writeUnmatchedIpToFile,
  getUniqueIpCount,
  getTopThreeValues,
  handleFileInput,
} = require('../main');

// Mock dependencies
jest.mock('fs');
jest.mock('readline');

// Test for parseFile function
describe('parseFile', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should handle invalid file extension', async () => {
    const fileInput = 'file.txt';
    await parseFile(fileInput);

    expect(console.error).toHaveBeenCalledWith(
        'Invalid file extension: .txt',
    );
  });
  test('should handle file reading error', async () => {
    const fileInput = 'nonexistent-file.log';
    const errorMessage = 'Error occurred while reading the file:';
    const mockError = new Error(errorMessage);
    fs.createReadStream.mockImplementationOnce(() => {
      throw mockError; // Simulate an error while creating the read stream
    });

    await parseFile(fileInput);
    // Expect console.error to be called with the correct error message
    expect(console.error).toHaveBeenCalledWith(
        'Error occurred while reading the file:',
        mockError,
    );
  });

  test('should parse the file correctly', async () => {
    const fileInput = 'file.log';

    // Mock dependencies
    const lineReaderMock = {
      on: jest.fn(),
      close: jest.fn(),
    };
    fs.createReadStream.mockReturnValueOnce('readStream');
    readline.createInterface.mockReturnValueOnce(lineReaderMock);

    await parseFile(fileInput);

    expect(fs.createReadStream).toHaveBeenCalledWith(fileInput, {
      encoding: 'UTF8',
    });
    expect(readline.createInterface).toHaveBeenCalledWith({
      input: 'readStream',
    });
    expect(lineReaderMock.on).toHaveBeenCalledWith(
        'line',
        expect.any(Function),
    );
    expect(lineReaderMock.on).toHaveBeenCalledWith(
        'close',
        expect.any(Function),
    );
  });

  test('should handle empty file', async () => {
    const errorMessage =`File is empty: empty-file.log`;
    const fileInput = 'empty-file.log';

    const lineReaderMock = {
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          callback(); // Invoke the close callback
        }
      }),
    };

    // Mock fs.createReadStream to return a dummy value 'readStream'
    fs.createReadStream.mockReturnValueOnce('readStream');
    // Mock readline.createInterface to return the lineReaderMock
    readline.createInterface.mockReturnValueOnce(lineReaderMock);
    await parseFile(fileInput);
    // Expect lineReaderMock.on to have been called for the 'close' event
    expect(lineReaderMock.on).toHaveBeenCalledWith('close', expect.any(Function));
    // Expect console.error to be called with the correct message
    expect(console.error).toHaveBeenCalledWith(errorMessage);
  });
});

// Test for getFileExtension function
describe('getFileExtension', () => {
  test('should return the file extension', () => {
    const filePath = 'path/to/file.log';
    const result = getFileExtension(filePath);
    expect(result).toBe('.log');
  });
});

// Test for isValidExtension function
describe('isValidExtension', () => {
  test('should return true for valid extension', () => {
    const fileExt = '.log';
    const result = isValidExtension(fileExt);
    expect(result).toBe(true);
  });

  test('should return false for invalid extension', () => {
    const fileExt = '.txt';
    const result = isValidExtension(fileExt);
    expect(result).toBe(false);
  });
});

// Test for createLineReader function
describe('createLineReader', () => {
  test('should create a line reader', () => {
    const fileInput = 'file.log';
    const readStreamMock = 'readStream';
    const lineReaderMock = 'lineReader';

    // Mock dependencies
    fs.createReadStream.mockReturnValueOnce(readStreamMock);
    readline.createInterface.mockReturnValueOnce(lineReaderMock);

    const result = createLineReader(fileInput);

    expect(fs.createReadStream).toHaveBeenCalledWith(fileInput, {
      encoding: 'UTF8',
    });
    expect(readline.createInterface).toHaveBeenCalledWith({
      input: readStreamMock,
    });
    expect(result).toBe(lineReaderMock);
  });
});

// Test for extractIpAddresses function
describe('extractIpAddresses', () => {
  test('should extract IP addresses from a line', () => {
    const line = '177.71.128.21 - - [10/Jul/2018:22:21:28 +0200] "GET /intranet-analytics/ HTTP/1.1" 200 3574 "-" "Mozilla/5.0 (X11; U; Linux x86_64; fr-FR) AppleWebKit/534.7 (KHTML, like Gecko) Epiphany/2.30.6 Safari/534.7"';
    const result = extractIpAddresses(line);
    expect(result).toEqual(['177.71.128.21']);
  });

  test('should return an empty array if no IP addresses found', () => {
    const line = 'No IP addresses in this line';
    const result = extractIpAddresses(line);
    expect(result).toEqual([]);
  });
});

// Test for extractUrl function
describe('extractUrl', () => {
  test('should extract URL from a line', () => {
    const line = 'GET /api/users HTTP/1.1';
    const result = extractUrl(line);
    expect(result).toBe('/api/users');
  });

  test('should return undefined if URL not found', () => {
    const line = 'No URL in this line';
    const result = extractUrl(line);
    expect(result).toBeUndefined();
  });
});

// Test for writeUnmatchedIpToFile function
describe('writeUnmatchedIpToFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should write the unmatched IP address to the file', () => {
    const writeStreamMock = {
      write: jest.fn(),
      end: jest.fn(),
    };

    fs.createWriteStream.mockReturnValueOnce(writeStreamMock);

    const line = 'dynip42.efn.org - [01/Jul/1995:00:02:15 -0400] "GET /history/apollo/images/footprint-small.gif HTTP/1.0" 200 18149';

    // Execution
    writeUnmatchedIpToFile(line);

    expect(fs.createWriteStream).toHaveBeenCalledWith('unmatchedIPs.log', {flags: 'a'});
    expect(writeStreamMock.write).toHaveBeenCalledWith(line + '\n', expect.any(Function));
    expect(writeStreamMock.end).toHaveBeenCalled();
  });

  it('should handle write error and log error message', async () => {
    const line = 'dynip42.efn.org - [01/Jul/1995:00:02:15 -0400] "GET /history/apollo/images/footprint-small.gif HTTP/1.0" 200 18149'; // Example unmatched IP address
    const errorMessage = 'Error writing unmatched IP address to file:';
    const mockError = new Error(errorMessage);


    console.error = jest.fn();
    // Mock the behavior of fs.createReadStream
    fs.createWriteStream.mockReturnValueOnce({
      write: jest.fn().mockImplementation((event, callback) => {
        callback(mockError);
      }),
      end: jest.fn(),
    });

    writeUnmatchedIpToFile(line);

    expect(console.error).toHaveBeenCalledWith('Error writing unmatched IP address to file:', expect.any(Error));
  });
});

// This test case is for a function called `getUniqueIpCount`.
describe('getUniqueIpCount', () => {
  it('returns the number of unique IP addresses in an array', () => {
    const ipAddresses = ['10.0.0.1', '10.0.0.2', '10.0.0.1', '192.168.0.1'];
    expect(getUniqueIpCount(ipAddresses)).toBe(3);
  });

  it('returns 0 when passed an empty array', () => {
    const ipAddresses = [];
    expect(getUniqueIpCount(ipAddresses)).toBe(0);
  });
});

describe('getTopThreeValues', () => {
  test('should return an empty array for an empty input array', () => {
    const values = [];
    const result = getTopThreeValues(values);
    expect(result).toEqual([]);
  });

  it('should return all the unique values for an input array with length <= 3', () => {
    expect(getTopThreeValues(['192.168.0.1'])).toEqual(['192.168.0.1']);
    expect(getTopThreeValues(['192.168.0.1', '168.41.191.40'])).toEqual(['192.168.0.1', '168.41.191.40']);
    expect(getTopThreeValues(['177.71.128.21', '168.41.191.40', '168.41.191.9'])).toEqual(['177.71.128.21', '168.41.191.40', '168.41.191.9']);
  });
  it('should return top three values in descending order of their occurrences', () => {
    expect(getTopThreeValues(['177.71.128.21', '168.41.191.40', '168.41.191.9', '177.71.128.21', '177.71.128.21', '168.41.191.9', '168.41.191.40'])).toEqual(['177.71.128.21', '168.41.191.40', '168.41.191.9']);
  });
});

describe('handleFileInput', () => {
  beforeEach(() => {
    // Store the original process.argv
    originalArgv = process.argv;

    // Mock console.error method
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock console.log method
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    // Restore process.argv to the original value
    process.argv = originalArgv;

    // Restore the original implementation of console.error
    jest.clearAllMocks();
  });

  test('should handle file input from command line arguments', () => {
    // Set the command line argument to a file path
    process.argv[2] = 'file.log';

    // Mock file existence check
    fs.access.mockImplementation((file, mode, callback) => {
      if (file === 'file.log') {
        callback(null);
      } else {
        callback(new Error('File not found'));
      }
    });
    handleFileInput();

    // Verify the console output
    expect(console.log).toHaveBeenCalledWith('Using file: file.log');
  });

  test('should handle empty file input from user prompt', () => {
    // Mock readline interface for user input
    readline.createInterface.mockReturnValue({
      question: jest.fn().mockImplementationOnce((question, callback) => {
        callback('');
      }),
      close: jest.fn(),
    });
    handleFileInput();

    // Verify the console output
    expect(console.log).toHaveBeenCalledWith('Using file: file.log');
  });

  test('should handle file input from command line arguments when file does not exist', () => {
    // Set the command line argument to a non-existing file path
    process.argv[2] = 'nonexistent.log';
    // Mock file existence check
    fs.access.mockImplementation((file, mode, callback) => {
      if (file === 'nonexistent.log') {
        callback(new Error('Error accessing file: nonexistent.log'));
      } else {
        callback(null);
      }
    });
    handleFileInput();
    // Verify the console output
    expect(console.error).toHaveBeenCalledWith('Error accessing file: nonexistent.log');
  });
});
