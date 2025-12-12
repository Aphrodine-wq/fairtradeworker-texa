import { Button } from "@/components/ui/button"
import { FilePdf } from "@phosphor-icons/react"
import { toast } from "sonner"
import type { Invoice, User } from "@/lib/types"

interface InvoicePDFGeneratorProps {
  invoice: Invoice
  contractor: User
}

export function InvoicePDFGenerator({ invoice, contractor }: InvoicePDFGeneratorProps) {
  
  const generatePDFContent = (): string => {
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    const formatDate = (date: string) => 
      new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const useCompanyLogo = invoice.useCompanyLogo !== false && contractor.companyLogo
    
    const genericLogoSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 80' fill='none'%3E%3Cg%3E%3Cpath d='M20 15 L35 30 L50 15 L65 30 L50 45 L35 30 L20 45 Z' fill='%230066FF' stroke='%230066FF' stroke-width='2' stroke-linejoin='round'/%3E%3Cpath d='M35 55 L50 40 L65 55' fill='none' stroke='%230066FF' stroke-width='2' stroke-linecap='round'/%3E%3Ctext x='75' y='38' font-family='system-ui, -apple-system, sans-serif' font-size='20' font-weight='700' fill='%230066FF'%3EFairTradeWorker%3C/text%3E%3Ctext x='75' y='55' font-family='system-ui, -apple-system, sans-serif' font-size='13' font-weight='500' fill='%236B7280'%3ETexas Platform%3C/text%3E%3C/g%3E%3C/svg%3E`

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0066FF;
    }
    .company-logo {
      max-width: 200px;
      max-height: 80px;
      object-fit: contain;
      margin-bottom: 12px;
    }
    .company-info h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0066FF;
      margin-bottom: 8px;
    }
    .company-info p {
      color: #6B7280;
      font-size: 14px;
      margin: 2px 0;
    }
    .company-info .tax-id {
      color: #9CA3AF;
      font-size: 12px;
      margin-top: 8px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta h2 {
      font-size: 36px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .invoice-meta p {
      font-size: 14px;
      color: #6B7280;
      margin: 4px 0;
    }
    .details-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .details-box {
      flex: 1;
    }
    .details-box h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #9CA3AF;
      margin-bottom: 12px;
    }
    .details-box p {
      font-size: 14px;
      margin: 4px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 8px;
    }
    .status-paid {
      background: #D1FAE5;
      color: #065F46;
    }
    .status-sent {
      background: #DBEAFE;
      color: #1E40AF;
    }
    .status-overdue {
      background: #FEE2E2;
      color: #991B1B;
    }
    .status-draft {
      background: #F3F4F6;
      color: #374151;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    thead {
      background: #F9FAFB;
    }
    th {
      text-align: left;
      padding: 12px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6B7280;
      font-weight: 600;
      border-bottom: 2px solid #E5E7EB;
    }
    th:last-child {
      text-align: right;
    }
    td {
      padding: 16px 12px;
      border-bottom: 1px solid #F3F4F6;
      font-size: 14px;
    }
    td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .totals-row {
      display: flex;
      justify-content: flex-end;
      margin: 8px 0;
      font-size: 14px;
    }
    .totals-row.total {
      font-size: 18px;
      font-weight: 700;
      padding-top: 12px;
      border-top: 2px solid #E5E7EB;
      margin-top: 12px;
      color: #0066FF;
    }
    .totals-label {
      width: 150px;
      text-align: right;
      padding-right: 20px;
      color: #6B7280;
    }
    .totals-amount {
      width: 120px;
      text-align: right;
      font-weight: 600;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      color: #9CA3AF;
      font-size: 12px;
    }
    .notes {
      margin-top: 40px;
      padding: 20px;
      background: #F9FAFB;
      border-radius: 8px;
      font-size: 13px;
      color: #6B7280;
      line-height: 1.8;
    }
    .notes strong {
      color: #374151;
    }
    ${invoice.isProForma ? `
      .proforma-watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 120px;
        font-weight: 900;
        color: rgba(0, 102, 255, 0.05);
        z-index: -1;
        pointer-events: none;
      }
    ` : ''}
  </style>
</head>
<body>
  ${invoice.isProForma ? '<div class="proforma-watermark">PRO FORMA</div>' : ''}
  
  <div class="header">
    <div class="company-info">
      ${useCompanyLogo 
        ? `<img src="${contractor.companyLogo}" alt="Company Logo" class="company-logo" />`
        : `<img src="${genericLogoSVG}" alt="FairTradeWorker Texas" class="company-logo" />`
      }
      <h1>${contractor.companyName || contractor.fullName}</h1>
      ${contractor.companyAddress ? `<p>${contractor.companyAddress.replace(/\n/g, '<br>')}</p>` : '<p>Professional Home Services</p>'}
      ${contractor.companyPhone ? `<p>Phone: ${contractor.companyPhone}</p>` : ''}
      ${contractor.companyEmail ? `<p>Email: ${contractor.companyEmail}</p>` : ''}
      ${contractor.taxId ? `<p class="tax-id">Tax ID: ${contractor.taxId}</p>` : ''}
    </div>
    <div class="invoice-meta">
      <h2>${invoice.isProForma ? 'PRO FORMA' : 'INVOICE'}</h2>
      <p><strong>Invoice #:</strong> ${invoice.id.slice(0, 8).toUpperCase()}</p>
      ${invoice.sentDate ? `<p><strong>Date:</strong> ${formatDate(invoice.sentDate)}</p>` : ''}
      <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
      <span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span>
    </div>
  </div>

  <div class="details-section">
    <div class="details-box">
      <h3>Bill To</h3>
      <p><strong>Homeowner</strong></p>
      <p>FairTradeWorker Customer</p>
    </div>
    <div class="details-box">
      <h3>For Services</h3>
      <p><strong>${invoice.jobTitle}</strong></p>
      <p>Job ID: ${invoice.jobId.slice(0, 8)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Quantity</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.lineItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(item.rate)}</td>
          <td>${formatCurrency(item.total)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <div class="totals-label">Subtotal:</div>
      <div class="totals-amount">${formatCurrency(invoice.subtotal)}</div>
    </div>
    <div class="totals-row">
      <div class="totals-label">Tax (${invoice.taxRate}%):</div>
      <div class="totals-amount">${formatCurrency(invoice.taxAmount)}</div>
    </div>
    ${invoice.lateFeeApplied ? `
      <div class="totals-row" style="color: #991B1B;">
        <div class="totals-label">Late Fee (1.5%):</div>
        <div class="totals-amount">${formatCurrency(invoice.total * 0.015)}</div>
      </div>
    ` : ''}
    <div class="totals-row total">
      <div class="totals-label">Total Due:</div>
      <div class="totals-amount">${formatCurrency(invoice.total)}</div>
    </div>
  </div>

  <div class="notes">
    <p><strong>Payment Terms:</strong> Payment is due by ${formatDate(invoice.dueDate)}. 
    ${invoice.isProForma ? 
      'This is a Pro Forma Invoice (estimate) and is not a demand for payment.' :
      'Late payments are subject to a 1.5% late fee after 30 days.'
    }</p>
    ${invoice.customNotes ? `<p style="margin-top: 12px;"><strong>Notes:</strong> ${invoice.customNotes}</p>` : ''}
    <p style="margin-top: 12px;"><strong>Thank you for your business!</strong></p>
  </div>

  <div class="footer">
    <p>Generated via FairTradeWorker Texas Platform • Zero-fee marketplace for Texas home services</p>
    <p>Contact: support@fairtradeworker.com • www.fairtradeworker.com</p>
  </div>
</body>
</html>
    `.trim()
  }

  const handleDownloadPDF = () => {
    try {
      const htmlContent = generatePDFContent()
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoice.id.slice(0, 8)}-${invoice.jobTitle.replace(/\s+/g, '-')}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success("Invoice PDF downloaded! Open in browser and print to PDF.")
    } catch (error) {
      console.error("PDF generation error:", error)
      toast.error("Failed to generate PDF")
    }
  }

  const handlePreviewPDF = () => {
    const htmlContent = generatePDFContent()
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePreviewPDF}
      >
        Preview PDF
      </Button>
      <Button
        size="sm"
        onClick={handleDownloadPDF}
        className="flex items-center gap-2"
      >
        <FilePdf weight="fill" size={16} />
        Download PDF
      </Button>
    </div>
  )
}
