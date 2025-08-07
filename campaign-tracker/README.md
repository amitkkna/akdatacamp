# 📊 Campaign Profitability Tracker

A modern, elegant web application for tracking campaign profitability with clear customer/vendor invoice separation and automatic profit calculations.

## Features

- ✅ Track campaign invoices with detailed information
- ✅ Calculate profit and margin automatically
- ✅ Manage payment status for both customers and vendors
- ✅ Add, edit, and delete invoice records
- ✅ Responsive design with modern UI
- ✅ Real-time data updates
- ✅ Professional table layout with status indicators

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd campaign-tracker
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the SQL to create the table and sample data

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Adding a New Invoice

1. Click the "Add Invoice" button
2. Fill in all required fields:
   - Company name
   - Campaign name
   - Date range (from/to)
   - Invoice number
   - Amount details (with/without tax)
   - Payment status
   - Vendor expense and payment status
   - Optional remarks
3. The profit and margin are calculated automatically
4. Click "Add Invoice" to save

### Editing an Invoice

1. Click the edit (pencil) icon on any row
2. Modify the fields as needed
3. Click "Update Invoice" to save changes

### Deleting an Invoice

1. Click the delete (trash) icon on any row
2. Confirm the deletion in the popup

## Database Schema

The application uses a single table `campaign_invoices` with the following fields:

- `id`: Unique identifier (UUID)
- `company`: Company name
- `campaign_name`: Campaign name
- `date_from`/`date_to`: Campaign date range
- `invoice_number`: Invoice number
- `amount_without_tax`/`amount_with_tax`: Invoice amounts
- `received_amount_without_tax`/`received_amount_with_tax`: Received amounts
- `payment_status`: Payment status (Clear/Pending/Partial)
- `vendor_expense`: Vendor expense amount
- `vendor_payment_status`: Vendor payment status
- `remarks`: Optional remarks
- `profit`/`margin`: Calculated values
- `created_at`/`updated_at`: Timestamps

## Calculations

- **Profit** = Received Amount (W/T) - Vendor Expense
- **Margin** = (Profit / Received Amount (W/T)) × 100

## Deployment

The application can be easily deployed to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
