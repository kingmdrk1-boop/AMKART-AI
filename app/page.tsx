"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, Boxes, Calculator,
  CheckCircle2, ChevronDown, CircleHelp, CreditCard, FileCheck2, FileSpreadsheet,
  LayoutDashboard, Lightbulb, Link2, Menu, Package, Plus, Search, Settings,
  ShoppingBag, Store, Upload, Wallet, X, Zap, RefreshCw, ReceiptText
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calculateSaleProfit, calculateSummary, money, type Sale } from "@/lib/finance";

const initialSales: Sale[] = [
  { id:"1", order:"AMZ-10482", product:"Wireless Earbuds Pro", sku:"AMK-WEP-01", platform:"Amazon", date:"2026-10-29", units:3, revenue:4497, productCost:2100, marketplaceFee:540, shipping:180, ads:120, returns:0 },
  { id:"2", order:"FLK-20814", product:"Cotton Bedsheet Set", sku:"AMK-CBS-04", platform:"Flipkart", date:"2026-10-29", units:2, revenue:2598, productCost:1200, marketplaceFee:312, shipping:110, ads:65, returns:0 },
  { id:"3", order:"AMZ-10475", product:"Steel Water Bottle", sku:"AMK-SWB-02", platform:"Amazon", date:"2026-10-28", units:5, revenue:2495, productCost:1000, marketplaceFee:325, shipping:150, ads:80, returns:120 },
  { id:"4", order:"FLK-20802", product:"Wireless Earbuds Pro", sku:"AMK-WEP-01", platform:"Flipkart", date:"2026-10-28", units:4, revenue:5996, productCost:2800, marketplaceFee:690, shipping:220, ads:150, returns:0 },
  { id:"5", order:"AMZ-10461", product:"Cotton Bedsheet Set", sku:"AMK-CBS-04", platform:"Amazon", date:"2026-10-27", units:3, revenue:3897, productCost:1800, marketplaceFee:468, shipping:165, ads:90, returns:250 },
  { id:"6", order:"FLK-20791", product:"Steel Water Bottle", sku:"AMK-SWB-02", platform:"Flipkart", date:"2026-10-27", units:6, revenue:2994, productCost:1200, marketplaceFee:390, shipping:180, ads:75, returns:0 }
];

const nav = [
  { label:"Overview", icon:LayoutDashboard },
  { label:"Sales & Orders", icon:ShoppingBag },
  { label:"Products", icon:Package },
  { label:"Profit & Loss", icon:BarChart3 },
  { label:"Expenses", icon:Wallet },
  { label:"GST Center", icon:FileCheck2 },
  { label:"AI Advisor", icon:Lightbulb },
  { label:"Inventory", icon:Boxes },
  { label:"Integrations", icon:Link2 },
  { label:"Settings", icon:Settings }
];

const monthly = [
  { month:"May", amazon:38000, flipkart:27000 }, { month:"Jun", amazon:42000, flipkart:31000 },
  { month:"Jul", amazon:51000, flipkart:36000 }, { month:"Aug", amazon:47000, flipkart:39000 },
  { month:"Sep", amazon:59000, flipkart:42000 }, { month:"Oct", amazon:68000, flipkart:49000 }
];

const initialExpenses = [
  { name:"Packaging material", category:"Operations", amount:4200, date:"28 Oct 2026" },
  { name:"Warehouse rent", category:"Fixed cost", amount:12000, date:"25 Oct 2026" },
  { name:"Product photography", category:"Marketing", amount:3500, date:"22 Oct 2026" }
];

