'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Check, X, ChevronDown, ChevronRight, Download, Upload, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { CampaignInvoice, CampaignInvoiceInsert } from '@/lib/database.types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { exportToExcel, importFromExcel, downloadTemplate } from '@/lib/excel-utils'

export function ElegantDashboard() {
  const [invoices, setInvoices] = useState<CampaignInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<CampaignInvoice>>({})
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sorting state
  const [sortField, setSortField] = useState<keyof CampaignInvoice>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    // Debug environment variables in production
    console.log('Environment check:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)
    })

    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      // Check if environment variables are properly set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables not configured')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('campaign_invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = (existingCampaign?: { company: string; campaign_name: string; date_from: string; date_to: string }) => {
    const newInvoice: Partial<CampaignInvoice> = {
      id: 'temp-new',
      company: existingCampaign?.company || '',
      campaign_name: existingCampaign?.campaign_name || '',
      date_from: existingCampaign?.date_from || '',
      date_to: existingCampaign?.date_to || '',
      customer_invoice_number: '',
      customer_amount_without_tax: 0,
      customer_amount_with_tax: 0,
      customer_received_amount_without_tax: 0,
      customer_received_amount_with_tax: 0,
      customer_payment_status: 'Pending',
      customer_remarks: '',
      vendor_name: '',
      vendor_invoice_number: '',
      vendor_amount_without_tax: 0,
      vendor_amount_with_tax: 0,
      vendor_paid_amount_without_tax: 0,
      vendor_paid_amount_with_tax: 0,
      vendor_payment_status: 'Pending',
      vendor_remarks: '',
      profit: 0,
      margin: 0,
    }

    setInvoices([newInvoice as CampaignInvoice, ...invoices])
    setEditingId('temp-new')
    setEditingData(newInvoice)
    setIsAddingNew(true)
  }

  const handleEdit = (invoice: CampaignInvoice) => {
    setEditingId(invoice.id)
    setEditingData(invoice)
  }

  const handleSave = async () => {
    if (!editingId || !editingData) return

    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      alert('Database connection not configured. Please check environment variables.')
      console.error('Missing Supabase environment variables')
      return
    }

    // Basic validation
    if (!editingData.company || !editingData.campaign_name || !editingData.customer_invoice_number) {
      alert('Please fill in Company, Campaign Name, and Customer Invoice Number')
      return
    }

    // Date validation
    if (!editingData.date_from || !editingData.date_to) {
      alert('Please fill in both From Date and To Date')
      return
    }

    try {
      const TAX_RATE = 0.18

      // Profit and margin are auto-calculated by database
      // const customerReceived = editingData.customer_received_amount_without_tax || 0
      // const vendorPaid = editingData.vendor_paid_amount_without_tax || 0
      // const profit = customerReceived - vendorPaid

      const updatedData = {
        ...editingData,
        customer_amount_with_tax: editingData.customer_amount_without_tax ?
          Math.round(editingData.customer_amount_without_tax * (1 + TAX_RATE) * 100) / 100 : 0,
        customer_received_amount_with_tax: editingData.customer_received_amount_without_tax ?
          Math.round(editingData.customer_received_amount_without_tax * (1 + TAX_RATE) * 100) / 100 : 0,
        vendor_amount_with_tax: editingData.vendor_amount_without_tax ?
          Math.round(editingData.vendor_amount_without_tax * (1 + TAX_RATE) * 100) / 100 : 0,
        vendor_paid_amount_with_tax: editingData.vendor_paid_amount_without_tax ?
          Math.round(editingData.vendor_paid_amount_without_tax * (1 + TAX_RATE) * 100) / 100 : 0,
        updated_at: new Date().toISOString(),
      }

      // Remove computed fields (profit and margin are auto-calculated by database)
      delete updatedData.profit
      delete updatedData.margin

      // Remove the temporary ID for new records
      if (isAddingNew) {
        delete updatedData.id
        console.log('Attempting to insert data:', updatedData)

        const insertData: CampaignInvoiceInsert = updatedData as CampaignInvoiceInsert

        const { data, error } = await supabase
          .from('campaign_invoices')
          .insert([insertData])
          .select()

        if (error) {
          console.error('Insert error details:', error)
          console.error('Error message:', error.message)
          console.error('Error details:', error.details)
          console.error('Error hint:', error.hint)
          console.error('Error code:', error.code)
          throw error
        }
        console.log('Successfully inserted:', data)
      } else {
        console.log('Attempting to update data:', updatedData)

        const { data, error } = await supabase
          .from('campaign_invoices')
          .update(updatedData)
          .eq('id', editingId)
          .select()

        if (error) {
          console.error('Update error details:', error)
          console.error('Error message:', error.message)
          console.error('Error details:', error.details)
          console.error('Error hint:', error.hint)
          console.error('Error code:', error.code)
          throw error
        }
        console.log('Successfully updated:', data)
      }

      setEditingId(null)
      setEditingData({})
      setIsAddingNew(false)
      await fetchInvoices()
    } catch (error: unknown) {
      console.error('Error saving invoice:', error)

      // Show more specific error messages
      let errorMessage = 'Error saving invoice. '
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage += `Error: ${error.message}`
      }
      if (error && typeof error === 'object' && 'details' in error) {
        errorMessage += `\nDetails: ${error.details}`
      }
      if (error && typeof error === 'object' && 'hint' in error) {
        errorMessage += `\nHint: ${error.hint}`
      }

      alert(errorMessage + '\n\nPlease check the browser console for full details.')
    }
  }

  const handleCancel = () => {
    if (isAddingNew) {
      // Remove the temporary row
      setInvoices(invoices.filter(inv => inv.id !== 'temp-new'))
    }
    setEditingId(null)
    setEditingData({})
    setIsAddingNew(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    try {
      const { error } = await supabase
        .from('campaign_invoices')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchInvoices()
    } catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }

  const handleFieldChange = (field: keyof CampaignInvoice, value: string | number) => {
    setEditingData(prev => ({ ...prev, [field]: value }))
  }

  // Excel Export Function
  const handleExport = () => {
    if (invoices.length === 0) {
      alert('No data to export')
      return
    }

    const success = exportToExcel(invoices, 'campaign-invoices')
    if (success) {
      alert('Data exported successfully!')
    } else {
      alert('Error exporting data. Please try again.')
    }
  }

  // Excel Import Function
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const importedData = await importFromExcel(file)

      if (importedData.length === 0) {
        alert('No valid data found in the Excel file')
        return
      }

      // Validate required fields
      const validData = importedData.filter(item =>
        item.company && item.campaign_name && item.customer_invoice_number
      )

      if (validData.length === 0) {
        alert('No valid records found. Please ensure Company, Campaign Name, and Customer Invoice Number are filled.')
        return
      }

      if (validData.length !== importedData.length) {
        const skipped = importedData.length - validData.length
        if (!confirm(`${skipped} records will be skipped due to missing required fields. Continue with ${validData.length} valid records?`)) {
          return
        }
      }

      // Insert data into database
      let successCount = 0
      let errorCount = 0

      for (const item of validData) {
        try {
          // Auto-calculate tax amounts
          const TAX_RATE = 0.18
          const processedItem = {
            ...item,
            customer_amount_with_tax: item.customer_amount_without_tax ?
              Math.round(item.customer_amount_without_tax * (1 + TAX_RATE) * 100) / 100 : 0,
            customer_received_amount_with_tax: item.customer_received_amount_without_tax ?
              Math.round(item.customer_received_amount_without_tax * (1 + TAX_RATE) * 100) / 100 : 0,
            vendor_amount_with_tax: item.vendor_amount_without_tax ?
              Math.round(item.vendor_amount_without_tax * (1 + TAX_RATE) * 100) / 100 : 0,
            vendor_paid_amount_with_tax: item.vendor_paid_amount_without_tax ?
              Math.round(item.vendor_paid_amount_without_tax * (1 + TAX_RATE) * 100) / 100 : 0,
            updated_at: new Date().toISOString(),
          }

          const { error } = await supabase
            .from('campaign_invoices')
            .insert([processedItem as CampaignInvoiceInsert])

          if (error) {
            console.error('Import error for item:', processedItem, error)
            errorCount++
          } else {
            successCount++
          }
        } catch (error) {
          console.error('Error importing item:', item, error)
          errorCount++
        }
      }

      // Show results
      let message = `Import completed!\n✅ Successfully imported: ${successCount} records`
      if (errorCount > 0) {
        message += `\n❌ Failed to import: ${errorCount} records`
      }
      alert(message)

      // Refresh data
      await fetchInvoices()
    } catch (error) {
      console.error('Import error:', error)
      alert(`Error importing file: ${error}`)
    } finally {
      setImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Download Template Function
  const handleDownloadTemplate = () => {
    downloadTemplate()
    alert('Template downloaded! Fill in your data and import it back.')
  }

  // Sorting Functions
  const handleSort = (field: keyof CampaignInvoice) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: keyof CampaignInvoice) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400" />
    }
    return sortDirection === 'asc' ?
      <ArrowUp className="w-3 h-3 text-blue-600" /> :
      <ArrowDown className="w-3 h-3 text-blue-600" />
  }

  // Sort invoices based on current sort settings
  const sortedInvoices = [...invoices].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return sortDirection === 'asc' ? comparison : -comparison
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue
      return sortDirection === 'asc' ? comparison : -comparison
    }

    // Handle dates
    if (sortField.includes('date') || sortField.includes('_at')) {
      const dateA = new Date(aValue as string).getTime()
      const dateB = new Date(bValue as string).getTime()
      const comparison = dateA - dateB
      return sortDirection === 'asc' ? comparison : -comparison
    }

    // Default string comparison
    const comparison = String(aValue).localeCompare(String(bValue))
    return sortDirection === 'asc' ? comparison : -comparison
  })

  // Group sorted invoices by campaign
  const groupedCampaigns = sortedInvoices.reduce((acc, invoice) => {
    const key = `${invoice.company}-${invoice.campaign_name}`
    if (!acc[key]) {
      acc[key] = {
        company: invoice.company,
        campaign_name: invoice.campaign_name,
        date_from: invoice.date_from,
        date_to: invoice.date_to,
        invoices: [],
        totalCustomerRevenue: 0,
        totalVendorExpense: 0,
        totalProfit: 0,
        totalMargin: 0,
      }
    }
    acc[key].invoices.push(invoice)
    acc[key].totalCustomerRevenue += invoice.customer_received_amount_without_tax || 0
    acc[key].totalVendorExpense += invoice.vendor_paid_amount_without_tax || 0
    acc[key].totalProfit = acc[key].totalCustomerRevenue - acc[key].totalVendorExpense
    acc[key].totalMargin = acc[key].totalCustomerRevenue > 0 ?
      (acc[key].totalProfit / acc[key].totalCustomerRevenue) * 100 : 0
    return acc
  }, {} as Record<string, {
    company: string;
    campaign_name: string;
    date_from: string;
    date_to: string;
    invoices: CampaignInvoice[];
    totalCustomerRevenue: number;
    totalVendorExpense: number;
    totalProfit: number;
    totalMargin: number;
  }>)

  const campaigns = Object.values(groupedCampaigns)

  // Calculate consolidated totals
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.customer_received_amount_without_tax || 0), 0)
  const totalExpenses = invoices.reduce((sum, inv) => sum + (inv.vendor_paid_amount_without_tax || 0), 0)
  const totalProfit = totalRevenue - totalExpenses
  const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  // Track expanded campaigns
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set())

  const toggleCampaign = (campaignKey: string) => {
    const newExpanded = new Set(expandedCampaigns)
    if (newExpanded.has(campaignKey)) {
      newExpanded.delete(campaignKey)
    } else {
      newExpanded.add(campaignKey)
    }
    setExpandedCampaigns(newExpanded)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Debug info for troubleshooting
  const showDebugInfo = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (showDebugInfo) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-800 mb-4">⚠️ Database Connection Issue</h1>
            <div className="space-y-3 text-sm">
              <p><strong>Problem:</strong> Supabase environment variables are not configured.</p>
              <div className="bg-white p-3 rounded border">
                <p><strong>Current Environment Variables:</strong></p>
                <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Not set'}</p>
                <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded border">
                <p><strong>To fix this:</strong></p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Go to your Netlify dashboard</li>
                  <li>Navigate to Site settings → Environment variables</li>
                  <li>Add: NEXT_PUBLIC_SUPABASE_URL = https://sybdtzjudvuklbweqeuw.supabase.co</li>
                  <li>Add: NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key</li>
                  <li>Trigger a new deploy</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Campaign Profitability Tracker</h1>
          <div className="flex gap-3">
            {/* Excel Import/Export Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                title="Download Excel template"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Template
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
                disabled={importing || editingId !== null}
                title="Import from Excel"
              >
                <Upload className="w-4 h-4 mr-2" />
                {importing ? 'Importing...' : 'Import'}
              </Button>

              <Button
                onClick={handleExport}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                disabled={invoices.length === 0 || editingId !== null}
                title="Export to Excel"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              style={{ display: 'none' }}
            />

            <Button
              onClick={() => handleAddNew()}
              disabled={editingId !== null}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Campaign Invoice
            </Button>
            {editingId && (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Data Sorting</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as keyof CampaignInvoice)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <optgroup label="Basic Info">
                    <option value="company">Company</option>
                    <option value="campaign_name">Campaign Name</option>
                    <option value="date_from">Date From</option>
                    <option value="date_to">Date To</option>
                  </optgroup>
                  <optgroup label="Customer Data">
                    <option value="customer_invoice_number">Customer Invoice #</option>
                    <option value="customer_amount_without_tax">Customer Amount (W/T)</option>
                    <option value="customer_received_amount_without_tax">Customer Received (W/T)</option>
                    <option value="customer_payment_status">Customer Payment Status</option>
                    <option value="customer_payment_date">Customer Payment Date</option>
                  </optgroup>
                  <optgroup label="Vendor Data">
                    <option value="vendor_name">Vendor Name</option>
                    <option value="vendor_paid_amount_without_tax">Vendor Paid (W/T)</option>
                    <option value="vendor_payment_status">Vendor Payment Status</option>
                    <option value="vendor_payment_date">Vendor Payment Date</option>
                  </optgroup>
                  <optgroup label="Profitability">
                    <option value="profit">Profit</option>
                    <option value="margin">Margin (%)</option>
                  </optgroup>
                  <optgroup label="Timestamps">
                    <option value="created_at">Created Date</option>
                    <option value="updated_at">Updated Date</option>
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Order:</label>
                <select
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="asc">Ascending (A-Z, 1-9, Old-New)</option>
                  <option value="desc">Descending (Z-A, 9-1, New-Old)</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                {sortedInvoices.length} record{sortedInvoices.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Consolidated Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Total Expenses</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Total Profit</div>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Overall Margin</div>
            <div className={`text-2xl font-bold ${totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalMargin.toFixed(1)}%
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600">Payment Status</div>
            {(() => {
              const totalInvoices = sortedInvoices.length
              const clearInvoices = sortedInvoices.filter(inv => inv.customer_payment_status === 'Clear').length
              const pendingInvoices = sortedInvoices.filter(inv => inv.customer_payment_status === 'Pending').length
              const partialInvoices = sortedInvoices.filter(inv => inv.customer_payment_status === 'Partial').length

              if (totalInvoices === 0) {
                return <div className="text-2xl font-bold text-gray-400">No Data</div>
              }

              const clearPercentage = Math.round((clearInvoices / totalInvoices) * 100)

              return (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {clearInvoices === totalInvoices ? (
                      <>
                        <span className="text-2xl">🟢</span>
                        <div className="text-xl font-bold text-green-600">ALL CLEAR</div>
                      </>
                    ) : pendingInvoices === totalInvoices ? (
                      <>
                        <span className="text-2xl">🔴</span>
                        <div className="text-xl font-bold text-red-600">ALL PENDING</div>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">🟡</span>
                        <div className="text-xl font-bold text-orange-600">{clearPercentage}% CLEAR</div>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {clearInvoices > 0 && <span className="text-green-600">✅{clearInvoices} </span>}
                    {partialInvoices > 0 && <span className="text-orange-600">🟡{partialInvoices} </span>}
                    {pendingInvoices > 0 && <span className="text-red-600">❌{pendingInvoices}</span>}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={() => handleSort('company')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Company {getSortIcon('company')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={() => handleSort('campaign_name')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Campaign Name {getSortIcon('campaign_name')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={() => handleSort('date_from')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Date (From - To) {getSortIcon('date_from')}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase bg-green-50">
                    <button
                      onClick={() => handleSort('customer_amount_without_tax')}
                      className="flex items-center gap-1 hover:text-green-800 transition-colors"
                    >
                      Customer Amount<br/><span className="normal-case">(W/T & With Tax)</span> {getSortIcon('customer_amount_without_tax')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase bg-green-50">
                    <button
                      onClick={() => handleSort('customer_payment_status')}
                      className="flex items-center gap-1 hover:text-green-800 transition-colors"
                    >
                      Customer Payment<br/><span className="normal-case">(Received & Status)</span> {getSortIcon('customer_payment_status')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase bg-green-50">
                    <button
                      onClick={() => handleSort('customer_invoice_number')}
                      className="flex items-center gap-1 hover:text-green-800 transition-colors"
                    >
                      💰 Customer Invoice #<br/><span className="normal-case">(Invoice Number)</span> {getSortIcon('customer_invoice_number')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase bg-red-50">
                    <button
                      onClick={() => handleSort('vendor_name')}
                      className="flex items-center gap-1 hover:text-red-800 transition-colors"
                    >
                      🏢 Vendor Expense<br/><span className="normal-case">(Money Out)</span> {getSortIcon('vendor_name')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase bg-red-50">
                    <button
                      onClick={() => handleSort('vendor_payment_status')}
                      className="flex items-center gap-1 hover:text-red-800 transition-colors"
                    >
                      Vendor Payment<br/><span className="normal-case">(Status)</span> {getSortIcon('vendor_payment_status')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase bg-blue-50">
                    <button
                      onClick={() => handleSort('profit')}
                      className="flex items-center gap-1 hover:text-blue-800 transition-colors"
                    >
                      📊 Profit {getSortIcon('profit')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase bg-blue-50">
                    <button
                      onClick={() => handleSort('margin')}
                      className="flex items-center gap-1 hover:text-blue-800 transition-colors"
                    >
                      📈 Margin {getSortIcon('margin')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => {
                  const campaignKey = `${campaign.company}-${campaign.campaign_name}`
                  const isExpanded = expandedCampaigns.has(campaignKey)

                  return (
                    <React.Fragment key={campaignKey}>
                      {/* Campaign Summary Row */}
                      <tr className="bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleCampaign(campaignKey)}>
                        <td className="px-4 py-3 text-sm font-medium">
                          <div className="flex items-center">
                            {isExpanded ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                            {campaign.company}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{campaign.campaign_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-xs">
                            {formatDate(campaign.date_from)}<br/>
                            {formatDate(campaign.date_to)}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm bg-green-50 font-medium">
                          {formatCurrency(campaign.totalCustomerRevenue)}
                        </td>
                        <td className="px-4 py-3 text-sm bg-green-50">
                          {(() => {
                            const totalInvoices = campaign.invoices.length
                            const clearInvoices = campaign.invoices.filter(inv => inv.customer_payment_status === 'Clear').length
                            const pendingInvoices = campaign.invoices.filter(inv => inv.customer_payment_status === 'Pending').length
                            const partialInvoices = campaign.invoices.filter(inv => inv.customer_payment_status === 'Partial').length

                            return (
                              <div className="text-xs">
                                <div className="flex items-center gap-1 mb-1">
                                  {clearInvoices === totalInvoices ? (
                                    <>
                                      <span className="text-green-700 font-medium">🟢</span>
                                      <span className="text-green-700 font-medium">ALL CLEAR</span>
                                    </>
                                  ) : pendingInvoices === totalInvoices ? (
                                    <>
                                      <span className="text-red-700 font-medium">🔴</span>
                                      <span className="text-red-700 font-medium">ALL PENDING</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-orange-700 font-medium">🟡</span>
                                      <span className="text-orange-700 font-medium">MIXED</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-gray-600">
                                  {clearInvoices > 0 && <div>✅ {clearInvoices} Clear</div>}
                                  {partialInvoices > 0 && <div>🟡 {partialInvoices} Partial</div>}
                                  {pendingInvoices > 0 && <div>❌ {pendingInvoices} Pending</div>}
                                </div>
                              </div>
                            )
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm bg-green-50 font-medium">
                          <div className="space-y-1">
                            {campaign.invoices.map((invoice, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                {/* Payment Status Dot */}
                                <div className={`w-2 h-2 rounded-full ${
                                  invoice.customer_payment_status === 'Clear' ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                {/* Invoice Number */}
                                <span className="font-medium">#{invoice.customer_invoice_number}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm bg-red-50 font-medium">
                          {formatCurrency(campaign.totalVendorExpense)}
                        </td>
                        <td className="px-4 py-3 text-sm bg-red-50"></td>
                        <td className="px-4 py-3 text-sm"></td>
                        <td className="px-4 py-3 text-sm bg-blue-50 font-medium">
                          <span className={campaign.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(campaign.totalProfit)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm bg-blue-50 font-medium">
                          <span className={campaign.totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {campaign.totalMargin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddNew(campaign)
                            }}
                            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                            title="Add invoice to this campaign"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>

                      {/* Individual Invoice Rows (when expanded) */}
                      {isExpanded && campaign.invoices.map((invoice, invoiceIndex) => {
                        const isEditing = editingId === invoice.id
                        const currentData = isEditing ? editingData : invoice

                  return (
                    <tr key={`${campaignKey}-invoice-${invoice.id}-${invoiceIndex}`} className={`${isEditing ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                      {/* Company */}
                      <td className="px-4 py-3 text-sm">
                        {isEditing ? (
                          <Input
                            value={currentData.company || ''}
                            onChange={(e) => handleFieldChange('company', e.target.value)}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <span className="font-medium">{invoice.company}</span>
                        )}
                      </td>

                      {/* Campaign Name */}
                      <td className="px-4 py-3 text-sm">
                        {isEditing ? (
                          <Input
                            value={currentData.campaign_name || ''}
                            onChange={(e) => handleFieldChange('campaign_name', e.target.value)}
                            className="h-8 text-sm"
                          />
                        ) : (
                          <span>{invoice.campaign_name}</span>
                        )}
                      </td>

                      {/* Date Range */}
                      <td className="px-4 py-3 text-sm">
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              type="date"
                              value={currentData.date_from || ''}
                              onChange={(e) => handleFieldChange('date_from', e.target.value)}
                              className="h-8 text-xs"
                            />
                            <Input
                              type="date"
                              value={currentData.date_to || ''}
                              onChange={(e) => handleFieldChange('date_to', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        ) : (
                          <div className="text-xs">
                            {formatDate(invoice.date_from)}<br/>
                            {formatDate(invoice.date_to)}
                          </div>
                        )}
                      </td>



                      {/* Customer Amount */}
                      <td className="px-4 py-3 text-sm bg-green-50">
                        {isEditing ? (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">W/T:</div>
                            <Input
                              type="number"
                              value={currentData.customer_amount_without_tax || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                handleFieldChange('customer_amount_without_tax', value)
                                handleFieldChange('customer_amount_with_tax', Math.round(value * 1.18 * 100) / 100)
                              }}
                              className="h-8 text-xs"
                              step="0.01"
                            />
                            <div className="text-xs text-gray-600">Tax: {formatCurrency(currentData.customer_amount_with_tax || 0)}</div>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <div>W/T: {formatCurrency(invoice.customer_amount_without_tax)}</div>
                            <div>Tax: {formatCurrency(invoice.customer_amount_with_tax)}</div>
                          </div>
                        )}
                      </td>

                      {/* Customer Payment */}
                      <td className="px-4 py-3 text-sm bg-green-50">
                        {isEditing ? (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">Received:</div>
                            <Input
                              type="number"
                              value={currentData.customer_received_amount_without_tax || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                handleFieldChange('customer_received_amount_without_tax', value)
                                handleFieldChange('customer_received_amount_with_tax', Math.round(value * 1.18 * 100) / 100)
                              }}
                              className="h-8 text-xs"
                              step="0.01"
                            />
                            <select
                              value={currentData.customer_payment_status || 'Pending'}
                              onChange={(e) => handleFieldChange('customer_payment_status', e.target.value)}
                              className="w-full h-8 text-xs border rounded px-2"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Partial">Partial</option>
                              <option value="Clear">Clear</option>
                            </select>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              {/* Payment Status Flag */}
                              {invoice.customer_payment_status === 'Clear' ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Payment Received"></div>
                                  <span className="text-green-700 font-medium">🟢</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Payment Pending"></div>
                                  <span className="text-red-700 font-medium">🔴</span>
                                </div>
                              )}
                              <span className="font-medium">
                                {invoice.customer_payment_status === 'Clear' ? 'RECEIVED' :
                                 invoice.customer_payment_status === 'Partial' ? 'PARTIAL' : 'PENDING'}
                              </span>
                            </div>
                            <div>Received: {formatCurrency(invoice.customer_received_amount_without_tax)}</div>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              invoice.customer_payment_status === 'Clear' ? 'bg-green-100 text-green-800' :
                              invoice.customer_payment_status === 'Pending' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {invoice.customer_payment_status}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Customer Invoice Number */}
                      <td className="px-4 py-3 text-sm bg-green-50">
                        {isEditing ? (
                          <Input
                            value={currentData.customer_invoice_number || ''}
                            onChange={(e) => handleFieldChange('customer_invoice_number', e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Invoice #"
                          />
                        ) : (
                          <span className="font-medium">#{invoice.customer_invoice_number}</span>
                        )}
                      </td>

                      {/* Vendor Expense */}
                      <td className="px-4 py-3 text-sm bg-red-50">
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              value={currentData.vendor_name || ''}
                              onChange={(e) => handleFieldChange('vendor_name', e.target.value)}
                              className="h-8 text-xs"
                              placeholder="Vendor name"
                            />
                            <Input
                              value={currentData.vendor_invoice_number || ''}
                              onChange={(e) => handleFieldChange('vendor_invoice_number', e.target.value)}
                              className="h-8 text-xs"
                              placeholder="Invoice #"
                            />
                            <div className="text-xs text-gray-600">Paid:</div>
                            <Input
                              type="number"
                              value={currentData.vendor_paid_amount_without_tax || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                handleFieldChange('vendor_paid_amount_without_tax', value)
                                handleFieldChange('vendor_paid_amount_with_tax', Math.round(value * 1.18 * 100) / 100)
                              }}
                              className="h-8 text-xs"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          <div className="text-xs">
                            <div className="font-medium">{invoice.vendor_name || 'N/A'}</div>
                            <div>#{invoice.vendor_invoice_number || 'N/A'}</div>
                            <div>Paid: {formatCurrency(invoice.vendor_paid_amount_without_tax)}</div>
                          </div>
                        )}
                      </td>

                      {/* Vendor Payment Status */}
                      <td className="px-4 py-3 text-sm bg-red-50">
                        {isEditing ? (
                          <select
                            value={currentData.vendor_payment_status || 'Pending'}
                            onChange={(e) => handleFieldChange('vendor_payment_status', e.target.value)}
                            className="w-full h-8 text-xs border rounded px-2"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Partial">Partial</option>
                            <option value="Clear">Clear</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            invoice.vendor_payment_status === 'Clear' ? 'bg-green-100 text-green-800' :
                            invoice.vendor_payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {invoice.vendor_payment_status}
                          </span>
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="px-4 py-3 text-sm">
                        {isEditing ? (
                          <div className="space-y-1">
                            <Input
                              value={currentData.customer_remarks || ''}
                              onChange={(e) => handleFieldChange('customer_remarks', e.target.value)}
                              className="h-8 text-xs"
                              placeholder="Customer remarks"
                            />
                            <Input
                              value={currentData.vendor_remarks || ''}
                              onChange={(e) => handleFieldChange('vendor_remarks', e.target.value)}
                              className="h-8 text-xs"
                              placeholder="Vendor remarks"
                            />
                          </div>
                        ) : (
                          <div className="text-xs">
                            <div>{invoice.customer_remarks}</div>
                            <div className="text-gray-400">{invoice.vendor_remarks}</div>
                          </div>
                        )}
                      </td>

                      {/* Profit */}
                      <td className="px-4 py-3 text-sm bg-blue-50">
                        <span className={`font-medium ${invoice.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(invoice.profit)}
                        </span>
                      </td>

                      {/* Margin */}
                      <td className="px-4 py-3 text-sm bg-blue-50">
                        <span className={`font-medium ${invoice.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {invoice.margin.toFixed(1)}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-sm">
                        {isEditing ? (
                          <div className="flex space-x-1">
                            <Button size="sm" onClick={handleSave} className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={handleCancel} variant="outline" className="h-8 w-8 p-0">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(invoice)}
                              variant="outline"
                              className="h-8 w-8 p-0"
                              disabled={editingId !== null}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDelete(invoice.id)}
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              disabled={editingId !== null}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No campaigns found. Add your first campaign to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
