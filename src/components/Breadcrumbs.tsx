import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/dashboard' }
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbItems.push({
      label,
      path: currentPath
    });
  });

  // Show only last 2 levels on mobile
  const displayItems = window.innerWidth < 768 && breadcrumbItems.length > 2
    ? breadcrumbItems.slice(-2)
    : breadcrumbItems;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          
          return (
            <div key={item.path} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.path} className="flex items-center gap-1">
                      {index === 0 && <Home className="w-3 h-3" />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="w-3 h-3" />
                </BreadcrumbSeparator>
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
