# CSV Import Script

This script imports transaction data from a CSV file into the spending tracker database with interactive category creation.

## Usage

1. **Install dependencies** (if not already installed):

   ```bash
   bun install
   ```

2. **Run the import script**:

   ```bash
   bun run scripts/import-csv.ts <csv-path> <month> <year>
   ```

   **Example:**

   ```bash
   bun run scripts/import-csv.ts ./scripts/march-2025.csv 3 2025
   ```

   **Or using npm script:**

   ```bash
   bun run import-csv ./scripts/march-2025.csv 3 2025
   ```

## Arguments

- **csv-path**: Path to the CSV file (required)
- **month**: Month number 1-12 (required)
- **year**: Year e.g., 2025 (required)

## Interactive Features

When the script encounters a category that doesn't exist in the database, it will prompt you to create it:

```
⚠️  Category not found: "NewCategory"

📝 Creating new category: "NewCategory"
Category name (default: "NewCategory"):
Description: My new category description
Type (CREDIT/DEBIT) [default: DEBIT]: CREDIT

✅ Creating category: "NewCategory" (CREDIT)
```

### Category Creation Prompts:

1. **Category Name**: Enter a custom name or press Enter to use the default
2. **Description**: Enter a description for the category
3. **Type**: Choose CREDIT or DEBIT (defaults to DEBIT if left empty)

## CSV Format

The script expects a CSV file with the following columns:

- `Type`: The transaction category (e.g., "Grocery", "Transport", "Pay")
- `Amount`: The transaction amount (e.g., "$100.00", "50.25")
- `Day`: The day of the month (1-31)
- `Store`: The store or transaction name

### Example CSV:

```csv
Type,Amount,Day,Store
Grocery,$61.57,1,Zona Sul Mercado
Transport,$6.34,2,Uber
Pay,$2718.60,14,Payday
```

## Features

- **Interactive Category Creation**: Prompt user for category details when new categories are found
- **Flexible Date Handling**: Specify any month and year for the import
- **Automatic Category Creation**: If a category doesn't exist, it will be created with user input
- **Data Validation**: Validates amounts and dates before importing
- **Row Validation**: Ensures each row has exactly 4 values
- **Batch Processing**: Creates transactions in batches for better performance
- **Error Handling**: Skips invalid rows and provides detailed error reporting
- **Summary Report**: Shows import statistics after completion

## Output

The script provides detailed console output including:

- CSV file path and import period
- Interactive prompts for new categories
- Number of rows processed
- Number of transactions created
- Number of new categories created
- List of skipped rows with reasons
- Import summary

## Examples

```bash
# Import March 2025 data
bun run scripts/import-csv.ts ./scripts/march-2025.csv 3 2025

# Import January 2024 data
bun run scripts/import-csv.ts ./data/january-2024.csv 1 2024

# Import December 2023 data
bun run scripts/import-csv.ts ./exports/dec-2023.csv 12 2023

# Using npm script
bun run import-csv ./scripts/march-2025.csv 3 2025
```

## Interactive Session Example

```
Starting CSV import process...
CSV Path: ./scripts/march-2025.csv
Month: 3
Year: 2025

CSV Headers: ['Type', 'Amount', 'Day', 'Store']
Found 80 rows to process
Found 15 existing categories

⚠️  Category not found: "NewCategory"

📝 Creating new category: "NewCategory"
Category name (default: "NewCategory"): CustomCategory
Description: My custom category for special expenses
Type (CREDIT/DEBIT) [default: DEBIT]: DEBIT

✅ Creating category: "CustomCategory" (DEBIT)

📊 Creating 80 transactions...
✅ Created batch 1/8
✅ Created batch 2/8
...

=== IMPORT SUMMARY ===
CSV File: ./scripts/march-2025.csv
Period: 3/2025
Total rows processed: 80
Transactions created: 80
Categories created: 1
Rows skipped: 0

New categories created:
  - CustomCategory

🎉 CSV import completed successfully!
```

## Notes

- The script validates that the specified month/year combination is valid
- Each row must have exactly 4 values (Type, Amount, Day, Store)
- Transactions are created with the store name as the transaction name
- If store name is empty, the category name is used instead
- Invalid amounts or dates are skipped and reported
- The script connects to the database using Prisma
- Interactive prompts allow for custom category creation with full control over naming and classification
