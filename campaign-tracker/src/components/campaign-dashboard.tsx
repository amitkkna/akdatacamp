'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { CampaignInvoice } from '@/lib/database.types'
import { formatCurrency, formatDate } from '@/lib/utils'

// Editable Cell Component
interface EditableCellProps {
  value: string | number | null | undefined
  isEditing: boolean
  type?: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  onChange: (value: string | number) => void
  className?: string
  readOnly?: boolean
}

function EditableCell({ value, isEditing, type = 'text', options, onChange, className = '', readOnly = false }: EditableCellProps) {
  if (!isEditing) {
    if (type === 'number' && typeof value === 'number') {
      return <span className={className}>{formatCurrency(value)}</span>
    }
    if (type === 'date' && value) {
      return <span className={className}>{formatDate(String(value))}</span>
    }
    return <span className={className}>{value || 'N/A'}</span>
  }

  if (readOnly) {
    return <span className={`${className} bg-gray-100 px-2 py-1 rounded`}>{type === 'number' ? formatCurrency(Number(value) || 0) : (value ?? '')}</span>
  }

  if (type === 'select' && options) {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 border rounded text-xs"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    )
  }

  return (
    <Input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
      className="w-full text-xs h-8"
      step={type === 'number' ? '0.01' : undefined}
    />
  )
}

