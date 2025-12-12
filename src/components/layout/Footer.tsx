interface FooterProps {
  onNavigate?: (page: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string) => {
    e.preventDefault()
    if (onNavigate) {
      onNavigate(page)
    }
  }

  return (
    <footer className="w-full border-t bg-card mt-auto">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted-foreground">
            <a 
              href="#" 
              onClick={(e) => handleClick(e, 'about')}
              className="hover:text-foreground transition-colors"
            >
              About
            </a>
            <a 
              href="#" 
              onClick={(e) => handleClick(e, 'contact')}
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
            <a 
              href="#" 
              onClick={(e) => handleClick(e, 'privacy')}
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#" 
              onClick={(e) => handleClick(e, 'terms')}
              className="hover:text-foreground transition-colors"
            >
              Terms
            </a>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-right">
            © 2025 FairTradeWorker
          </p>
        </div>
      </div>
    </footer>
  )
}
