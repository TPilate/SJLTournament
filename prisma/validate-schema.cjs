/**
 * Schema validation script for Prisma
 * This script validates the schema without needing to install dependencies
 */

const fs = require('fs');

console.log('🔍 Validating Prisma schema...\n');

const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Validation rules
const errors = [];
const warnings = [];

// 1. Check for required models
const requiredModels = ['User', 'Tournament', 'Team', 'Player', 'Match', 'Stage', 'Pool', 'MatchEvent'];
requiredModels.forEach(model => {
  if (!schema.includes(`model ${model} `)) {
    errors.push(`❌ Missing required model: ${model}`);
  }
});

// 2. Check for required enums
const requiredEnums = ['UserRole', 'TournamentStatus', 'TournamentFormat', 'StageType', 'MatchMode', 'MatchStatus'];
requiredEnums.forEach(enumName => {
  if (!schema.includes(`enum ${enumName} `)) {
    errors.push(`❌ Missing required enum: ${enumName}`);
  }
});

// 3. Check relation issues
// Check Player.userId relation (should be many-to-one, not one-to-one)
if (schema.includes('user      User     @relation(fields: [userId], references: [id])')) {
  if (!schema.includes('player        Player?') && !schema.includes('player        Player[]')) {
    warnings.push(`⚠️  User.model should have a 'player' field for the Player relation`);
  }
}

// Check Match.lastEditor relation
if (schema.includes('lastEditor      User?       @relation(')) {
  if (!schema.includes('editedMatches Match[]')) {
    errors.push(`❌ User model missing 'editedMatches' field for Match.lastEditor relation`);
  }
}

// Check MatchEvent.editor relation
if (schema.includes('editor      User     @relation(')) {
  if (!schema.includes('editedEvents  MatchEvent[]')) {
    errors.push(`❌ User model missing 'editedEvents' field for MatchEvent.editor relation`);
  }
}

// 4. Check for unique constraints where needed
if (!schema.includes('@unique([userId, teamId])')) {
  warnings.push(`⚠️  Player model should have unique constraint on [userId, teamId]`);
}

// 5. Check for indexes
const importantIndexes = [
  '[email]',
  '[tournamentId]',
  '[status]',
  '[startTime]',
  '[locked]'
];

importantIndexes.forEach(index => {
  if (!schema.includes(`@index([${index}`)) {
    warnings.push(`⚠️  Missing index on ${index}`);
  }
});

// 6. Check for required fields
const requiredFields = [
  'id',
  'createdAt',
  'updatedAt'
];

requiredFields.forEach(field => {
  if (!schema.includes(`  ${field} `) && !schema.includes(`  ${field}\t`)) {
    warnings.push(`⚠️  Models should have ${field} field`);
  }
});

// Display results
if (errors.length > 0) {
  console.log('❌ SCHEMA VALIDATION FAILED\n');
  console.log('Errors:');
  errors.forEach(err => console.log(`  ${err}`));
  console.log('\nPlease fix these errors before running `npx prisma generate`');
  process.exit(1);
} else {
  console.log('✅ SCHEMA VALIDATION PASSED\n');
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warn => console.log(`  ${warn}`));
    console.log('');
  }
  
  console.log('Your Prisma schema is valid!');
  console.log('\n📋 Next steps:');
  console.log('  1. Make sure you have a PostgreSQL database running');
  console.log('  2. Configure your .env file with DATABASE_URL');
  console.log('  3. Run: npx prisma generate');
  console.log('  4. Run: npx prisma migrate dev');
  console.log('  5. Run: npx prisma db push (optional)');
  
  process.exit(0);
}
