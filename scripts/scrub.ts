import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';

/**
 * AMNESIA PROTOCOL // CLI_SCRUBBER_v1.1
 * ------------------------------------
 * High-performance metadata erasure for visual assets.
 */

async function scrubDirectory(inputDir: string) {
  // Normalize input path
  const absoluteInput = path.resolve(inputDir);
  const outputDir = path.join(process.cwd(), 'amnesia_scrubbed_' + Date.now());
  
  console.log('\x1b[38;5;45m%s\x1b[0m', '>> AMNESIA_CLI_PROTOCOL_INIT');
  console.log(`[TARGET]: ${absoluteInput}`);
  console.log(`[OUTPUT]: ${outputDir}`);
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
    
    // Support common formats
    const files = await glob(`${inputDir}/**/*.{jpg,jpeg,png,webp,tiff}`, { posix: true });
    
    if (files.length === 0) {
      console.log('\x1b[38;5;208m%s\x1b[0m', '!! WARN: Zero compatible assets detected at target.');
      return;
    }

    console.log(`[READY]: Scrubbing ${files.length} assets...`);

    let scrubbedCount = 0;
    
    for (const file of files) {
      const fileName = path.basename(file);
      const targetPath = path.join(outputDir, fileName);
      
      try {
        await sharp(file)
          .withMetadata({}) // Explicitly strip all metadata
          .toFile(targetPath);
        
        process.stdout.write('\x1b[38;5;45m.\x1b[0m');
        scrubbedCount++;
      } catch (err) {
        process.stdout.write('\x1b[38;5;196mF\x1b[0m');
      }
    }

    console.log('\n\n\x1b[38;5;45m%s\x1b[0m', '<< WIPE_SUCCESSFUL');
    console.log(`PROCESSED: ${scrubbedCount} ASSETS`);
    console.log(`LOCATION: ${outputDir}`);

  } catch (error) {
    console.error('\x1b[38;5;196m%s\x1b[0m', '!! SYSTEM_FAILURE: Scrub protocol aborted.');
    console.error(error);
  }
}

const target = process.argv[2];
if (!target) {
  console.log('\x1b[38;5;196m%s\x1b[0m', 'ERROR: Target directory required.');
  console.log('Use: npm run scrub -- <path>');
} else {
  scrubDirectory(target);
}
