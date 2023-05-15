const fs = require('fs');
const _ = require('lodash');
const readline = require('readline');
const encoding = 'UTF8';

const validExtensions = ['.log'];

// async function that reads and processes a file.
const parseFile = async (fileInput) => {
  try {
    // Get the file extension
    const fileExt = getFileExtension(fileInput);
    // Check if the file extension is valid
    if (!isValidExtension(fileExt)) {
      console.error(`Invalid file extension: ${fileExt}`);
      return;
    }
    // Create a line reader to read the file line by line
    const lineReader = createLineReader(fileInput);
    // Arrays to store extracted data
    const ipAddresses = [];
    const urls = [];
    // Flag to track if the file is empty
    let isEmptyFile = true;

    // Event handler for each line of the file
    lineReader.on('line', (line) => {
      // Extract the URL from the line and add it to the urls array
      const extractedUrl = extractUrl(line);
      urls.push(extractedUrl);
      // Extract the IP addresses from the line and add them to the appropriate array
      const extractedIpAddresses = extractIpAddresses(line);
      extractedIpAddresses.length > 0 ? ipAddresses.push(...extractedIpAddresses) : writeUnmatchedIpToFile(line);
      // If any line is read, mark the file as non-empty
      isEmptyFile = false;
    });
    // Event handler for when the line reader finishes reading the file
    lineReader.on('close', () => {
      if (isEmptyFile) {
        console.error(`File is empty: ${fileInput}`);
        return;
      }
      // Get the count of unique IP addresses and log it
      const uniqueIpCount = getUniqueIpCount(ipAddresses);
      console.log(`Number of unique IP addresses: ${uniqueIpCount}`);
      // Get the top three IP addresses and log them
      const topThreeIpAddresses = getTopThreeValues(ipAddresses);
      console.log(`Top three IP addresses: ${topThreeIpAddresses.join(', ')}`);
      // Get the top three most visited URLs and log them
      const topThreeVisitedUrls = getTopThreeValues(urls);
      console.log(`Top three most visited URLs: ${topThreeVisitedUrls.join(', ')}`);
      console.log('Processing completed.');
    });
  } catch (error) {
    console.error('Error occurred while reading the file:', error);
  }
};

// Get the file extension from a file path
const getFileExtension = (filePath) => {
  return filePath.substr(filePath.lastIndexOf('.')).toLowerCase();
};

// Check if a file extension is valid based on the validExtensions array
const isValidExtension = (fileExt) => {
  return validExtensions.includes(fileExt);
};

// Create a line reader for a given file
const createLineReader = (fileInput) => {
  // Create a read stream for the file
  const readStream = fs.createReadStream(fileInput, {encoding});

  // Create a line reader interface using the read stream
  return readline.createInterface({input: readStream});
};

// Extract IP addresses from a line
const extractIpAddresses = (line) => {
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  return line.match(ipRegex) || [];
};

// It extracts the part after the matched keyword and before the ' HTTP' delimiter.
// Finally, it filters out any undefined URLs.
const extractUrl = (line) => {
  return line
      .split(/GET|PUT|POST|DELETE/)[1]
      ?.split(' HTTP')[0]
      ?.split(' ')
      .filter((url) => url !== undefined && url !== '')
      .join('');
};

const writeUnmatchedIpToFile = (line) => {
  // Create a writable stream to write unmatched IP addresses to a file
  const writeStream = fs.createWriteStream('unmatchedIPs.log', {flags: 'a'});

  // Write the unmatched IP address to the writable stream
  writeStream.write(line + '\n', (error) => {
    if (error) {
      console.error('Error writing unmatched IP address to file:', error);
    }
  });
  // Close the writable stream
  writeStream.end();
};

// Get the count of unique IP addresses
const getUniqueIpCount = (ipAddresses) => _.uniq(ipAddresses).length;

// Retrieves the top three visited URLs from an array of logs.
const getTopThreeValues = (values) => {
  return Object.entries(values.reduce(function(acc, value) {
    return acc[value] ? ++acc[value] : (acc[value] = 1), acc;
  }, {}),
  )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((i) => i[0])
      .flat();
};

// Handle file input
const handleFileInput = () => {
  // Get the file input from command line arguments
  const fileInput = process.argv[2];

  // If no file input is provided, create an interface for reading user input from the command line
  if (!fileInput) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Prompt the user to enter a file path
    readline.question('Please enter a file path: ', (filePath) => {
      if (filePath === '') {
        console.log('Using default file: file.log');
      } else {
        console.log(`Using file: ${filePath}`);
      }

      // Set the file input to the entered file path or use the default 'file.log'
      const selectedFileInput = filePath || 'file.log';
      readline.close();
      parseFile(selectedFileInput);
    });
  } else {
    console.log(`Using file: ${fileInput}`);
    // Check for the existence of the file
    fs.access(fileInput, fs.constants.F_OK, (err) => {
      if (err) {
        // Indicates that the file does not exist
        if (err.code === 'ENOENT') {
          console.error(`File not found: ${fileInput}`);
        } else {
          console.error(`Error accessing file: ${fileInput}`);
        }
      } else {
        parseFile(fileInput);
      }
    });
  }
};

handleFileInput();

module.exports = {
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
};
