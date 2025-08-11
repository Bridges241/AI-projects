import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { href: "/", icon: "fas fa-tachometer-alt", label: "總覽儀表板" },
    { href: "/income", icon: "fas fa-coins", label: "收入管理" },
    { href: "/expenses", icon: "fas fa-credit-card", label: "支出管理" },
    { href: "/analysis", icon: "fas fa-chart-bar", label: "財務分析" },
    { href: "/loan", icon: "fas fa-home", label: "貸款評估" },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">
          <i className="fas fa-chart-line text-primary mr-2"></i>
          理財規劃系統
        </h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={`flex items-center p-3 rounded-lg ${
                  location === item.href
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                data-testid={`link-${item.label}`}
              >
                <i className={`${item.icon} mr-3`}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
