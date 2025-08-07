export interface Database {
  public: {
    Tables: {
      campaign_invoices: {
        Row: {
          id: string
          company: string
          campaign_name: string
          date_from: string
          date_to: string

          // Customer Invoice (Money Coming In)
          customer_invoice_number: string
          customer_amount_without_tax: number
          customer_amount_with_tax: number
          customer_received_amount_without_tax: number
          customer_received_amount_with_tax: number
          customer_payment_status: 'Clear' | 'Pending' | 'Partial'
          customer_payment_date: string | null
          customer_remarks: string | null

          // Vendor Expense (Money Going Out)
          vendor_name: string | null
          vendor_invoice_number: string | null
          vendor_amount_without_tax: number
          vendor_amount_with_tax: number
          vendor_paid_amount_without_tax: number
          vendor_paid_amount_with_tax: number
          vendor_payment_status: 'Clear' | 'Pending' | 'Partial'
          vendor_payment_date: string | null
          vendor_remarks: string | null

          // Calculated Profitability
          profit: number
          margin: number

          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company: string
          campaign_name: string
          date_from: string
          date_to: string

          // Customer Invoice (Money Coming In)
          customer_invoice_number: string
          customer_amount_without_tax?: number
          customer_amount_with_tax?: number
          customer_received_amount_without_tax?: number
          customer_received_amount_with_tax?: number
          customer_payment_status?: 'Clear' | 'Pending' | 'Partial'
          customer_payment_date?: string
          customer_remarks?: string

          // Vendor Expense (Money Going Out)
          vendor_name?: string
          vendor_invoice_number?: string
          vendor_amount_without_tax?: number
          vendor_amount_with_tax?: number
          vendor_paid_amount_without_tax?: number
          vendor_paid_amount_with_tax?: number
          vendor_payment_status?: 'Clear' | 'Pending' | 'Partial'
          vendor_payment_date?: string
          vendor_remarks?: string

          // Note: profit and margin are computed columns, so they're excluded from Insert
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company?: string
          campaign_name?: string
          date_from?: string
          date_to?: string

          // Customer Invoice (Money Coming In)
          customer_invoice_number?: string
          customer_amount_without_tax?: number
          customer_amount_with_tax?: number
          customer_received_amount_without_tax?: number
          customer_received_amount_with_tax?: number
          customer_payment_status?: 'Clear' | 'Pending' | 'Partial'
          customer_payment_date?: string
          customer_remarks?: string

          // Vendor Expense (Money Going Out)
          vendor_name?: string
          vendor_invoice_number?: string
          vendor_amount_without_tax?: number
          vendor_amount_with_tax?: number
          vendor_paid_amount_without_tax?: number
          vendor_paid_amount_with_tax?: number
          vendor_payment_status?: 'Clear' | 'Pending' | 'Partial'
          vendor_payment_date?: string
          vendor_remarks?: string

          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type CampaignInvoice = Database['public']['Tables']['campaign_invoices']['Row']
export type CampaignInvoiceInsert = Database['public']['Tables']['campaign_invoices']['Insert']
export type CampaignInvoiceUpdate = Database['public']['Tables']['campaign_invoices']['Update']
