import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/30">
    <div className="section-container py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-foreground font-heading font-bold text-sm">T</span>
            </div>
            <span className="font-heading font-bold text-lg text-foreground">
              Talent<span className="gradient-text">IQ</span>
            </span>
          </Link>
          <p className="text-muted-foreground text-sm leading-relaxed">
            AI Career Intelligence Platform. Predict & optimize campus placements.
          </p>
        </div>
        {[
          { title: "Product", links: [["Product", "/product"], ["Features", "/features"], ["Pricing", "/pricing"], ["Analytics", "/analytics"]] },
          { title: "Company", links: [["About", "/"], ["Contact", "/contact"], ["Demo", "/contact"]] },
          { title: "Legal", links: [["Privacy", "/"], ["Terms", "/"], ["Security", "/"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-heading font-semibold text-foreground mb-4 text-sm">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/50 mt-12 pt-8 text-center text-muted-foreground text-sm">
        © 2026 TalentIQ. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
