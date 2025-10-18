// A simple Node.js script to generate the OpenAPI spec from the compiled configuration.
const fs = require('fs');
const path = require('path');

// This path is CORRECT because tsc outputs 'src/config/swagger.ts' to 'dist/config/swagger.js'
const { swaggerSpec } = require('./dist/config/swagger'); 

const outputDir = path.join(__dirname, 'uploads');
const outputFilePath = path.join(outputDir, 'swagger.json');

// Ensure the target directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating OpenAPI specification...');

// Safely access the spec object, assuming compilation makes it a default export
const specs = swaggerSpec.default || swaggerSpec; 

// Write the formatted JSON to the uploads directory
fs.writeFileSync(outputFilePath, JSON.stringify(specs, null, 2));

console.log(`✅ OpenAPI specification generated successfully and saved to: ${outputFilePath}`);