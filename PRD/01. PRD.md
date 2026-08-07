\# 🤖 Task Directive for AI Agent Programmer



\*\*Subject:\*\* Codebase Audit \& Feature Implementation Request — Real Estate SaaS



Please review the Product Requirements Document (PRD) below alongside the baseline codebase prototype (`alghanam\_real\_estate (67).html`)\[cite: 1].



\### \*\*Your Assignment:\*\*

1\. \*\*Audit \& Verification:\*\* Check the current codebase (`alghanam\_real\_estate (67).html`) to see which features from the PRD checklist are already implemented\[cite: 1]. Verify that their implementation is fully correct and aligns with the logic and Arabic terminology specified in the PRD\[cite: 1].

2\. \*\*Development \& Refactoring:\*\* If a feature is \*\*partially implemented, incorrect, or missing\*\*, proceed to write/update the code to fully implement it.

3\. \*\*Execution Summary Report:\*\* Once finished, provide a clean summary table categorizing:

&#x20;  \* ✅ \*\*Verified Existing Features\*\* (Already implemented \& confirmed correct)\[cite: 1].

&#x20;  \* 🛠️ \*\*Refactored / Updated Features\*\* (Were present but fixed/updated to match PRD)\[cite: 1].

&#x20;  \* 🆕 \*\*Newly Developed Features\*\* (Were missing and now built)\[cite: 1].



\---



\# 📄 Product Requirements Document (PRD)

\*\*Project Name:\*\* Real Estate SaaS Platform (Dashboard \& Property Engine)  

\*\*Target Market:\*\* Saudi Real Estate Market (REGA \& FAL License Compliant)  

\*\*Reference Baseline:\*\* `alghanam\_real\_estate (67).html`\[cite: 1]



\---



\## 1. Executive Summary \& Core Platform Philosophy

The platform is an end-to-end SaaS application designed for Saudi real estate brokerages and offices. The objective is to unify listing management, owner/bidding CRM, project mapping, and administrative controls into a streamlined interface.



\### Key Architectural Guidelines

\* \*\*Localization \& Language Strategy:\*\* Standardize input fields (Title, Description) to a single primary language per listing rather than forcing dual Arabic/English entries. Prepare system architecture for dynamic auto-translation on the public frontend.

\* \*\*Global Currency \& Office Settings:\*\* System-wide management for default currency (`ريال سعودي` / `SAR`) and office licensing (e.g., FAL License number). Remove redundant currency selectors from listing forms; fetch office licenses globally.



\---



\## 2. Dashboard Overview Module (`#page-dashboard`)



\### 2.1 KPI Cards (Analytics Summary)

\* \*\*Property Overview:\*\* Total active, draft, and archived listings broken down by category (Residential, Commercial, Agricultural).

\* \*\*Owner \& Bid Statistics:\*\* Total registered property owners and total active bids (Soms).

\* \*\*Financial Performance:\*\*

&#x20; \* \*\*Current Month Sales:\*\* Total monetary value of sold/rented properties in the current month with percentage change vs. prior month.

&#x20; \* \*\*Current Quarter Sales (Q1/Q2/Q3/Q4):\*\* Quarterly performance metrics updated dynamically.

&#x20; \* \*\*Conversion Rate Metric:\*\* Calculated using the core conversion logic:

&#x20;   $$\\text{Conversion Rate (\\%)} = \\left( \\frac{\\text{Successful Deals / Inquiries}}{\\text{Total Visitors / Inquiries}} \\right) \\times 100$$



\### 2.2 Quick Action Logs \& Tables

\* \*\*Latest Listings Table:\*\* Quick-access list displaying recent property additions.

\* \*\*Latest Bids Log:\*\* Real-time log showing incoming bids (Som) with bidder info, bid amount, and timestamp.



\---



\## 3. Property Management Engine (`#page-properties` \& Form Flows)



\### 3.1 Main Navigation \& Master View

\* \*\*Sidebar Action:\*\* Clicking the main \*\*"العقارات" (Properties)\*\* button in the sidebar must open an unfiltered view of \*\*All Listings\*\* across all categories (Residential, Commercial, Agricultural).

\* \*\*Top Filter Bar:\*\* Must provide multi-criteria real-time filtering:

