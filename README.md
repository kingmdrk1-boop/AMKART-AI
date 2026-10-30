# AMKART SELLER AI — MVP Starter

A responsive seller-intelligence dashboard starter for a multi-tenant SaaS product.

## Included in this MVP
- Overview dashboard with Amazon / Flipkart channel comparison
- Sales and order table
- CSV import for a normalized order-cost format
- Product-wise units, revenue and contribution comparison
- Starter profit & loss calculation
- Expense entry (in-memory demo session)
- GST preparation center placeholder with validation-first workflow
- AI advisor starter insights (rules/content only; no AI provider connected)
- Marketplace integration screens (not connected)
- Responsive desktop/mobile layout

## Important MVP limitations
This is a **front-end demo MVP**, not a live accounting or GST filing system.
- Dashboard uses illustrative sample data.
- CSV import and added expenses are held in browser memory only; refresh resets them.
- No user authentication, tenant database, live Amazon/Flipkart API, AI API, payment gateway or GST portal integration is enabled yet.
- Do not enter real seller credentials, GST secrets, or customer personal data.
- GST exports must be built against the current GSTN schema and validated before use. This MVP does not generate or file returns.

## Requirements
- Node.js 20.9+
- npm

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## CSV import format
Header row:
```csv
order_id,product,sku,platform,date,units,revenue,product_cost,marketplace_fee,shipping,ads,returns
```
Example:
```csv
AMZ-1001,Wireless Earbuds Pro,AMK-WEP-01,Amazon,2026-10-29,2,2998,1400,360,120,80,0
FLK-2001,Steel Bottle,AMK-SWB-02,Flipkart,2026-10-29,3,1497,600,195,90,40,0
```
Amounts are INR numeric values. This is a normalized template, not an official marketplace export format. Convert marketplace reports to this format only after mapping and reconciling their columns.

## Deploy to Netlify
1. Push this project to your GitHub repository.
2. In Netlify choose **Add new site → Import an existing project** and select this repository.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `.next`, Node 20. Netlify automatically installs and configures its official Next.js runtime for supported Next.js projects.
4. Deploy. The Next.js App Router page is rendered by Next.js; a separate static `index.html` is not required.
5. Add database and other environment variables only after the corresponding secure backend services have been implemented.

### Netlify configuration
- `netlify.toml` configures the Next.js build command and publish directory; Netlify auto-detects the Next.js runtime.
- `.nvmrc` and `NODE_VERSION` select Node 20.
- Do not deploy marketplace secrets in client-side variables. Use server-side environment variables only after OAuth/token storage is implemented.

## Recommended production architecture
- Next.js App Router + TypeScript
- Managed PostgreSQL with tenant_id on all tenant-owned records
- Row-level security / server-side tenant authorization
- Secure authentication and role-based access
- Background job queue for marketplace sync
- Encrypted OAuth credentials, webhook signature checks and audit logs
- Separate accounting ledger for orders, refunds, fees, settlements and GST adjustments
- GST schema versioning and validation with accountant approval

## Next implementation milestones
1. Auth, organizations, memberships and tenant isolation
2. PostgreSQL schema and durable order/expense imports
3. Amazon SP-API and Flipkart API authorization + sync workers
4. Settlement reconciliation and SKU-level contribution accounting
5. GST purchase/sales data ingestion, GSTR-1 / GSTR-3B preparation and official JSON schema validation
6. Subscription billing, admin console, monitoring and production security review
