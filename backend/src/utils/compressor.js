/* ============================================
   StartupEvents — Zlib Compression Utility
   Syllabus: BE Unit I — Zlib module, streams, Promises
   ============================================ */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');
const logger = require('./logger');

/**
 * Compress a file using Gzip
 * Demonstrates: zlib.createGzip(), stream pipeline, async/await with streams
 *
 * @param {string} inputPath - Path to the file to compress
 * @param {string} [outputPath] - Path for the compressed file (defaults to inputPath + '.gz')
 * @returns {Promise<string>} Path to the compressed file
 */
const compressFile = async (inputPath, outputPath) => {
  const output = outputPath || `${inputPath}.gz`;

  try {
    // Using stream pipeline — pipes readable → transform → writable
    // Demonstrates: Readable stream, Transform stream (gzip), Writable stream
    await pipeline(
      fs.createReadStream(inputPath),
      zlib.createGzip({ level: 9 }), // Max compression
      fs.createWriteStream(output)
    );

    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(output).size;
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    logger.info(`Compressed: ${path.basename(inputPath)} → ${path.basename(output)} (${ratio}% reduction)`);

    return output;
  } catch (error) {
    logger.error(`Compression failed: ${error.message}`);
    throw error;
  }
};

/**
 * Decompress a Gzip file
 * Demonstrates: zlib.createGunzip(), stream pipeline
 *
 * @param {string} inputPath - Path to the .gz file
 * @param {string} [outputPath] - Path for the decompressed file
 * @returns {Promise<string>}
 */
const decompressFile = async (inputPath, outputPath) => {
  const output = outputPath || inputPath.replace('.gz', '');

  try {
    await pipeline(
      fs.createReadStream(inputPath),
      zlib.createGunzip(),
      fs.createWriteStream(output)
    );

    logger.info(`Decompressed: ${path.basename(inputPath)} → ${path.basename(output)}`);
    return output;
  } catch (error) {
    logger.error(`Decompression failed: ${error.message}`);
    throw error;
  }
};

/**
 * Compress old log files (older than specified days)
 * Demonstrates: fs.readdirSync, Date comparison, async iteration (for...of with await)
 *
 * @param {number} [daysOld=7] - Compress logs older than this many days
 */
const compressOldLogs = async (daysOld = 7) => {
  const logsDir = path.resolve(__dirname, '../../logs');

  if (!fs.existsSync(logsDir)) return;

  const files = fs.readdirSync(logsDir);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  let compressed = 0;

  for (const file of files) {
    // Skip already compressed files
    if (file.endsWith('.gz')) continue;

    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);

    if (stats.mtime < cutoff) {
      await compressFile(filePath);
      fs.unlinkSync(filePath); // Remove original after compression
      compressed++;
    }
  }

  if (compressed > 0) {
    logger.info(`Compressed ${compressed} old log file(s)`);
  }
};

module.exports = { compressFile, decompressFile, compressOldLogs };
