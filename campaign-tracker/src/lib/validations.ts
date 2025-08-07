import { z } from 'zod'

export const campaignInvoiceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  campaign_name: z.string().min(1, 'Campaign name is required'),
  date_from: z.string().min(1, 'Start date is required'),
  date_to: z.string().min(1, 'End date is required'),

  // Customer Invoice Fields
  customer_invoice_number: z.string().min(1, 'Customer invoice number is required'),
  customer_amount_without_tax: z.number().min(0, 'Amount must be positive'),
  customer_amount_with_tax: z.number().min(0, 'Amount must be positive'),
  customer_received_amount_without_tax: z.number().min(0, 'Amount must be positive'),
  customer_received_amount_with_tax: z.number().min(0, 'Amount must be positive'),
  customer_payment_status: z.enum(['Clear', 'Pending', 'Partial']),
  customer_remarks: z.string().optional(),

  // Vendor Invoice Fields
  vendor_name: z.string().optional(),
  vendor_invoice_number: z.string().optional(),
  vendor_amount_without_tax: z.number().min(0, 'Amount must be positive'),
  vendor_amount_with_tax: z.number().min(0, 'Amount must be positive'),
  vendor_paid_amount_without_tax: z.number().min(0, 'Amount must be positive'),
  vendor_paid_amount_with_tax: z.number().min(0, 'Amount must be positive'),
  vendor_payment_status: z.enum(['Clear', 'Pending', 'Partial']),
  vendor_remarks: z.string().optional(),
})

export type CampaignInvoiceFormData = z.infer<typeof campaignInvoiceSchema>
