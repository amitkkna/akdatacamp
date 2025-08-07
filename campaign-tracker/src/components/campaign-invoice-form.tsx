'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { CampaignInvoice } from '@/lib/database.types'
import { campaignInvoiceSchema, CampaignInvoiceFormData } from '@/lib/validations'
import { calculateProfit, calculateMargin } from '@/lib/utils'

interface CampaignInvoiceFormProps {
  invoice?: CampaignInvoice | null
  onSuccess: () => void
}

export function CampaignInvoiceForm({ invoice, onSuccess }: CampaignInvoiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CampaignInvoiceFormData>({
    resolver: zodResolver(campaignInvoiceSchema),
    defaultValues: invoice ? {
      company: invoice.company,
      campaign_name: invoice.campaign_name,
      date_from: invoice.date_from,
      date_to: invoice.date_to,
      customer_invoice_number: invoice.customer_invoice_number,
      customer_amount_without_tax: invoice.customer_amount_without_tax,
      customer_amount_with_tax: invoice.customer_amount_with_tax,
      customer_received_amount_without_tax: invoice.customer_received_amount_without_tax,
      customer_received_amount_with_tax: invoice.customer_received_amount_with_tax,
      customer_payment_status: invoice.customer_payment_status,
      customer_remarks: invoice.customer_remarks || '',
      vendor_name: invoice.vendor_name || '',
      vendor_invoice_number: invoice.vendor_invoice_number || '',
      vendor_amount_without_tax: invoice.vendor_amount_without_tax,
      vendor_amount_with_tax: invoice.vendor_amount_with_tax,
      vendor_paid_amount_without_tax: invoice.vendor_paid_amount_without_tax,
      vendor_paid_amount_with_tax: invoice.vendor_paid_amount_with_tax,
      vendor_payment_status: invoice.vendor_payment_status,
      vendor_remarks: invoice.vendor_remarks || '',
    } : {
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
    },
  })

  // Watch fields for automatic calculations
  const customerAmountWithoutTax = watch('customer_amount_without_tax')
  const customerReceivedAmountWithoutTax = watch('customer_received_amount_without_tax')
  const vendorAmountWithoutTax = watch('vendor_amount_without_tax')
  const vendorPaidAmountWithoutTax = watch('vendor_paid_amount_without_tax')

  // Automatic tax calculations (18%)
  const TAX_RATE = 0.18

  // Calculate profit and margin
  const profit = calculateProfit(customerReceivedAmountWithoutTax || 0, vendorPaidAmountWithoutTax || 0)
  const margin = calculateMargin(customerReceivedAmountWithoutTax || 0, vendorPaidAmountWithoutTax || 0)

  // Auto-calculate tax amounts when base amounts change
  React.useEffect(() => {
    if (customerAmountWithoutTax) {
      const withTax = customerAmountWithoutTax * (1 + TAX_RATE)
      setValue('customer_amount_with_tax', Math.round(withTax * 100) / 100)
    }
  }, [customerAmountWithoutTax, setValue])

  React.useEffect(() => {
    if (customerReceivedAmountWithoutTax) {
      const withTax = customerReceivedAmountWithoutTax * (1 + TAX_RATE)
      setValue('customer_received_amount_with_tax', Math.round(withTax * 100) / 100)
    }
  }, [customerReceivedAmountWithoutTax, setValue])

  React.useEffect(() => {
    if (vendorAmountWithoutTax) {
      const withTax = vendorAmountWithoutTax * (1 + TAX_RATE)
      setValue('vendor_amount_with_tax', Math.round(withTax * 100) / 100)
    }
  }, [vendorAmountWithoutTax, setValue])

  React.useEffect(() => {
    if (vendorPaidAmountWithoutTax) {
      const withTax = vendorPaidAmountWithoutTax * (1 + TAX_RATE)
      setValue('vendor_paid_amount_with_tax', Math.round(withTax * 100) / 100)
    }
  }, [vendorPaidAmountWithoutTax, setValue])

  const onSubmit = async (data: CampaignInvoiceFormData) => {
    try {
      const invoiceData = {
        ...data,
        profit,
        margin,
        updated_at: new Date().toISOString(),
      }

      if (invoice) {
        const { error } = await supabase
          .from('campaign_invoices')
          .update(invoiceData)
          .eq('id', invoice.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('campaign_invoices')
          .insert([invoiceData])

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving invoice:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campaign Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">📋 Campaign Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="Enter company name"
            />
            {errors.company && (
              <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="campaign_name">Campaign Name</Label>
            <Input
              id="campaign_name"
              {...register('campaign_name')}
              placeholder="Enter campaign name"
            />
            {errors.campaign_name && (
              <p className="text-sm text-red-600 mt-1">{errors.campaign_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date_from">Date From</Label>
            <Input
              id="date_from"
              type="date"
              {...register('date_from')}
            />
            {errors.date_from && (
              <p className="text-sm text-red-600 mt-1">{errors.date_from.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date_to">Date To</Label>
            <Input
              id="date_to"
              type="date"
              {...register('date_to')}
            />
            {errors.date_to && (
              <p className="text-sm text-red-600 mt-1">{errors.date_to.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Customer Invoice Section */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold mb-4 text-green-800">💰 Customer Invoice (Money Coming In)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer_invoice_number">Customer Invoice Number</Label>
            <Input
              id="customer_invoice_number"
              {...register('customer_invoice_number')}
              placeholder="Enter invoice number"
            />
            {errors.customer_invoice_number && (
              <p className="text-sm text-red-600 mt-1">{errors.customer_invoice_number.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_payment_status">Customer Payment Status</Label>
            <select
              id="customer_payment_status"
              {...register('customer_payment_status')}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Clear">Clear</option>
            </select>
          </div>

          <div>
            <Label htmlFor="customer_amount_without_tax">Customer Amount (Without Tax)</Label>
            <Input
              id="customer_amount_without_tax"
              type="number"
              step="0.01"
              {...register('customer_amount_without_tax', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.customer_amount_without_tax && (
              <p className="text-sm text-red-600 mt-1">{errors.customer_amount_without_tax.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_amount_with_tax">Customer Amount (With 18% Tax) - Auto Calculated</Label>
            <Input
              id="customer_amount_with_tax"
              type="number"
              step="0.01"
              {...register('customer_amount_with_tax', { valueAsNumber: true })}
              placeholder="0.00"
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="customer_received_amount_without_tax">Customer Received Amount (Without Tax)</Label>
            <Input
              id="customer_received_amount_without_tax"
              type="number"
              step="0.01"
              {...register('customer_received_amount_without_tax', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.customer_received_amount_without_tax && (
              <p className="text-sm text-red-600 mt-1">{errors.customer_received_amount_without_tax.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_received_amount_with_tax">Customer Received Amount (With 18% Tax) - Auto Calculated</Label>
            <Input
              id="customer_received_amount_with_tax"
              type="number"
              step="0.01"
              {...register('customer_received_amount_with_tax', { valueAsNumber: true })}
              placeholder="0.00"
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="customer_remarks">Customer Remarks</Label>
            <Input
              id="customer_remarks"
              {...register('customer_remarks')}
              placeholder="Enter customer remarks"
            />
          </div>
        </div>
      </div>

      {/* Vendor Invoice Section */}
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h3 className="text-lg font-semibold mb-4 text-red-800">🏢 Vendor Invoice (Money Going Out)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vendor_name">Vendor Name</Label>
            <Input
              id="vendor_name"
              {...register('vendor_name')}
              placeholder="Enter vendor name"
            />
          </div>

          <div>
            <Label htmlFor="vendor_invoice_number">Vendor Invoice Number</Label>
            <Input
              id="vendor_invoice_number"
              {...register('vendor_invoice_number')}
              placeholder="Enter vendor invoice number"
            />
          </div>

          <div>
            <Label htmlFor="vendor_payment_status">Vendor Payment Status</Label>
            <select
              id="vendor_payment_status"
              {...register('vendor_payment_status')}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Clear">Clear</option>
            </select>
          </div>

          <div></div>

          <div>
            <Label htmlFor="vendor_amount_without_tax">Vendor Amount (Without Tax)</Label>
            <Input
              id="vendor_amount_without_tax"
              type="number"
              step="0.01"
              {...register('vendor_amount_without_tax', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.vendor_amount_without_tax && (
              <p className="text-sm text-red-600 mt-1">{errors.vendor_amount_without_tax.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="vendor_amount_with_tax">Vendor Amount (With 18% Tax) - Auto Calculated</Label>
            <Input
              id="vendor_amount_with_tax"
              type="number"
              step="0.01"
              {...register('vendor_amount_with_tax', { valueAsNumber: true })}
              placeholder="0.00"
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="vendor_paid_amount_without_tax">Vendor Paid Amount (Without Tax)</Label>
            <Input
              id="vendor_paid_amount_without_tax"
              type="number"
              step="0.01"
              {...register('vendor_paid_amount_without_tax', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.vendor_paid_amount_without_tax && (
              <p className="text-sm text-red-600 mt-1">{errors.vendor_paid_amount_without_tax.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="vendor_paid_amount_with_tax">Vendor Paid Amount (With 18% Tax) - Auto Calculated</Label>
            <Input
              id="vendor_paid_amount_with_tax"
              type="number"
              step="0.01"
              {...register('vendor_paid_amount_with_tax', { valueAsNumber: true })}
              placeholder="0.00"
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="vendor_remarks">Vendor Remarks</Label>
            <Input
              id="vendor_remarks"
              {...register('vendor_remarks')}
              placeholder="Enter vendor remarks"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label>Calculated Profit</Label>
          <div className={`text-lg font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{profit.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <Label>Calculated Margin</Label>
          <div className={`text-lg font-semibold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {margin.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Add Invoice'}
        </Button>
      </div>
    </form>
  )
}