&#x20; \* Listing Status (Published, Draft, Archived).

&#x20; \* Deal Type (For Sale / For Rent).

&#x20; \* Main Category \& Dynamic Sub-Types.

&#x20; \* Price Range \& Area Range.

\* \*\*Dynamic Search Bar Sync:\*\* Any new property tag, custom category, or sector added via admin controls must instantly sync with the global filter options.



\### 3.2 Property Owner Integration \& Owner CRM

\* \*\*Form Field Positioning:\*\* Owner selection must appear at the start of the "Add Listing" form.

\* \*\*Owner Selection Dropdown:\*\* Searchable selector linked to registered owners.

\* \*\*Quick-Add Owner Modal:\*\* Inline modal to create an owner without leaving the property form.

&#x20; \* \*Required Fields:\* Name, Mobile Number, \*\*National ID / IQAMA (Mandatory)\*\*, and \*\*Date of Birth (Mandatory for REGA compliance)\*\*.

\* \*\*Dedicated "Manage Owners" Page:\*\* Independent CRM dashboard page to view owners, their attached assets, and financial contracts.



\### 3.3 Dynamic Categorization \& Sector Logic

\* \*\*Contextual Sector Filtering:\*\* Sub-types must strictly filter based on the primary sector selected:

&#x20; \* \*\*Residential (سكني):\*\* Show only Villa, Duplex, Apartment, Townhouse.

&#x20; \* \*\*Commercial (تجاري):\*\* Show only Office, Commercial Building, Shop, Warehouse.

&#x20; \* \*\*Agricultural (زراعي):\*\* Show only Farm, Rest House, Raw Land.

\* \*\*Custom Classification Management:\*\* Admins must have an \*\*"Add Category / Classification"\*\* option to support regional terminology differences (e.g., terminology differences between Riyadh, Buraidah, Jeddah).



\### 3.4 Pricing, Payment Terms \& Private Bidding System ("Had" vs. "Som")

\* \*\*Pricing Type Toggle:\*\*

&#x20; \* \*\*Asking Price (حد / Had):\*\* Exposes fixed price input field.

&#x20; \* \*\*Highest Bid (سوم / Som):\*\* Exposes "Latest Bid Amount" input field.

\* \*\*Private Bidding Log (Som Log):\*\*

&#x20; \* Support logging multiple bids per listing.

&#x20; \* \*Fields per bid:\* Bidder Name, Mobile Number, Bid Amount, Bid Date (editable manually for backdated bids).

&#x20; \* \*\*Privacy Control:\*\* Bidder identity (Name/Phone) remains internal to employees and admins. Public visitors only see the highest bid value and date.

\* \*\*Payment Method Logic (Cash vs. Bank) \& Filter behavior:\*\*

&#x20; \* If a listing accepts both bank financing and cash, classify it as \*\*"Bank" (يقبل البنك)\*\*.

&#x20; \* \*\*Filter Behavior:\*\*

&#x20;   \* When a public user filters for \*\*"Cash"\*\*, show ALL listings (both Cash-only and Bank-approved).

&#x20;   \* When a public user filters for \*\*"Bank"\*\*, show ONLY Bank-approved listings.



\### 3.5 Geographic Location \& Mapping Engine

\* \*\*Location Hierarchy:\*\*

&#x20; 1. Select \*\*City\*\* (e.g., Buraidah).

&#x20; 2. Select \*\*District/Neighborhood (الحي)\*\*.

&#x20; 3. \*\*Auto-Sector Direction Assignment:\*\* Automatically tag sector direction based on selected city/district (e.g., North Buraidah, East Buraidah, South-East Buraidah, Central Buraidah).

\* \*\*Simplified Address Entry:\*\* Eliminate manual text fields for Street Name, Latitude, and Longitude.

\* \*\*Google Maps Picker \& Embed:\*\* Interactive embedded map. Picking a pin automatically extracts coordinates and location context.

\* \*\*Interactive Parcel / Masterplan Mapping (المخططات التفاعلية):\*\*

&#x20; \* Display subdivision masterplans using polygon overlays.

&#x20; \* Color-code individual parcels (e.g., Green = Available, Yellow = Active Bid, Red = Sold).

