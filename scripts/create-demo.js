#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: pnpm demo <section> <name>');
  console.error('Example: pnpm demo fun MyDemo');
  process.exit(1);
}

const section = args[0];
const name = args[1];

// Convert name to PascalCase
const toPascalCase = (str) => {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
};

const pascalName = toPascalCase(name);

// Section mappings
const sectionMap = {
  basic: { router: 'basic.js', viewFolder: 'Basics', componentFolder: 'basics' },
  complex: { router: 'complex_demos.js', viewFolder: 'Complex', componentFolder: 'complex' },
  controls: { router: 'controls_demos.js', viewFolder: 'Controls', componentFolder: 'controls' },
  fun: { router: 'fun.js', viewFolder: 'Fun', componentFolder: 'fun' },
  html: { router: 'html_demos.js', viewFolder: 'HTML', componentFolder: 'html_demos' },
  shaders: { router: 'shaders.js', viewFolder: 'Shaders', componentFolder: 'shaders' },
  textures: { router: 'textures_effects.js', viewFolder: 'Textures_effects', componentFolder: 'Textures_effects' }
  ,noc: { router: 'nature_of_code.js', viewFolder: 'Noc', componentFolder: 'noc' }
  ,random: { router: 'random.js', viewFolder: 'Random', componentFolder: 'random' }
};

if (!sectionMap[section]) {
  console.error(`Invalid section: ${section}`);
  console.error(`Available sections: ${Object.keys(sectionMap).join(', ')}`);
  process.exit(1);
}

const { router: routerFile, viewFolder, componentFolder } = sectionMap[section];

// Define paths
const projectRoot = path.join(__dirname, '..');
const viewPath = path.join(projectRoot, 'src', 'views', viewFolder, `${pascalName}View.vue`);
const componentPath = path.join(projectRoot, 'src', 'components', 'demos', componentFolder, `${pascalName}Demo.vue`);
const routerPath = path.join(projectRoot, 'src', 'router', routerFile);

// Create View template
const viewTemplate = `<script setup>
import { TresCanvas } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import TheExperience from "@/components/demos/${componentFolder}/${pascalName}Demo.vue";
</script>
<template>
    <TresCanvas window-size clear-color="#111">
      <TresPerspectiveCamera :position="[0, 0, 15]" />
      <OrbitControls />
      <Suspense>
        <TheExperience />
      </Suspense>
    </TresCanvas>
</template>
`;

// Create Component template
const componentTemplate = `<script setup></script>
<template>
  <TresMesh>
    <TresBoxGeometry />
    <TresMeshBasicMaterial />
  </TresMesh>
</template>
`;

// Function to create file if it doesn't exist
const createFile = (filePath, content) => {
  if (fs.existsSync(filePath)) {
    console.error(`File already exists: ${filePath}`);
    return false;
  }
  
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Created: ${filePath}`);
  return true;
};

// Function to add route entry
const addRouteEntry = (routerPath, name) => {
  let content = fs.readFileSync(routerPath, 'utf8');
  
  // Find the routes array. Prefer *_routes, but fall back to any const array = [
  let arrayMatch = content.match(/const\s+\w+_routes\s*=\s*\[/);
  if (!arrayMatch) {
    arrayMatch = content.match(/const\s+\w+\s*=\s*\[/);
  }
  if (!arrayMatch) {
    console.error('Could not find routes array in router file');
    return false;
  }
  
  const newEntry = `  {
    name: '${name}',
    description: ''
  },`;
  
  // Parse existing routes to maintain alphabetical order
  const routesRegex = /{\s*name:\s*['"]([^'"]+)['"]/g;
  const routes = [];
  let match;
  
  while ((match = routesRegex.exec(content)) !== null) {
    routes.push(match[1]);
  }
  
  // Check if route already exists
  if (routes.includes(name)) {
    console.error(`Route '${name}' already exists in ${routerFile}`);
    return false;
  }
  
  // Find insertion point (alphabetical order)
  routes.push(name);
  routes.sort();
  const insertIndex = routes.indexOf(name);
  
  // Find the actual position in the file
  if (insertIndex === 0) {
    // Insert at the beginning
    const arrayStartIndex = content.indexOf('[', arrayMatch.index) + 1;
    content = content.slice(0, arrayStartIndex) + '\n' + newEntry + '\n' + content.slice(arrayStartIndex);
  } else {
    // Find the route before this one
    const previousRoute = routes[insertIndex - 1];
    const previousRouteRegex = new RegExp(`{\\s*name:\\s*['"]${previousRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"][^}]*}\\s*,`, 's');
    const previousMatch = previousRouteRegex.exec(content);
    
    if (previousMatch) {
      const insertPosition = previousMatch.index + previousMatch[0].length;
      content = content.slice(0, insertPosition) + '\n' + newEntry + content.slice(insertPosition);
    } else {
      // Fallback: insert at the end of the array
      const closingBracketIndex = content.lastIndexOf(']');
      content = content.slice(0, closingBracketIndex) + newEntry + '\n' + content.slice(closingBracketIndex);
    }
  }
  
  fs.writeFileSync(routerPath, content, 'utf8');
  console.log(`✓ Added route entry to: ${routerFile}`);
  return true;
};

// Create files
console.log(`\nCreating demo: ${pascalName} in section: ${section}\n`);

const viewCreated = createFile(viewPath, viewTemplate);
const componentCreated = createFile(componentPath, componentTemplate);
const routeAdded = addRouteEntry(routerPath, pascalName);

if (viewCreated && componentCreated && routeAdded) {
  console.log(`\n✓ Demo '${pascalName}' created successfully!`);
  console.log(`\nFiles created:`);
  console.log(`  - ${path.relative(projectRoot, viewPath)}`);
  console.log(`  - ${path.relative(projectRoot, componentPath)}`);
  console.log(`  - Updated: ${routerFile}`);
  console.log(`\nDon't forget to add a description in ${routerFile}!`);
} else {
  console.log('\n✗ Demo creation failed. Please check the errors above.');
  process.exit(1);
}
