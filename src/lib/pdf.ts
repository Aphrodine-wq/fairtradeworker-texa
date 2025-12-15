/**
 * PDF Generation Utility
 * Uses jsPDF for client-side PDF generation
 * 
 * Note: Install jsPDF: npm install jspdf
 */

export interface PDFOptions {
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface PDFTableColumn {
  header: string
  dataKey: string
  width?: number
}

/**
 * Generate a simple PDF document
 */
export async function generatePDF(
  content: string | Array<{ type: 'text' | 'table' | 'image', data: any }>,
  filename: string = 'document.pdf',
  options: PDFOptions = {}
): Promise<void> {
  try {
    // Dynamic import of jsPDF (will work if installed)
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const margins = options.margins || { top: 20, right: 20, bottom: 20, left: 20 }
    let yPos = margins.top

    // Set metadata
    if (options.title) doc.setProperties({ title: options.title })
    if (options.author) doc.setProperties({ author: options.author })
    if (options.subject) doc.setProperties({ subject: options.subject })
    if (options.keywords) doc.setProperties({ keywords: options.keywords.join(', ') })

    // Handle content
    if (typeof content === 'string') {
      // Simple text content
      const lines = doc.splitTextToSize(content, 210 - margins.left - margins.right)
      doc.text(lines, margins.left, yPos)
    } else {
      // Structured content
      for (const item of content) {
        if (item.type === 'text') {
          const lines = doc.splitTextToSize(item.data.text || '', 210 - margins.left - margins.right)
          doc.setFontSize(item.data.fontSize || 12)
          doc.text(lines, margins.left, yPos)
          yPos += lines.length * 7
        } else if (item.type === 'table' && item.data.columns && item.data.rows) {
          // Simple table rendering
          const tableY = yPos
          const colWidths = item.data.columns.map((col: PDFTableColumn) => col.width || 40)
          const totalWidth = colWidths.reduce((sum: number, w: number) => sum + w, 0)
          const startX = margins.left

          // Headers
          doc.setFontSize(10)
          doc.setFont(undefined, 'bold')
          let xPos = startX
          item.data.columns.forEach((col: PDFTableColumn, idx: number) => {
            doc.text(col.header, xPos, tableY)
            xPos += colWidths[idx]
          })

          // Rows
          doc.setFont(undefined, 'normal')
          let currentY = tableY + 7
          item.data.rows.forEach((row: any) => {
            xPos = startX
            item.data.columns.forEach((col: PDFTableColumn, idx: number) => {
              const value = row[col.dataKey] || ''
              doc.text(String(value), xPos, currentY)
              xPos += colWidths[idx]
            })
            currentY += 7
          })
          yPos = currentY + 10
        }

        // Page break if needed
        if (yPos > 280) {
          doc.addPage()
          yPos = margins.top
        }
      }
    }

    doc.save(filename)
  } catch (error) {
    console.error('PDF generation failed:', error)
    // Fallback: download as text file
    const blob = new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.replace('.pdf', '.txt')
    a.click()
    URL.revokeObjectURL(url)
    throw new Error('PDF generation requires jsPDF. Install with: npm install jspdf')
  }
}

/**
 * Generate invoice PDF
 */
export async function generateInvoicePDF(invoice: any, contractor: any): Promise<void> {
  const content = [
    {
      type: 'text' as const,
      data: {
        text: `INVOICE #${invoice.id}\n\n${contractor.companyName || contractor.fullName}\n${contractor.address || ''}\n\nBill To:\n${invoice.customerName}\n${invoice.customerAddress || ''}\n\nDate: ${new Date(invoice.createdAt).toLocaleDateString()}\nDue Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`,
        fontSize: 12
      }
    },
    {
      type: 'table' as const,
      data: {
        columns: [
          { header: 'Description', dataKey: 'description', width: 80 },
          { header: 'Qty', dataKey: 'quantity', width: 20 },
          { header: 'Rate', dataKey: 'rate', width: 30 },
          { header: 'Amount', dataKey: 'amount', width: 30 }
        ],
        rows: invoice.lineItems || []
      }
    },
    {
      type: 'text' as const,
      data: {
        text: `\nSubtotal: $${invoice.subtotal || invoice.total}\nTax: $${invoice.tax || 0}\nTotal: $${invoice.total}\n\nStatus: ${invoice.status.toUpperCase()}`,
        fontSize: 12
      }
    }
  ]

  await generatePDF(content, `invoice-${invoice.id}.pdf`, {
    title: `Invoice ${invoice.id}`,
    author: contractor.companyName || contractor.fullName
  })
}

/**
 * Generate quote PDF
 */
export async function generateQuotePDF(quote: any, contractor: any): Promise<void> {
  const content = [
    {
      type: 'text' as const,
      data: {
        text: `QUOTE #${quote.id}\n\n${contractor.companyName || contractor.fullName}\n${contractor.address || ''}\n\nQuote To:\n${quote.customerName}\n${quote.customerAddress || ''}\n\nDate: ${new Date().toLocaleDateString()}\nValid Until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '30 days'}`,
        fontSize: 12
      }
    },
    {
      type: 'table' as const,
      data: {
        columns: [
          { header: 'Description', dataKey: 'description', width: 100 },
          { header: 'Amount', dataKey: 'amount', width: 50 }
        ],
        rows: quote.items || []
      }
    },
    {
      type: 'text' as const,
      data: {
        text: `\nTotal: $${quote.total}\n\n${quote.terms || 'Payment terms: 50% deposit, 50% on completion'}`,
        fontSize: 12
      }
    }
  ]

  await generatePDF(content, `quote-${quote.id}.pdf`, {
    title: `Quote ${quote.id}`,
    author: contractor.companyName || contractor.fullName
  })
}
