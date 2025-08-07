import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { CampaignInvoice } from './database.types'

// Export data to Excel
export const exportToExcel = (data: CampaignInvoice[], filename: string = 'campaign-invoices') => {
  try {
    // Prepare data for Excel export
    const excelData = data.map(invoice => ({
      'Company': invoice.company,
      'Campaign Name': invoice.campaign_name,
      'Date From': invoice.date_from,
      'Date To': invoice.date_to,
      
      // Customer Data
      'Customer Invoice #': invoice.customer_invoice_number,
      'Customer Amount (W/T)': invoice.customer_amount_without_tax,
      'Customer Amount (With Tax)': invoice.customer_amount_with_tax,
      'Customer Received (W/T)': invoice.customer_received_amount_without_tax,
      'Customer Received (With Tax)': invoice.customer_received_amount_with_tax,
      'Customer Payment Status': invoice.customer_payment_status,
      'Customer Payment Date': invoice.customer_payment_date,
      'Customer Remarks': invoice.customer_remarks,
      
      // Vendor Data
      'Vendor Name': invoice.vendor_name,
      'Vendor Invoice #': invoice.vendor_invoice_number,
      'Vendor Amount (W/T)': invoice.vendor_amount_without_tax,
      'Vendor Amount (With Tax)': invoice.vendor_amount_with_tax,
      'Vendor Paid (W/T)': invoice.vendor_paid_amount_without_tax,
      'Vendor Paid (With Tax)': invoice.vendor_paid_amount_with_tax,
      'Vendor Payment Status': invoice.vendor_payment_status,
      'Vendor Payment Date': invoice.vendor_payment_date,
      'Vendor Remarks': invoice.vendor_remarks,
      
      // Calculated Fields
      'Profit': invoice.profit,
      'Margin (%)': invoice.margin,
      
      // Timestamps
      'Created At': invoice.created_at,
      'Updated At': invoice.updated_at
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Auto-size columns
    const columnWidths = Object.keys(excelData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }))
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaign Invoices')

    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    const timestamp = new Date().toISOString().split('T')[0]
    saveAs(blob, `${filename}-${timestamp}.xlsx`)
    
    return true
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return false
  }
}

// Import data from Excel
export const importFromExcel = (file: File): Promise<Partial<CampaignInvoice>[]> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          
          // Get first worksheet
          const worksheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[worksheetName]
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must have at least a header row and one data row'))
            return
          }

          // Get headers and data
          const headers = jsonData[0] as string[]
          const rows = jsonData.slice(1) as unknown[][]

          // Map Excel data to CampaignInvoice format
          const importedData: Partial<CampaignInvoice>[] = rows
            .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
            .map(row => {
              const invoice: Partial<CampaignInvoice> = {}
              
              headers.forEach((header, index) => {
                const value = row[index]
                if (value === null || value === undefined || value === '') return

                // Map Excel headers to database fields
                switch (header.toLowerCase().trim()) {
                  case 'company':
                    invoice.company = String(value)
                    break
                  case 'campaign name':
                    invoice.campaign_name = String(value)
                    break
                  case 'date from':
                    invoice.date_from = formatExcelDate(value)
                    break
                  case 'date to':
                    invoice.date_to = formatExcelDate(value)
                    break
                  case 'customer invoice #':
                  case 'customer invoice number':
                    invoice.customer_invoice_number = String(value)
                    break
                  case 'customer amount (w/t)':
                  case 'customer amount without tax':
                    invoice.customer_amount_without_tax = parseFloat(String(value)) || 0
                    break
                  case 'customer amount (with tax)':
                    invoice.customer_amount_with_tax = parseFloat(String(value)) || 0
                    break
                  case 'customer received (w/t)':
                  case 'customer received without tax':
                    invoice.customer_received_amount_without_tax = parseFloat(String(value)) || 0
                    break
                  case 'customer received (with tax)':
                    invoice.customer_received_amount_with_tax = parseFloat(String(value)) || 0
                    break
                  case 'customer payment status':
                    const customerStatus = String(value).toLowerCase()
                    if (['clear', 'pending', 'partial'].includes(customerStatus)) {
                      invoice.customer_payment_status = customerStatus.charAt(0).toUpperCase() + customerStatus.slice(1) as 'Clear' | 'Pending' | 'Partial'
                    }
                    break
                  case 'customer payment date':
                    invoice.customer_payment_date = formatExcelDate(value)
                    break
                  case 'customer remarks':
                    invoice.customer_remarks = String(value)
                    break
                  case 'vendor name':
                    invoice.vendor_name = String(value)
                    break
                  case 'vendor invoice #':
                  case 'vendor invoice number':
                    invoice.vendor_invoice_number = String(value)
                    break
                  case 'vendor amount (w/t)':
                  case 'vendor amount without tax':
                    invoice.vendor_amount_without_tax = parseFloat(String(value)) || 0
                    break
                  case 'vendor amount (with tax)':
                    invoice.vendor_amount_with_tax = parseFloat(String(value)) || 0
                    break
                  case 'vendor paid (w/t)':
                  case 'vendor paid without tax':
                    invoice.vendor_paid_amount_without_tax = parseFloat(String(value)) || 0
                    break
                  case 'vendor paid (with tax)':
                    invoice.vendor_paid_amount_with_tax = parseFloat(String(value)) || 0
                    break
                  case 'vendor payment status':
                    const vendorStatus = String(value).toLowerCase()
                    if (['clear', 'pending', 'partial'].includes(vendorStatus)) {
                      invoice.vendor_payment_status = vendorStatus.charAt(0).toUpperCase() + vendorStatus.slice(1) as 'Clear' | 'Pending' | 'Partial'
                    }
                    break
                  case 'vendor payment date':
                    invoice.vendor_payment_date = formatExcelDate(value)
                    break
                  case 'vendor remarks':
                    invoice.vendor_remarks = String(value)
                    break
                }
              })

              // Auto-calculate tax amounts if not provided
              if (invoice.customer_amount_without_tax && !invoice.customer_amount_with_tax) {
                invoice.customer_amount_with_tax = Math.round(invoice.customer_amount_without_tax * 1.18 * 100) / 100
              }
              if (invoice.customer_received_amount_without_tax && !invoice.customer_received_amount_with_tax) {
                invoice.customer_received_amount_with_tax = Math.round(invoice.customer_received_amount_without_tax * 1.18 * 100) / 100
              }
              if (invoice.vendor_amount_without_tax && !invoice.vendor_amount_with_tax) {
                invoice.vendor_amount_with_tax = Math.round(invoice.vendor_amount_without_tax * 1.18 * 100) / 100
              }
              if (invoice.vendor_paid_amount_without_tax && !invoice.vendor_paid_amount_with_tax) {
                invoice.vendor_paid_amount_with_tax = Math.round(invoice.vendor_paid_amount_without_tax * 1.18 * 100) / 100
              }

              return invoice
            })

          resolve(importedData)
        } catch (error) {
          reject(new Error(`Error parsing Excel file: ${error}`))
        }
      }

      reader.onerror = () => {
        reject(new Error('Error reading file'))
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      reject(new Error(`Error processing file: ${error}`))
    }
  })
}

