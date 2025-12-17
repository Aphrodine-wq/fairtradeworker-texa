import { Heart, FacebookLogo, InstagramLogo, TwitterLogo, LinkedinLogo } from "@phosphor-icons/react"

interface FooterProps {
  onNavigate?: (page: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { label: 'About', page: 'about' },
      { label: 'Contact', page: 'contact' },
      { label: 'Careers', page: 'careers', disabled: true },
    ],
    legal: [
      { label: 'Privacy Policy', page: 'privacy' },
      { label: 'Terms of Service', page: 'terms' },
    ],
    resources: [
      { label: 'Free Tools', page: 'free-tools' },
      { label: 'Help Center', page: 'help' },
      { label: 'Blog', page: 'blog', disabled: true },
    ],
  }

  const handleClick = (page: string, disabled?: boolean) => {
    if (!disabled && onNavigate) {
      onNavigate(page)
    }
  }

  return (
    <footer className="bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <button
              onClick={() => handleClick('home')}
              className="font-black text-xl uppercase tracking-tight hover:text-[#00FF00] transition-colors"
            >
              FairTradeWorker
            </button>
            <p className="mt-4 text-sm font-mono">
              Zero fees. 100% fair.
            </p>
            <button
              onClick={() => onNavigate && onNavigate('donate')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#00FF00] text-black rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-semibold hover:bg-[#00DD00]"
            >
              <Heart size={16} weight="fill" className="mr-1" />
              Donate to Platform
            </button>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-black uppercase text-sm mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => handleClick(link.page, link.disabled)}
                    disabled={link.disabled}
                    className={`text-sm font-medium hover:text-[#00FF00] transition-colors ${
                      link.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {link.label}
                    {link.disabled && ' (Coming Soon)'}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-black uppercase text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => handleClick(link.page)}
                    className="text-sm font-medium hover:text-[#00FF00] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-black uppercase text-sm mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => handleClick(link.page, link.disabled)}
                    disabled={link.disabled}
                    className={`text-sm font-medium hover:text-[#00FF00] transition-colors ${
                      link.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {link.label}
                    {link.disabled && ' (Coming Soon)'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-mono">
              © {currentYear} FairTradeWorker. All rights reserved.
            </p>
            <div className="flex gap-3 items-center">
              <a
                href="https://facebook.com/fairtradeworker"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
                aria-label="Facebook"
              >
                <FacebookLogo 
                  size={24} 
                  weight="fill" 
                  className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
                />
              </a>
              <a
                href="https://instagram.com/fairtradeworker"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-all group"
                aria-label="Instagram"
              >
                <InstagramLogo 
                  size={24} 
                  weight="fill" 
                  className="text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" 
                />
              </a>
              <a
                href="https://twitter.com/fairtradeworker"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                aria-label="X (Twitter)"
              >
                <TwitterLogo 
                  size={24} 
                  weight="fill" 
                  className="text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors" 
                />
              </a>
              <a
                href="https://linkedin.com/company/fairtradeworker"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
                aria-label="LinkedIn"
              >
                <LinkedinLogo 
                  size={24} 
                  weight="fill" 
                  className="text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" 
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
