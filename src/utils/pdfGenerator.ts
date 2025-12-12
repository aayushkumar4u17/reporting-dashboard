import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface InvoiceData {
  aspOrderCode?: string
  salesInvoiceNumber?: string
  salesOrderCode?: string
  orderedDate?: string
  deliveredDate?: string
  orderedQuantity?: string | number
  deliveredQuantity?: string | number
  amount?: string | number
  deliveryLocation?: string
  pocName?: string
  pocContact?: string
  selected?: boolean
}

interface PaymentData {
  customerId?: string
  customerName?: string
  creditLimit?: string | number
  outstandingAmount?: string | number
  overdueAmount?: string | number
  paymentTerms?: number
  phoneNumber?: string
  allowedCreditBreach?: string
  selected?: boolean
}

export const generateInvoicesPDF = (invoices: InvoiceData[], selectedOnly = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!invoices || !Array.isArray(invoices)) {
        throw new Error('Invalid invoices data provided')
      }
      
      if (typeof window !== 'undefined' && !window.isSecureContext && window.location.protocol !== 'https:') {
        console.warn('PDF generation should be performed in a secure context')
      }
      
      const doc = new jsPDF()
      
      const dataToExport = selectedOnly 
        ? invoices.filter(invoice => invoice.selected)
        : invoices

      if (dataToExport.length === 0) {
        throw new Error('No data to export')
      }

      doc.setFontSize(16)
      doc.text('Invoice Report', 14, 15)
      
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)
      doc.text(`Total Records: ${dataToExport.length}`, 14, 30)

      const tableData = dataToExport.map(invoice => [
        String(invoice.aspOrderCode || ''),
        String(invoice.salesInvoiceNumber || ''),
        String(invoice.salesOrderCode || ''),
        String(invoice.orderedDate || ''),
        String(invoice.deliveredDate || ''),
        String(invoice.orderedQuantity || ''),
        String(invoice.deliveredQuantity || ''),
        String(invoice.amount || ''),
        String(invoice.deliveryLocation || ''),
        String(invoice.pocName || ''),
        String(invoice.pocContact || '')
      ])

      doc.autoTable({
        head: [[
          'ASP Order Code',
          'Sales Invoice Number', 
          'Sales Order Code',
          'Order Date',
          'Delivery Date',
          'Order Quantity',
          'Delivery Quantity',
          'Amount',
          'Delivery Location',
          'POC Name',
          'POC Contact'
        ]],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          7: { halign: 'right' }
        },
        margin: { top: 40 },
        theme: 'striped'
      })

      const filename = selectedOnly 
        ? `selected-invoices-${new Date().toISOString().split('T')[0]}.pdf`
        : `all-invoices-${new Date().toISOString().split('T')[0]}.pdf`
      
      doc.save(filename)
      resolve(filename)
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      reject(new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

export const generatePaymentsPDF = (payments: PaymentData[], selectedOnly = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!payments || !Array.isArray(payments)) {
        throw new Error('Invalid payments data provided')
      }
      
      if (typeof window !== 'undefined' && !window.isSecureContext && window.location.protocol !== 'https:') {
        console.warn('PDF generation should be performed in a secure context')
      }
      
      const doc = new jsPDF()
  
      const dataToExport = selectedOnly 
        ? payments.filter(payment => payment.selected)
        : payments

      if (dataToExport.length === 0) {
        throw new Error('No data to export')
      }

      doc.setFontSize(16)
      doc.text('Payment Report', 14, 15)
      
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)
      doc.text(`Total Records: ${dataToExport.length}`, 14, 30)

      const tableData = dataToExport.map(payment => [
        payment.customerId || '',
        payment.customerName || '',
        typeof payment.creditLimit === 'string' ? payment.creditLimit : `₹ ${payment.creditLimit || 0}`,
        typeof payment.outstandingAmount === 'string' ? payment.outstandingAmount : `₹ ${payment.outstandingAmount || 0}`,
        typeof payment.overdueAmount === 'string' ? payment.overdueAmount : `₹ ${payment.overdueAmount || 0}`,
        `${payment.paymentTerms || 0} days`,
        payment.phoneNumber || '',
        payment.allowedCreditBreach === 'Y' ? 'Allowed' : 'Not Allowed'
      ])

      doc.autoTable({
        head: [[
          'Customer ID',
          'Customer Name',
          'Credit Limit',
          'Outstanding Amount',
          'Overdue Amount',
          'Payment Terms',
          'Phone Number',
          'Credit Breach'
        ]],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' }
        }
      })

      const filename = selectedOnly 
        ? `selected-payments-${new Date().toISOString().split('T')[0]}.pdf`
        : `all-payments-${new Date().toISOString().split('T')[0]}.pdf`
      
      doc.save(filename)
      resolve(filename)
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      reject(new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}