// Helper function to format Excel dates
const formatExcelDate = (value: unknown): string => {
  if (!value) return ''
  
  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  
  // If it's a number (Excel date serial), convert it
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value)
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
    }
  }
  
  // Try to parse as Date
  try {
    const date = new Date(String(value))
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch {
    // Ignore parsing errors
  }
  
  return String(value)
}

// Generate Excel template for import
export const downloadTemplate = () => {
  const templateData = [{
    'Company': 'Example Company',
    'Campaign Name': 'Example Campaign',
    'Date From': '2024-01-01',
    'Date To': '2024-01-31',
    'Customer Invoice #': 'INV-001',
    'Customer Amount (W/T)': 10000,
    'Customer Amount (With Tax)': 11800,
    'Customer Received (W/T)': 10000,
    'Customer Received (With Tax)': 11800,
    'Customer Payment Status': 'Clear',
    'Customer Payment Date': '2024-01-15',
    'Customer Remarks': 'Payment received via HDFC',
    'Vendor Name': 'Example Vendor',
    'Vendor Invoice #': 'V-001',
    'Vendor Amount (W/T)': 7000,
    'Vendor Amount (With Tax)': 8260,
    'Vendor Paid (W/T)': 7000,
    'Vendor Paid (With Tax)': 8260,
    'Vendor Payment Status': 'Clear',
    'Vendor Payment Date': '2024-01-10',
    'Vendor Remarks': 'Payment made via bank transfer'
  }]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(templateData)
  
  // Auto-size columns
  const columnWidths = Object.keys(templateData[0]).map(key => ({
    wch: Math.max(key.length, 15)
  }))
  worksheet['!cols'] = columnWidths

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  saveAs(blob, 'campaign-invoices-template.xlsx')
}