&#x20; \* Interactive click event on any parcel to display a quick card: Parcel Number, Area, Price/Bid, and View Listing link.



\### 3.6 Specifications \& Smart Conditional Fields

\* \*\*Conditional Visibility:\*\* Automatically hide irrelevant fields when certain property types are selected (e.g., selecting "Land" hides Bedrooms, Bathrooms, and Building Area).

\* \*\*Zero/Empty Value Handling:\*\* If fields like Bedrooms or Bathrooms are set to `0` or left blank, do NOT display "0 Bedrooms" on the public card/page; hide the row entirely.

\* \*\*Dimensions Fields (الأطوال):\*\* Dedicated fields for plot boundary lengths:

&#x20; \* North Border Length

&#x20; \* South Border Length

&#x20; \* East Border Length

&#x20; \* West Border Length

\* \*\*Optional Features:\*\* Street Width (in meters), Property Age (New / Years), Floor Number (for apartments), Building Surface Area (مسطح البناء).



\### 3.7 Documentation, Internal Notes \& Media

\* \*\*Marketing \& Legal Docs:\*\*

&#x20; \* Deed Number (رقم الصك) \& Deed Attachment Upload (PDF/Image).

&#x20; \* Marketing Contract Number \& Expiration Date.

&#x20; \* \*Note:\* Office FAL License number is pulled globally from platform settings.

\* \*\*Internal Staff Notes (ملاحظات الموظفين):\*\* Private internal field hidden from public clients (e.g., "Key under meter box", "Owner willing to discount 10k for fast cash").

\* \*\*Media Drag-and-Drop:\*\* Photo gallery uploader, video file uploader, and YouTube video URL integration.



\---



\## 4. Front-End Arabic Wording Dictionary (قاموس مصطلحات الواجهات)



| UI Section / Context | Field / Element | Technical Identifier | Arabic Wording (النص العربي) |

| :--- | :--- | :--- | :--- |

| \*\*Global Controls\*\* | Primary Currency | `global\_currency` | ريال سعودي |

| | Add Listing Button | `btn\_add\_property` | إضافة عقار |

| | Save Draft | `btn\_save\_draft` | حفظ كمسودة |

| | Publish Listing | `btn\_publish` | نشر الإعلان |

| \*\*Dashboard KPI\*\* | Total Listings | `kpi\_total\_properties` | إجمالي العقارات |

| | Total Bids Log | `kpi\_total\_soms` | إجمالي السومات النشطة |

| | Current Month Sales | `kpi\_sales\_month` | مبيعات الشهر الحالي |

| | Current Quarter Sales| `kpi\_sales\_quarter` | مبيعات الربع الحالي |

| | Conversion Rate | `kpi\_conversion\_rate` | معدل التحويل |

| \*\*Owner CRM \& Form\*\* | Owner Selector | `lbl\_owner\_select` | اختر المالك |

| | Quick Add Owner | `btn\_add\_owner` | + إضافة مالك جديد |

| | Owner ID/IQAMA | `lbl\_owner\_id` | رقم الهوية / الإقامة |

| | Owner Birth Date | `lbl\_owner\_dob` | تاريخ الميلاد (هجري / ميلادي) |

| | Owner Page Title | `title\_owner\_mgmt` | إدارة الملاك والأصول |

| \*\*Pricing \& Bids\*\* | Price Type Selector | `lbl\_price\_type` | طبيعة السعر |

| | Fixed Price Option | `opt\_had` | حد (سعر ثابت) |

| | Bidding Option | `opt\_som` | على السوم |

| | Fixed Price Input | `lbl\_asking\_price` | الحد (السعر المطلوب) |

| | Latest Bid Input | `lbl\_latest\_bid` | آخر سومة |

| | Bidder Name | `lbl\_bidder\_name` | اسم السايم (خاص بالإدارة) |

| | Bidder Phone | `lbl\_bidder\_phone` | رقم جوال السايم (خاص) |

| | Bid Date | `lbl\_bid\_date` | تاريخ السومة |

| | Log Bid Action | `btn\_add\_bid` | تسجيل سومة جديدة |

| \*\*Payment Logic\*\* | Payment Method | `lbl\_payment\_method` | طريقة الدفع المقبولة |

| | Cash Only | `opt\_cash\_only` | كاش فقط |