function StatCard({ title, value, change, positive, icon: Icon, tint }: any) {
  return <div className="stat-card">
    <div className="stat-top"><span>{title}</span><span className={`stat-icon ${tint}`}><Icon size={18}/></span></div>
    <div className="stat-value">{value}</div>
    <div className={`stat-change ${positive ? "good" : "bad"}`}>{positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {change}<span className="muted"> vs previous period</span></div>
  </div>;
}

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [sales, setSales] = useState(initialSales);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [period, setPeriod] = useState("Last 30 days");
  const [showExpense, setShowExpense] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [search, setSearch] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState("Demo workspace · Connect seller accounts to sync live data");

  const summary = useMemo(() => calculateSummary(sales), [sales]);
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const amazon = sales.filter(s => s.platform === "Amazon").reduce((sum, s) => sum + s.revenue, 0);
  const flipkart = sales.filter(s => s.platform === "Flipkart").reduce((sum, s) => sum + s.revenue, 0);
  const units = sales.reduce((sum, s) => sum + s.units, 0);
  const filteredSales = sales.filter(s => [s.order,s.product,s.sku,s.platform].join(" ").toLowerCase().includes(search.toLowerCase()));
  const products = Object.values(sales.reduce((acc: any, sale) => {
    const key = sale.sku;
    if (!acc[key]) acc[key] = { sku:key, product:sale.product, units:0, revenue:0, profit:0, amazon:0, flipkart:0 };
    acc[key].units += sale.units; acc[key].revenue += sale.revenue; acc[key].profit += calculateSaleProfit(sale);
    acc[key][sale.platform.toLowerCase()] += sale.units;
    return acc;
  }, {}));

  function addExpense() {
    const amount = Number(expenseAmount);
    if (!expenseName.trim() || !Number.isFinite(amount) || amount <= 0) return;
    setExpenses([{ name:expenseName.trim(), category:"Other", amount, date:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) }, ...expenses]);
    setExpenseName(""); setExpenseAmount(""); setShowExpense(false);
    setNotice("Expense added to this demo session.");
  }

  function importCsv(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result || "").split(/\r?\n/).filter(Boolean);
      const parsed: Sale[] = rows.slice(1).map((line, i) => {
        const c = line.split(",").map(x => x.trim().replace(/^"|"$/g,""));
        return { id:`csv-${Date.now()}-${i}`, order:c[0] || `CSV-${i+1}`, product:c[1] || "Imported product", sku:c[2] || "UNKNOWN", platform:(c[3] || "Amazon").toLowerCase().includes("flip") ? "Flipkart" : "Amazon", date:c[4] || new Date().toISOString().slice(0,10), units:Number(c[5]) || 1, revenue:Number(c[6]) || 0, productCost:Number(c[7]) || 0, marketplaceFee:Number(c[8]) || 0, shipping:Number(c[9]) || 0, ads:Number(c[10]) || 0, returns:Number(c[11]) || 0 };
      }).filter(x => x.revenue > 0);
      if (parsed.length) { setSales(prev => [...parsed, ...prev]); setNotice(`${parsed.length} CSV rows imported into this demo session.`); }
      else setNotice("No valid rows found. Check the sample CSV format in README.");
    };
    reader.readAsText(file);
  }

  const title = active === "Overview" ? "Business overview" : active;
  const profit = summary.profit - expenseTotal;
  const pieData = [{name:"Amazon",value:amazon},{name:"Flipkart",value:flipkart}];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><Activity size={22}/></div>
        <div><strong>AMKART</strong><span>SELLER AI</span></div>
        <button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button>
      </div>
      <div className="workspace"><div className="workspace-avatar">A</div><div><b>AMKART Demo Store</b><small>Seller workspace</small></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.label} onClick={() => {setActive(item.label);setMobileNav(false);}} className={`nav-item ${active===item.label?"active":""}`}><item.icon size={18}/><span>{item.label}</span>{item.label==="AI Advisor" && <i>AI</i>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><b>Need help?</b><p>Explore setup guides and seller support.</p><button onClick={() => setNotice("Help center will be added in the next release.")}>Open help center <ArrowUpRight size={13}/></button></div><div className="profile"><div className="profile-avatar">S</div><div><b>Store Admin</b><small>Demo account</small></div><Settings size={17}/></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="top-left"><button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{title}</b></div></div>
        <div className="top-actions"><div className="sync-status"><span/> Demo mode</div><button className="icon-btn" onClick={() => setNotice("No new notifications.")}><Bell size={18}/></button><div className="top-avatar">S</div></div>
      </header>

      <div className="content">
        <div className="page-heading">
          <div><div className="eyebrow">FRIDAY, 30 OCTOBER 2026</div><h1>{title}</h1><p>Track performance, understand margins and make smarter decisions.</p></div>
          <div className="heading-actions"><select value={period} onChange={e=>setPeriod(e.target.value)}><option>Last 30 days</option><option>This month</option><option>Last 7 days</option><option>Year to date</option></select><button className="primary-btn" onClick={()=>setShowExpense(true)}><Plus size={16}/> Add expense</button></div>
        </div>
        <div className="notice"><Zap size={15}/><span>{notice}</span><button onClick={()=>setNotice("Demo workspace · Connect seller accounts to sync live data")}><X size={14}/></button></div>

        {active === "Overview" && <>
          <section className="stats-grid">
            <StatCard title="Gross sales" value={money(summary.revenue)} change="+12.8%" positive icon={ShoppingBag} tint="purple"/>
            <StatCard title="Estimated net profit" value={money(profit)} change="Demo calculation" positive={profit>=0} icon={Wallet} tint="green"/>
            <StatCard title="Units sold" value={units.toLocaleString("en-IN")} change="+8.4%" positive icon={Package} tint="blue"/>
            <StatCard title="Recorded expenses" value={money(expenseTotal)} change={`${expenses.length} entries`} positive={false} icon={ReceiptText} tint="orange"/>
          </section>
          <section className="chart-grid">
            <div className="panel revenue-panel"><div className="panel-head"><div><h3>Sales performance</h3><p>Marketplace revenue · illustrative monthly trend</p></div><button className="subtle-btn">Monthly <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i className="dot amazon-dot"/> Amazon</span><span><i className="dot flip-dot"/> Flipkart</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly} barGap={7}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f4"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#8992a3",fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#8992a3",fontSize:11}} tickFormatter={v=>`₹${v/1000}k`}/><Tooltip formatter={(v:any)=>money(Number(v))}/><Bar dataKey="amazon" fill="#f4a62a" radius={[5,5,0,0]} name="Amazon"/><Bar dataKey="flipkart" fill="#4b78e6" radius={[5,5,0,0]} name="Flipkart"/></BarChart></ResponsiveContainer></div></div>
            <div className="panel channel-panel"><div className="panel-head"><div><h3>Channel mix</h3><p>Sales split by marketplace</p></div><button className="more-btn">•••</button></div><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={88} paddingAngle={4}><Cell fill="#f4a62a"/><Cell fill="#4b78e6"/></Pie><Tooltip formatter={(v:any)=>money(Number(v))}/></PieChart></ResponsiveContainer><div className="donut-center"><b>{money(summary.revenue)}</b><span>Total sales</span></div></div><div className="channel-row"><span><i className="dot amazon-dot"/> Amazon</span><b>{money(amazon)}</b></div><div className="channel-row"><span><i className="dot flip-dot"/> Flipkart</span><b>{money(flipkart)}</b></div></div>
          </section>
          <section className="bottom-grid">
            <div className="panel"><div className="panel-head"><div><h3>Recent orders</h3><p>Latest marketplace transactions</p></div><button className="text-btn" onClick={()=>setActive("Sales & Orders")}>View all <ArrowUpRight size={14}/></button></div><SalesTable sales={sales.slice(0,4)}/></div>
            <div className="panel insight-panel"><div className="panel-head"><div><h3><Lightbulb size={17}/> AI business insights</h3><p>Early signals from your demo data</p></div><span className="ai-pill">BETA</span></div><div className="insight"><div className="insight-bullet green-bullet"><ArrowUpRight size={16}/></div><div><b>Compare channel margins</b><p>Review marketplace fees and shipping by SKU before shifting ad budgets.</p></div></div><div className="insight"><div className="insight-bullet orange-bullet"><Activity size={16}/></div><div><b>Watch return costs</b><p>Returns reduce contribution margin. Reconcile refund and reverse-logistics charges.</p></div></div><button className="wide-outline" onClick={()=>setActive("AI Advisor")}>Explore AI advisor <ArrowUpRight size={14}/></button></div>
          </section>
        </>}

        {active === "Sales & Orders" && <section className="panel full-panel"><div className="panel-head"><div><h3>Sales & orders</h3><p>Imported and demo order-level sales records</p></div><label className="upload-btn"><Upload size={15}/> Import CSV<input type="file" accept=".csv,text/csv" onChange={e=>importCsv(e.target.files?.[0])}/></label></div><div className="table-toolbar"><div className="search-box"><Search size={16}/><input placeholder="Search order, SKU or product..." value={search} onChange={e=>setSearch(e.target.value)}/></div><span>{filteredSales.length} records</span></div><SalesTable sales={filteredSales}/><p className="table-footnote">CSV columns: order_id, product, sku, platform, date, units, revenue, product_cost, marketplace_fee, shipping, ads, returns.</p></section>}

        {active === "Products" && <section className="panel full-panel"><div className="panel-head"><div><h3>Product performance</h3><p>Compare units, sales and estimated contribution by SKU</p></div></div><div className="table-scroll"><table><thead><tr><th>Product</th><th>SKU</th><th>Units</th><th>Amazon units</th><th>Flipkart units</th><th>Revenue</th><th>Contribution</th></tr></thead><tbody>{products.map((p:any)=><tr key={p.sku}><td><b>{p.product}</b></td><td>{p.sku}</td><td>{p.units}</td><td>{p.amazon}</td><td>{p.flipkart}</td><td>{money(p.revenue)}</td><td className={p.profit>=0?"positive-text":"negative-text"}>{money(p.profit)}</td></tr>)}</tbody></table></div></section>}

        {active === "Profit & Loss" && <section className="panel full-panel"><div className="panel-head"><div><h3>Profit & loss statement</h3><p>Contribution estimate from order-level demo records</p></div></div><div className="pl-list">{[["Gross sales",summary.revenue],["Product cost",-summary.productCost],["Marketplace fees",-summary.marketplaceFees],["Shipping charges",-summary.shipping],["Advertising",-summary.ads],["Return / refund cost",-summary.returns],["Recorded operating expenses",-expenseTotal]].map(([label,value]:any)=><div className="pl-row" key={label}><span>{label}</span><b className={value<0?"negative-text":""}>{money(value)}</b></div>)}<div className="pl-row total"><span>Estimated operating result</span><b className={profit>=0?"positive-text":"negative-text"}>{money(profit)}</b></div></div><p className="table-footnote">This is a management estimate, not a statutory financial statement. Taxes, settlement timing, inventory valuation and other adjustments may change actual profit.</p></section>}

        {active === "Expenses" && <section className="panel full-panel"><div className="panel-head"><div><h3>Expense manager</h3><p>Track operating and marketplace-related costs</p></div><button className="primary-btn" onClick={()=>setShowExpense(true)}><Plus size={16}/> Add expense</button></div><div className="expense-total"><span>Total recorded expenses</span><b>{money(expenseTotal)}</b></div><div className="table-scroll"><table><thead><tr><th>Expense</th><th>Category</th><th>Date</th><th>Amount</th></tr></thead><tbody>{expenses.map((e,i)=><tr key={i}><td><b>{e.name}</b></td><td>{e.category}</td><td>{e.date}</td><td>{money(e.amount)}</td></tr>)}</tbody></table></div></section>}

        {active === "GST Center" && <section className="gst-grid"><div className="panel gst-card"><div className="gst-icon"><FileSpreadsheet/></div><h3>GSTR-1 preparation</h3><p>Prepare outward supply data, B2B/B2C classification, HSN summary and credit/debit note checks.</p><span className="status-tag">Data required</span><button className="wide-outline" onClick={()=>setNotice("GST import is a planned integration. No return has been generated or filed.")}>Open GSTR-1 workspace <ArrowUpRight size={14}/></button></div><div className="panel gst-card"><div className="gst-icon blue-gst"><Calculator/></div><h3>GSTR-3B preparation</h3><p>Organize outward tax liability, eligible ITC and tax payment summaries for review.</p><span className="status-tag">Data required</span><button className="wide-outline" onClick={()=>setNotice("GSTR-3B requires purchase/ITC and tax payment records in addition to marketplace sales.")}>Open GSTR-3B workspace <ArrowUpRight size={14}/></button></div><div className="panel gst-note"><CheckCircle2/><div><b>Validation-first workflow</b><p>We will validate GSTIN, invoice references, HSN, place of supply, tax rates and duplicate records before preparing portal-compatible output. Seller/accountant approval is required before filing.</p></div></div></section>}

        {active === "AI Advisor" && <section className="panel full-panel"><div className="panel-head"><div><h3><Lightbulb size={18}/> AI business advisor</h3><p>Rule-based starter insights; AI provider connection comes later</p></div><span className="ai-pill">BETA</span></div><div className="advisor-grid"><div className="advisor-card"><span className="advisor-symbol orange-bullet"><Activity/></span><h4>Marketplace fee review</h4><p>Compare fee per unit and shipping by SKU across Amazon and Flipkart. Prioritize SKUs with lower contribution after all charges.</p></div><div className="advisor-card"><span className="advisor-symbol green-bullet"><ArrowUpRight/></span><h4>Improve product contribution</h4><p>Check product cost, discounting, ads and returns together before changing price or ad spend.</p></div><div className="advisor-card"><span className="advisor-symbol blue-bullet"><FileCheck2/></span><h4>GST reconciliation</h4><p>Match marketplace tax reports with invoices and settlement records before preparing returns.</p></div></div></section>}

        {active === "Inventory" && <section className="panel full-panel"><div className="panel-head"><div><h3>Inventory overview</h3><p>Starter product catalogue from imported order data</p></div></div><div className="table-scroll"><table><thead><tr><th>Product</th><th>SKU</th><th>Units sold</th><th>Sales value</th><th>Stock status</th></tr></thead><tbody>{products.map((p:any)=><tr key={p.sku}><td><b>{p.product}</b></td><td>{p.sku}</td><td>{p.units}</td><td>{money(p.revenue)}</td><td><span className="status-tag">Stock sync pending</span></td></tr>)}</tbody></table></div></section>}

        {active === "Integrations" && <section className="integration-grid"><IntegrationCard name="Amazon Seller Central" detail="Selling Partner API · Orders, reports, fees and settlements" color="amazon" onClick={()=>setNotice("Amazon connection is not active. Add approved SP-API credentials in secure server settings in the integration phase.")}/><IntegrationCard name="Flipkart Seller Hub" detail="Seller APIs · Orders, returns, reports and settlements" color="flip" onClick={()=>setNotice("Flipkart connection is not active. Partner/API authorization is required before syncing.")}/><div className="panel integration-info"><CheckCircle2/><div><b>Secure connection design</b><p>Marketplace tokens will be encrypted and stored server-side. Never paste seller passwords or API secrets into this dashboard.</p></div></div></section>}

        {active === "Settings" && <section className="panel full-panel"><div className="panel-head"><div><h3>Workspace settings</h3><p>Starter configuration</p></div></div><div className="settings-row"><div><b>Business profile</b><p>Legal business name, address and timezone</p></div><span className="status-tag">Not configured</span></div><div className="settings-row"><div><b>GST registrations</b><p>Add GSTINs and registration states in the next release</p></div><span className="status-tag">Not configured</span></div><div className="settings-row"><div><b>Subscription</b><p>Plans and billing will be enabled after MVP validation</p></div><span className="status-tag">Development</span></div></section>}
        <footer>© 2026 AMKART SELLER AI <span>Built for smarter marketplace decisions</span></footer>
      </div>
    </main>

    {mobileNav && <button className="scrim" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>}
    {showExpense && <div className="modal-backdrop" onClick={()=>setShowExpense(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h3>Add expense</h3><p>Record an operating expense in this demo session.</p></div><button className="icon-btn" onClick={()=>setShowExpense(false)}><X/></button></div><label>Expense name<input value={expenseName} onChange={e=>setExpenseName(e.target.value)} placeholder="e.g. Packaging material"/></label><label>Amount (INR)<input type="number" min="1" value={expenseAmount} onChange={e=>setExpenseAmount(e.target.value)} placeholder="2500"/></label><div className="modal-actions"><button className="subtle-btn" onClick={()=>setShowExpense(false)}>Cancel</button><button className="primary-btn" onClick={addExpense}>Save expense</button></div></div></div>}
  </div>;
}

function SalesTable({sales}:{sales:Sale[]}) {
  return <div className="table-scroll"><table><thead><tr><th>Order</th><th>Product</th><th>Channel</th><th>Units</th><th>Revenue</th><th>Contribution</th></tr></thead><tbody>{sales.map(s=><tr key={s.id}><td><b>{s.order}</b><small>{s.date}</small></td><td>{s.product}<small>{s.sku}</small></td><td><span className={`channel-tag ${s.platform.toLowerCase()}`}>{s.platform}</span></td><td>{s.units}</td><td>{money(s.revenue)}</td><td className={calculateSaleProfit(s)>=0?"positive-text":"negative-text"}>{money(calculateSaleProfit(s))}</td></tr>)}</tbody></table></div>;
}

function IntegrationCard({name,detail,color,onClick}:{name:string;detail:string;color:string;onClick:()=>void}) {
  return <div className="panel integration-card"><div className={`market-logo ${color}`}>{color==="amazon"?"a":"F"}</div><h3>{name}</h3><p>{detail}</p><span className="status-tag">Not connected</span><button className="wide-outline" onClick={onClick}>Connect account <Link2 size={14}/></button></div>;
}
