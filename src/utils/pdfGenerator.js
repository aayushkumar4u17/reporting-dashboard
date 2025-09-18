import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const generateInvoicesPDF = (invoices, selectedOnly = false) => {
  // Ensure secure context for PDF generation
  if (typeof window !== 'undefined' && !window.isSecureContext && window.location.protocol !== 'https:') {
    console.warn('PDF generation should be performed in a secure context')
  }
  
  const doc = new jsPDF()
  
  // Filter data based on selection
  const dataToExport = selectedOnly 
    ? invoices.filter(invoice => invoice.selected)
    : invoices

  if (dataToExport.length === 0) {
    throw new Error('No data to export')
  }

  // Add title
  doc.setFontSize(16)
  doc.text('Invoice Report', 14, 15)
  
  // Add generation date
  doc.setFontSize(10)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)
  
  // Add record count
  doc.text(`Total Records: ${dataToExport.length}`, 14, 30)

  // Prepare table data
  const tableData = dataToExport.map(invoice => [
    invoice.aspOrderCode || '',
    invoice.salesInvoiceNumber || '',
    invoice.salesOrderCode || '',
    invoice.orderedDate || '',
    invoice.deliveredDate || '',
    invoice.orderedQuantity || '',
    invoice.deliveredQuantity || '',
    invoice.amount || '',
    invoice.deliveryLocation || '',
    invoice.pocName || '',
    invoice.pocContact || ''
  ])

  // Generate table
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
      7: { halign: 'right' } // Amount column
    }
  })

  // Save the PDF
  const filename = selectedOnly 
    ? `selected-invoices-${new Date().toISOString().split('T')[0]}.pdf`
    : `all-invoices-${new Date().toISOString().split('T')[0]}.pdf`
  
  doc.save(filename)
}

export const generatePaymentsPDF = (payments, selectedOnly = false) => {
  // Ensure secure context for PDF generation
  if (typeof window !== 'undefined' && !window.isSecureContext && window.location.protocol !== 'https:') {
    console.warn('PDF generation should be performed in a secure context')
  }
  
  const doc = new jsPDF()
  
  // Filter data based on selection
  const dataToExport = selectedOnly 
    ? payments.filter(payment => payment.selected)
    : payments

  if (dataToExport.length === 0) {
    throw new Error('No data to export')
  }

  // Add title
  doc.setFontSize(16)
  doc.text('Payment Report', 14, 15)
  
  // Add generation date
  doc.setFontSize(10)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)
  
  // Add record count
  doc.text(`Total Records: ${dataToExport.length}`, 14, 30)

  // Prepare table data
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

  // Generate table
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
      2: { halign: 'right' }, // Credit Limit
      3: { halign: 'right' }, // Outstanding Amount
      4: { halign: 'right' }  // Overdue Amount
    }
  })

  // Save the PDF
  const filename = selectedOnly 
    ? `selected-payments-${new Date().toISOString().split('T')[0]}.pdf`
    : `all-payments-${new Date().toISOString().split('T')[0]}.pdf`
  
  doc.save(filename)
}