| | Bank Approved | `opt\_bank` | يقبل البنك والكاش |

| \*\*Location \& Sector\*\*| Sector Direction | `lbl\_sector\_dir` | جهة العقار بالمدينة |

| | Directions Options | `opt\_directions` | شمال / جنوب / شرق / غرب / وسط |

| | Google Map Picker | `lbl\_map\_picker` | حدد موقع العقار على الخريطة |

| | Masterplan Map | `lbl\_masterplan` | المخطط التفاعلي للقطع |

| \*\*Plot Dimensions\*\* | North Length | `lbl\_dim\_north` | الضلع الشمالي (متر) |

| | South Length | `lbl\_dim\_south` | الضلع الجنوبي (متر) |

| | East Length | `lbl\_dim\_east` | الضلع الشرقي (متر) |

| | West Length | `lbl\_dim\_west` | الضلع الغربي (متر) |

| | Street Width | `lbl\_street\_width` | عرض الشارع (متر) |

| | Building Area | `lbl\_build\_area` | مسطح البناء (م²) |

| \*\*Legal \& Internal\*\* | Deed Number | `lbl\_deed\_num` | رقم الصك |

| | Deed Attachment | `lbl\_deed\_file` | مرفق صورة/ملف الصك |

| | Marketing Contract | `lbl\_marketing\_contract`| رقم العقد التسويقي |

| | Contract Expiry | `lbl\_contract\_expiry` | تاريخ نهاية العقد التسويقي |

| | Internal Staff Notes | `lbl\_internal\_notes` | ملاحظات سرّية للموظفين (لا تظهر للعميل) |

| \*\*Actions \& Utilities\*\*| Copy WhatsApp Text | `btn\_copy\_wa` | نسخ العرض للواتساب |

| | Download PDF Brochure| `btn\_download\_brochure`| تحميل بروشور PDF |

| | Custom Category Add | `btn\_add\_category` | + إضافة تصنيف عقاري مخصص |



\---



\## 5. Feature Implementation Checklist



```markdown

\### 📋 Feature Audit \& Implementation Checklist



\#### 1. Overview \& Analytics

\- \[ ] KPI Cards for Total Active Listings, Total Bids, and Total Owners

\- \[ ] Financial KPIs: Current Month Sales + Current Quarter Sales

\- \[ ] Dynamic Conversion Rate Calculation Logic

\- \[ ] Quick Logs for Incoming Bids and Recent Listings



\#### 2. Property Management \& Navigation

\- \[ ] Sidebar "العقارات" button opens unfiltered view of ALL listings

\- \[ ] Real-time sync between listing creation tags and search bar filters

\- \[ ] Sector Context Filtering (Residential vs. Commercial vs. Agricultural)

\- \[ ] Dynamic "Add Custom Category/Classification" modal



\#### 3. Owner \& Bidding Engine ("Had" vs "Som")

\- \[ ] Owner quick-selector in property form with "Add New Owner" modal

\- \[ ] Owner Mandatory Fields: National ID / IQAMA and Date of Birth (REGA)

\- \[ ] Dedicated "Manage Owners" page in admin dashboard

\- \[ ] Pricing Type Toggle: "Had" (Fixed Price) vs "Som" (Bidding)

\- \[ ] Private Bidding Log (Bidder info hidden from public, highest bid shown)

\- \[ ] Payment Method Logic (Cash filter returns all; Bank filter returns bank-approved only)



\#### 4. Mapping \& Location Features

\- \[ ] City -> District -> Auto-Sector Direction pipeline (e.g., North Buraidah)

\- \[ ] Removal of manual Lat/Long text boxes in favor of embedded Google Maps Picker

\- \[ ] Interactive Parcel/Masterplan Map with color-coded plot statuses (GIS polygons)



\#### 5. Listing Form \& Utility Extras

\- \[ ] Conditional field visibility (e.g., hide rooms for Land)

\- \[ ] Zero/Empty value hiding on public views

\- \[ ] Four-border plot dimension inputs (North, South, East, West lengths)

\- \[ ] Private Internal Staff Notes field

\- \[ ] Automated "WhatsApp Copy Text" Generator button in property tables

\- \[ ] Automatic PDF Property Brochure Generator with QR Code

