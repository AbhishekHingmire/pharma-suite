import { useState, useEffect, useRef } from 'react';
import { Search, Package, Users, FileText, ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { getFromStorage } from '@/lib/storage';
import { Product, Customer, Sale, Purchase } from '@/types';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: 'product' | 'customer' | 'sale' | 'purchase';
  id: number;
  title: string;
  subtitle: string;
  path: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const products = getFromStorage<Product>('products');
    const customers = getFromStorage<Customer>('customers');
    const sales = getFromStorage<Sale>('sales');
    const purchases = getFromStorage<Purchase>('purchases');

    const searchResults: SearchResult[] = [];

    // Search products
    products
      .filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.generic.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .forEach(p => {
        const companies = getFromStorage<{ id: number; name: string }>('companies');
        const company = companies.find(c => c.id === p.companyId);
        searchResults.push({
          type: 'product',
          id: p.id,
          title: p.name,
          subtitle: `${p.generic} - ${company?.name || ''}`,
          path: `/inventory/stock`
        });
      });

    // Search customers
    customers
      .filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
      )
      .slice(0, 5)
      .forEach(c => {
        searchResults.push({
          type: 'customer',
          id: c.id,
          title: c.name,
          subtitle: `${c.phone} - Type ${c.type}`,
          path: `/sales/list`
        });
      });

    // Search sales
    sales
      .filter(s => s.invoiceNo.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .forEach(s => {
        const customer = customers.find(c => c.id === s.customerId);
        searchResults.push({
          type: 'sale',
          id: s.id,
          title: s.invoiceNo,
          subtitle: `${customer?.name || ''} - ₹${s.total.toLocaleString('en-IN')}`,
          path: `/sales/list`
        });
      });

    // Search purchases
    purchases
      .filter(p => p.invoiceNo.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .forEach(p => {
        const companies = getFromStorage<{ id: number; name: string }>('companies');
        const company = companies.find(c => c.id === p.companyId);
        searchResults.push({
          type: 'purchase',
          id: p.id,
          title: p.invoiceNo,
          subtitle: `${company?.name || ''} - ₹${p.total.toLocaleString('en-IN')}`,
          path: `/purchase/list`
        });
      });

    setResults(searchResults);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
    
    // Save to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      case 'sale': return <FileText className="w-4 h-4" />;
      case 'purchase': return <ShoppingCart className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products, customers, invoices..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "pl-9 pr-9 transition-all duration-200",
            isOpen ? "w-64 md:w-96" : "w-48"
          )}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full md:w-96 bg-card border rounded-lg shadow-lg max-h-96 overflow-auto z-50">
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-muted-foreground px-2 py-1">Recent Searches</div>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(search)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {['product', 'customer', 'sale', 'purchase'].map(type => {
                const typeResults = results.filter(r => r.type === type);
                if (typeResults.length === 0) return null;

                return (
                  <div key={type} className="mb-2">
                    <div className="text-xs text-muted-foreground uppercase px-2 py-1 font-semibold">
                      {type}s
                    </div>
                    {typeResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded flex items-start gap-3 transition-colors"
                      >
                        <div className="mt-0.5">{getIcon(result.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{result.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
