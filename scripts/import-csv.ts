import { Category, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface CSVRow {
  type: string;
  amount: string;
  day: string;
  store: string;
}

interface TransactionData {
  name: string;
  amount: number;
  date: Date;
  categoryId: number;
}

interface ImportOptions {
  csvPath: string;
  month: number;
  year: number;
}

interface CategoryPrompt {
  name: string;
  description: string;
  type: 'CREDIT' | 'DEBIT';
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function promptForCategory(
  categoryName: string,
  existingCategories: Map<string, Category>,
): Promise<CategoryPrompt> {
  console.log(`\n📝 Creating new category: "${categoryName}"`);

  // Ask for name (with default)
  const name = await question(`Category name (default: "${categoryName}"): `);
  const finalName = name || categoryName;

  const existingCategory = existingCategories.get(finalName.toLowerCase());

  if (existingCategory) {
    console.log(`\n✅ Found existing category: "${finalName}" (${existingCategory.type})`);
    console.log(`   Reusing existing category for future "${categoryName}" entries`);
    return {
      name: finalName,
      description: existingCategory.description,
      type: existingCategory.type,
    };
  }

  // Ask for description
  const description = await question(`Description: `);

  // Ask for type with options
  let type: 'CREDIT' | 'DEBIT';
  while (true) {
    const typeInput = (await question(`Type (CREDIT/DEBIT) [default: DEBIT]: `)).toUpperCase();
    if (typeInput === 'CREDIT' || typeInput === 'DEBIT') {
      type = typeInput;
      break;
    } else if (typeInput === '') {
      type = 'DEBIT';
      break;
    } else {
      console.log('❌ Please enter CREDIT or DEBIT');
    }
  }

  return {
    name: finalName,
    description: description || `Imported from CSV - ${finalName}`,
    type,
  };
}

function parseArguments(): ImportOptions {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: bun run scripts/import-csv.ts <csv-path> <month> <year>');
    console.error('Example: bun run scripts/import-csv.ts ./scripts/march-2025.csv 3 2025');
    console.error('');
    console.error('Arguments:');
    console.error('  csv-path: Path to the CSV file');
    console.error('  month: Month number (1-12)');
    console.error('  year: Year (e.g., 2025)');
    process.exit(1);
  }

  const [csvPath, monthStr, yearStr] = args;

  // Validate month
  const month = parseInt(monthStr);
  if (isNaN(month) || month < 1 || month > 12) {
    console.error('Error: Month must be a number between 1 and 12');
    process.exit(1);
  }

  // Validate year
  const year = parseInt(yearStr);
  if (isNaN(year) || year < 1900 || year > 2100) {
    console.error('Error: Year must be a number between 1900 and 2100');
    process.exit(1);
  }

  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  return {
    csvPath,
    month,
    year,
  };
}

async function main() {
  try {
    const options = parseArguments();

    console.log('Starting CSV import process...');
    console.log(`CSV Path: ${options.csvPath}`);
    console.log(`Month: ${options.month}`);
    console.log(`Year: ${options.year}`);
    console.log('');

    // Read the CSV file
    const csvContent = fs.readFileSync(options.csvPath, 'utf-8');

    // Parse CSV content
    const lines = csvContent.split('\n').filter((line) => line.trim() !== '');
    const headers = lines[0].split(',').map((h) => h.trim());

    console.log('CSV Headers:', headers);

    // Validate headers
    const expectedHeaders = ['Type', 'Amount', 'Day', 'Store'];
    const hasValidHeaders = expectedHeaders.every((header) =>
      headers.some((h) => h.toLowerCase() === header.toLowerCase()),
    );

    if (!hasValidHeaders) {
      throw new Error(`Invalid CSV headers. Expected: ${expectedHeaders.join(', ')}`);
    }

    // Parse rows
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());

      // Validate row has exactly 4 values
      if (values.length < 4) {
        throw new Error(
          `Row ${i + 1} has ${values.length} values but expected exactly 4. Found: ${values.join(', ')}`,
        );
      }

      if (values.length > 4 && values[4] !== '') {
        throw new Error(
          `Row ${i + 1} has ${values.length} values but expected exactly 4. Found: ${values.join(', ')}`,
        );
      }

      rows.push({
        type: values[0],
        amount: values[1],
        day: values[2],
        store: values[3],
      });
    }

    console.log(`Found ${rows.length} rows to process`);

    // Get all existing categories
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} existing categories`);

    // Create a map for quick category lookup
    const categoryMap = new Map(categories.map((cat) => [cat.name.toLowerCase(), cat]));

    // Process each row
    const transactionsToCreate: TransactionData[] = [];
    const skippedRows: string[] = [];
    const createdCategories: string[] = [];

    for (const row of rows) {
      try {
        // Parse amount (remove $ and convert to number)
        const amountStr = row.amount.replace(/[$,]/g, '');
        const amount = parseFloat(amountStr);

        if (isNaN(amount)) {
          console.warn(`Skipping row with invalid amount: ${row.amount}`);
          skippedRows.push(`Invalid amount: ${row.amount}`);
          continue;
        }

        // Parse date using provided month and year
        const day = parseInt(row.day);
        if (isNaN(day) || day < 1 || day > 31) {
          console.warn(`Skipping row with invalid day: ${row.day}`);
          skippedRows.push(`Invalid day: ${row.day}`);
          continue;
        }

        // Validate the date is valid for the given month/year
        const date = new Date(options.year, options.month - 1, day); // Month is 0-indexed
        if (date.getMonth() !== options.month - 1 || date.getFullYear() !== options.year) {
          console.warn(`Skipping row with invalid date: ${options.month}/${day}/${options.year}`);
          skippedRows.push(`Invalid date: ${options.month}/${day}/${options.year}`);
          continue;
        }

        // Check if category exists
        const categoryName = row.type.trim();
        let category = categoryMap.get(categoryName.toLowerCase());

        // If category doesn't exist, prompt user to create it
        if (!category) {
          console.log(`\n⚠️  Category not found: "${categoryName}"`);

          const categoryPrompt = await promptForCategory(categoryName, categoryMap);

          // Check if the user-entered name already exists as a category
          const existingCategory = categoryMap.get(categoryPrompt.name.toLowerCase());

          if (existingCategory) {
            console.log(
              `\n✅ Found existing category: "${categoryPrompt.name}" (${existingCategory.type})`,
            );
            console.log(`   Reusing existing category for future "${categoryName}" entries`);
            category = existingCategory;
          } else {
            console.log(
              `\n✅ Creating new category: "${categoryPrompt.name}" (${categoryPrompt.type})`,
            );

            category = await prisma.category.create({
              data: {
                name: categoryPrompt.name,
                description: categoryPrompt.description,
                type: categoryPrompt.type,
              },
            });

            categoryMap.set(categoryPrompt.name.toLowerCase(), category);
            createdCategories.push(categoryPrompt.name);
          }

          // Map the original CSV category name to the selected category for future use
          categoryMap.set(categoryName.toLowerCase(), category);
        }

        // Prepare transaction data
        const transactionData: TransactionData = {
          name: row.store.trim() || categoryName,
          amount: amount,
          date: date,
          categoryId: category.categoryId,
        };

        transactionsToCreate.push(transactionData);
      } catch (error) {
        console.error(`Error processing row: ${JSON.stringify(row)}`, error);
        skippedRows.push(`Processing error: ${error}`);
      }
    }

    // Create transactions in batches
    console.log(`\n📊 Creating ${transactionsToCreate.length} transactions...`);

    const batchSize = 10;
    for (let i = 0; i < transactionsToCreate.length; i += batchSize) {
      const batch = transactionsToCreate.slice(i, i + batchSize);

      await Promise.all(
        batch.map((transaction) =>
          prisma.transaction.create({
            data: {
              name: transaction.name,
              amount: transaction.amount,
              date: transaction.date,
              categoryId: transaction.categoryId,
            },
          }),
        ),
      );

      console.log(
        `✅ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transactionsToCreate.length / batchSize)}`,
      );
    }

    // Summary
    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`CSV File: ${options.csvPath}`);
    console.log(`Period: ${options.month}/${options.year}`);
    console.log(`Total rows processed: ${rows.length}`);
    console.log(`Transactions created: ${transactionsToCreate.length}`);
    console.log(`Categories created: ${createdCategories.length}`);
    console.log(`Rows skipped: ${skippedRows.length}`);

    if (createdCategories.length > 0) {
      console.log('\nNew categories created:');
      createdCategories.forEach((cat) => console.log(`  - ${cat}`));
    }

    if (skippedRows.length > 0) {
      console.log('\nSkipped rows:');
      skippedRows.forEach((row) => console.log(`  - ${row}`));
    }
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n🎉 CSV import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