export function CampaignDashboard() {
  const [invoices, setInvoices] = useState<CampaignInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<CampaignInvoice>>({})
  const [isAddingNew, setIsAddingNew] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
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

  const handleEdit = (invoice: CampaignInvoice) => {
    setEditingId(invoice.id)
    setEditingData(invoice)
  }

  const handleSave = async () => {
    if (!editingId || !editingData) return

    try {
      // Calculate tax amounts (18%)
      const TAX_RATE = 0.18
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

      if (isAddingNew) {
        await supabase
          .from('campaign_invoices')
          .insert([updatedData])
      } else {
        await supabase
          .from('campaign_invoices')
          .update(updatedData)
          .eq('id', editingId)
      }

      setEditingId(null)
      setEditingData({})
      setIsAddingNew(false)
      await fetchInvoices()
    } catch (error) {
      console.error('Error saving invoice:', error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingData({})
    setIsAddingNew(false)
    if (isAddingNew) {
      fetchInvoices() // Remove the temporary row
    }
  }

  const handleAddNew = () => {
    const newInvoice: Partial<CampaignInvoice> = {
      id: 'temp-new',
      company: '',
      campaign_name: '',
      date_from: '',
      date_to: '',
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

  const handleFieldChange = (field: keyof CampaignInvoice, value: string | number) => {
    setEditingData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campaign Profitability Tracker</h1>
        <div className="flex gap-2">
          <Button onClick={handleAddNew} disabled={editingId !== null}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Campaign Invoice
          </Button>
          {editingId && (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date<br/>(From - To)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider bg-green-50">
                  💰 Customer Invoice<br/>
                  <span className="text-xs normal-case">(Money In)</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider bg-green-50">
                  Customer Amount<br/>
                  <span className="text-xs normal-case">(W/T & With Tax)</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider bg-green-50">
                  Customer Payment<br/>
                  <span className="text-xs normal-case">(Received & Status)</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider bg-red-50">
                  🏢 Vendor Expense<br/>
                  <span className="text-xs normal-case">(Money Out)</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider bg-red-50">
                  Vendor Payment<br/>
                  <span className="text-xs normal-case">(Status)</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider bg-blue-50">
                  📊 Profit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider bg-blue-50">
                  📈 Margin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => {
                const isEditing = editingId === invoice.id
                const currentData = isEditing ? editingData : invoice

                return (
                  <tr key={invoice.id} className={`hover:bg-gray-50 ${isEditing ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
                    {/* Company */}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <EditableCell
                        value={currentData.company}
                        isEditing={isEditing}
                        onChange={(value) => handleFieldChange('company', value)}
                      />
                    </td>

                    {/* Campaign Name */}
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <EditableCell
                        value={currentData.campaign_name}
                        isEditing={isEditing}
                        onChange={(value) => handleFieldChange('campaign_name', value)}
                      />
                    </td>

                    {/* Date Range */}
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {isEditing ? (
                        <div className="space-y-1">
                          <EditableCell
                            value={currentData.date_from}
                            isEditing={isEditing}
                            type="date"
                            onChange={(value) => handleFieldChange('date_from', value)}
                          />
                          <EditableCell
                            value={currentData.date_to}
                            isEditing={isEditing}
                            type="date"
                            onChange={(value) => handleFieldChange('date_to', value)}
                          />
                        </div>
                      ) : (
                        <div>
                          {formatDate(invoice.date_from)}<br/>
                          {formatDate(invoice.date_to)}
                        </div>
                      )}
                    </td>

                    {/* Customer Invoice (Green) */}
                    <td className="px-4 py-3 text-sm text-gray-500 bg-green-50">
                      <EditableCell
                        value={currentData.customer_invoice_number}
                        isEditing={isEditing}
                        onChange={(value) => handleFieldChange('customer_invoice_number', value)}
                        className="font-medium"
                      />
                    </td>

                    {/* Customer Amount */}
                    <td className="px-4 py-3 text-sm text-gray-500 bg-green-50">
                      <div className="space-y-1">
                        <div className="text-xs">W/T:</div>
                        <EditableCell
                          value={currentData.customer_amount_without_tax}
                          isEditing={isEditing}
                          type="number"
                          onChange={(value) => {
                            handleFieldChange('customer_amount_without_tax', value)
                            // Auto-calculate tax
                            const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
                            handleFieldChange('customer_amount_with_tax', Math.round(numValue * 1.18 * 100) / 100)
                          }}
                        />
                        <div className="text-xs">Tax:</div>
                        <EditableCell
                          value={currentData.customer_amount_with_tax}
                          isEditing={isEditing}
                          type="number"
                          readOnly={true}
                          onChange={() => {}}
                        />
                      </div>
                    </td>

                    {/* Customer Payment */}
                    <td className="px-4 py-3 text-sm text-gray-500 bg-green-50">
                      <div className="space-y-1">
                        <div className="text-xs">Received:</div>
                        <EditableCell
                          value={currentData.customer_received_amount_without_tax}
                          isEditing={isEditing}
                          type="number"
                          onChange={(value) => {
                            handleFieldChange('customer_received_amount_without_tax', value)
                            // Auto-calculate tax
                            const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
                            handleFieldChange('customer_received_amount_with_tax', Math.round(numValue * 1.18 * 100) / 100)
                          }}
                        />
                        <EditableCell
                          value={currentData.customer_payment_status}
                          isEditing={isEditing}
                          type="select"
                          options={['Pending', 'Partial', 'Clear']}
                          onChange={(value) => handleFieldChange('customer_payment_status', value)}
                        />
                      </div>
                    </td>

                    {/* Vendor Expense (Red) */}
                    <td className="px-4 py-3 text-sm text-gray-500 bg-red-50">
                      <div className="space-y-1">
                        <EditableCell
                          value={currentData.vendor_name}
                          isEditing={isEditing}
                          onChange={(value) => handleFieldChange('vendor_name', value)}
                          className="font-medium"
                        />
                        <EditableCell
                          value={currentData.vendor_invoice_number}
                          isEditing={isEditing}
                          onChange={(value) => handleFieldChange('vendor_invoice_number', value)}
                          className="text-xs"
                        />
                        <div className="text-xs">Paid:</div>
                        <EditableCell
                          value={currentData.vendor_paid_amount_without_tax}
                          isEditing={isEditing}
                          type="number"
                          onChange={(value) => {
                            handleFieldChange('vendor_paid_amount_without_tax', value)
                            // Auto-calculate tax
                            const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0
                            handleFieldChange('vendor_paid_amount_with_tax', Math.round(numValue * 1.18 * 100) / 100)
                          }}
                        />
                      </div>
                    </td>

                    {/* Vendor Payment Status */}
                    <td className="px-4 py-3 text-sm text-gray-500 bg-red-50">
                      <EditableCell
                        value={currentData.vendor_payment_status}
                        isEditing={isEditing}
                        type="select"
                        options={['Pending', 'Partial', 'Clear']}
                        onChange={(value) => handleFieldChange('vendor_payment_status', value)}
                      />
                    </td>

                    {/* Remarks */}
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="space-y-1">
                        <EditableCell
                          value={currentData.customer_remarks}
                          isEditing={isEditing}
                          onChange={(value) => handleFieldChange('customer_remarks', value)}
                          className="text-xs"
                        />
                        <EditableCell
                          value={currentData.vendor_remarks}
                          isEditing={isEditing}
                          onChange={(value) => handleFieldChange('vendor_remarks', value)}
                          className="text-xs text-gray-400"
                        />
                      </div>
                    </td>

                    {/* Profit & Margin (Blue) */}
                    <td className="px-4 py-3 text-sm font-medium bg-blue-50">
                      <span className={invoice.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(invoice.profit)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium bg-blue-50">
                      <span className={invoice.margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {invoice.margin.toFixed(1)}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-sm font-medium">
                      {isEditing ? (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                            className="text-xs"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(invoice)}
                            className="text-xs"
                            disabled={editingId !== null}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(invoice.id)}
                            className="text-xs"
                            disabled={editingId !== null}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices found. Add your first invoice to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
