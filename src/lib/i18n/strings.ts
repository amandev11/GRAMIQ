/**
 * GRAMIQ i18n string registry — English / Hindi / Hinglish.
 *
 * Every piece of GENERATED narrative content (blueprint, scores, risks,
 * copilot, market, action plan, business plan) pulls strings from here.
 * Deterministic numbers stay in the finance engine; only human-language
 * phrasing is localized.
 *
 * Hinglish = natural Roman-script Hindi mixed with English, the way people
 * actually speak — NOT Sanskritized Hindi, NOT machine translation.
 */

export type Lang = "en" | "hi" | "hinglish";

/** Section labels used by the Business Plan report + ReportPlayer. */
export const REPORT_SECTIONS: Record<Lang, { key: string; title: string }[]> = {
  en: [
    { key: "summary", title: "Executive Summary" },
    { key: "profile", title: "Entrepreneur Profile" },
    { key: "idea", title: "Business Idea & Products" },
    { key: "market", title: "Market Opportunity" },
    { key: "investment", title: "Startup Investment & Expenses" },
    { key: "revenue", title: "Revenue & Profit Projection" },
    { key: "risks", title: "Risk Analysis" },
    { key: "funding", title: "Funding Opportunities" },
    { key: "timeline", title: "Implementation Timeline" },
    { key: "assumptions", title: "Assumptions & Data Sources" },
  ],
  hi: [
    { key: "summary", title: "कार्यकारी सारांश" },
    { key: "profile", title: "उद्यमी प्रोफ़ाइल" },
    { key: "idea", title: "व्यापार विचार और उत्पाद" },
    { key: "market", title: "बाज़ार अवसर" },
    { key: "investment", title: "शुरुआती निवेश और खर्च" },
    { key: "revenue", title: "आय और लाभ अनुमान" },
    { key: "risks", title: "जोखिम विश्लेषण" },
    { key: "funding", title: "वित्तपोषण अवसर" },
    { key: "timeline", title: "कार्यान्वयन समयरेखा" },
    { key: "assumptions", title: "धारणाएँ और डेटा स्रोत" },
  ],
  hinglish: [
    { key: "summary", title: "Executive Summary" },
    { key: "profile", title: "Entrepreneur Profile" },
    { key: "idea", title: "Business Idea & Products" },
    { key: "market", title: "Market Opportunity" },
    { key: "investment", title: "Startup Investment & Expenses" },
    { key: "revenue", title: "Revenue & Profit Projection" },
    { key: "risks", title: "Risk Analysis" },
    { key: "funding", title: "Funding Opportunities" },
    { key: "timeline", title: "Implementation Timeline" },
    { key: "assumptions", title: "Assumptions & Data Sources" },
  ],
};

export const L = {
  /* ── Blueprint ── */
  blueprint: {
    businessName: {
      en: "Small Dairy Enterprise",
      hi: "लघु डेयरी उद्यम",
      hinglish: "Small Dairy Enterprise",
    },
    overview: (vars: {
      name: string; village: string; district: string; state: string;
      units: string; price: number; cost: number;
    }) => ({
      en: `${vars.name} plans to collect milk from small farmers around ${vars.village} (${vars.district}, ${vars.state}) and sell to households and shops. The model runs on ${vars.units} litres/month at ₹${vars.price}/L against a collection cost of ₹${vars.cost}/L.`,
      hi: `${vars.name} ${vars.village} (${vars.district}, ${vars.state}) के पास छोटे किसानों से दूध इकट्ठा कर घरों और दुकानों को बेचने का प्लान बना रहे हैं। यह मॉडल ${vars.units} लीटर/माह पर ₹${vars.price}/लीटर बिक्री और ₹${vars.cost}/लीटर संग्रह लागत पर चलता है।`,
      hinglish: `${vars.name} ${vars.village} (${vars.district}, ${vars.state}) ke paas chhote kisano se doodh ikattha kar ghar aur dukanon ko bechne ka plan ban rahe hain. Model ${vars.units} litre/month par ₹${vars.price}/L par chalta hai, collection cost ₹${vars.cost}/L.`,
    }),
    whyThisBusiness: (vars: { capital: string; resource: string }) => ({
      en: [
        "Daily cash collection — no long credit cycles like crop businesses.",
        `Uses existing family labor (${vars.resource ?? "available"}), keeping fixed costs low.`,
        "Steady everyday demand; milk is bought in good and bad months alike.",
        `Small starting capital fits your available ₹${vars.capital}.`,
      ],
      hi: [
        "रोज़ नकद वसूली — फसल व्यवसायों जैसे लंबे क्रेडिट चक्र नहीं।",
        `पहले से उपलब्ध परिवार का श्रम (${vars.resource ?? "उपलब्ध"}) इस्तेमाल करता है, जिससे निश्चित लागत कम रहती है।`,
        "स्थिर रोज़मर्रा की माँग; दूध अच्छे और बुरे दोनों महीनों में बिकता है।",
        `छोटी शुरुआती पूँजी आपकी उपलब्ध ₹${vars.capital} के अनुरूप है।`,
      ],
      hinglish: [
        "Daily cash collection — crop business jaisa long credit cycle nahi padta.",
        `Existing family labor (${vars.resource ?? "available"}) use karta hai, isse fixed cost kam rehta hai.`,
        "Steady everyday demand; doodh achhe aur bure dono mahine bikta hai.",
        `Chhoti starting capital aapki available ₹${vars.capital} ke hisaab se fit hai.`,
      ],
    }),
    investmentBreakdown: {
      en: [
        { label: "Equipment (cans, testing kit, cooler share)" },
        { label: "Initial working stock" },
        { label: "Setup & licenses" },
      ],
      hi: [
        { label: "उपकरण (कैन, टेस्टिंग किट, कूलर हिस्सा)" },
        { label: "शुरुआती कार्यशील स्टॉक" },
        { label: "स्थापना और लाइसेंस" },
      ],
      hinglish: [
        { label: "Equipment (cans, testing kit, cooler share)" },
        { label: "Initial working stock" },
        { label: "Setup & licenses" },
      ],
    } as Record<Lang, { label: string }[]>,
    monthlyExpenses: {
      en: [
        { label: "Labor" },
        { label: "Utilities (electricity, chiller share)" },
        { label: "Transport & misc" },
        { label: "Rent" },
        { label: "Loan EMI" },
      ],
      hi: [
        { label: "मज़दूरी" },
        { label: "उपयोगिताएँ (बिजली, चिलर हिस्सा)" },
        { label: "परिवहन और विविध" },
        { label: "किराया" },
        { label: "ऋण EMI" },
      ],
      hinglish: [
        { label: "Labor" },
        { label: "Utilities (electricity, chiller share)" },
        { label: "Transport & misc" },
        { label: "Rent" },
        { label: "Loan EMI" },
      ],
    } as Record<Lang, { label: string }[]>,
    marketOpportunity: (vars: { village: string }) => ({
      en: [
        `DEMO DATA: ~180 households within 4 km of ${vars.village} buy milk daily.`,
        "DEMO DATA: 12 tea stalls on the highway belt have no formal milk contract.",
        "AI ESTIMATE: capturing 35–40% of nearby household demand covers your planned volume.",
      ],
      hi: [
        `DEMO DATA: ${vars.village} के 4 किमी भीतर ~180 घर रोज़ दूध खरीदते हैं।`,
        "DEMO DATA: हाईवे पट्टी पर 12 चाय की दुकानों का कोई औपचारिक दूध अनुबंध नहीं है।",
        "AI ESTIMATE: पास के घरों की माँग का 35–40% पकड़ना आपकी योजनित मात्रा को कवर करता है।",
      ],
      hinglish: [
        `DEMO DATA: ${vars.village} ke 4 km ke andar ~180 households roz doodh kharidte hain.`,
        "DEMO DATA: Highway belt par 12 chai stalls ka koi formal milk contract nahi hai.",
        "AI ESTIMATE: Paas ke households ki demand ka 35–40% pakadna aapki planned volume cover kar deta hai.",
      ],
    }),
    fundingOptions: {
      en: [
        "Self-funding from savings (current plan)",
        "DEMO: dairy development subsidy — see Funding & Schemes page",
        "DEMO: collateral-free micro credit line for working capital",
      ],
      hi: [
        "बचत से स्वयं वित्तपोषण (वर्तमान योजना)",
        "DEMO: डेयरी विकास सब्सिडी — वित्तपोषण और योजनाएँ पृष्ठ देखें",
        "DEMO: कार्यशील पूँजी के लिए बिना गिरवी लघु क्रेडिट लाइन",
      ],
      hinglish: [
        "Self-funding from savings (current plan)",
        "DEMO: dairy development subsidy — Funding & Schemes page dekho",
        "DEMO: collateral-free micro credit line for working capital",
      ],
    } as Record<Lang, string[]>,
  },

  /* ── Scores breakdown labels ── */
  scores: {
    financial: {
      label: { en: "Financial Viability", hi: "वित्तीय व्यवहार्यता", hinglish: "Financial Viability" },
      explanation: (vars: { profit: string; margin: string }) => ({
        en: `Projected operating profit of ${vars.profit}/month at a ${vars.margin}% margin drives this score.`,
        hi: `अनुमानित परिचालन लाभ ${vars.profit}/माह, ${vars.margin}% मार्जिन पर, इस स्कोर को चलाता है।`,
        hinglish: `Projected operating profit ${vars.profit}/month at ${vars.margin}% margin — yeh score drive karta hai.`,
      }),
      improvement: {
        en: "Raise contribution per unit by ₹2–3/L via direct household sales instead of shop-only supply.",
        hi: "केवल दुकान आपूर्ति के बजाय प्रत्यक्ष घर विक्री से प्रति इकाई योगदान ₹2–3/लीटर बढ़ाएँ।",
        hinglish: "Contribution per unit ₹2–3/L badhao — direct household sales se, sirf shop supply ke bajaye.",
      },
    },
    market: {
      label: { en: "Market Opportunity", hi: "बाज़ार अवसर", hinglish: "Market Opportunity" },
      explanation: (vars: { units: string; village: string; district: string }) => ({
        en: `Planned volume of ${vars.units} L/month against local demand signals in ${vars.village}, ${vars.district}.`,
        hi: `${vars.units} ली./माह की योजनित मात्रा, ${vars.village}, ${vars.district} में स्थानीय माँग संकेतों के विरुद्ध।`,
        hinglish: `Planned volume ${vars.units} L/month against local demand signals in ${vars.village}, ${vars.district}.`,
      }),
      improvement: {
        en: "Sign 3–4 tea stalls on the highway belt for fixed daily offtake.",
        hi: "निश्चित दैनिक अपलेक के लिए हाईवे पट्टी पर 3–4 चाय दुकानें जोड़ें।",
        hinglish: "Highway belt par 3–4 chai stalls sign karo for fixed daily offtake.",
      },
    },
    risk: {
      label: { en: "Risk Resilience", hi: "जोखिम सहनशीलता", hinglish: "Risk Resilience" },
      explanation: (vars: { be: string }) => ({
        en: `Break-even in ~${vars.be} months with low fixed costs keeps downside limited.`,
        hi: `कम निश्चित लागत के साथ ~${vars.be} माह में ब्रेक-ईन, नुकसान सीमित रखता है।`,
        hinglish: `Break-even ~${vars.be} months mein with low fixed costs — downside limited rehta hai.`,
      }),
      improvement: {
        en: "Keep one month of operating costs as cash buffer before scaling volume.",
        hi: "मात्रा बढ़ाने से पहले एक माह की परिचालन लागत को नकद बफर के रूप में रखें।",
        hinglish: "Volume badhane se pehle ek month ki operating cost cash buffer rakh lo.",
      },
    },
    funding: {
      label: { en: "Funding Readiness", hi: "वित्तपोषण तत्परता", hinglish: "Funding Readiness" },
      explanation: (vars: { capital: string; startup: string }) => ({
        en: `Available capital ${vars.capital} vs startup need ${vars.startup}.`,
        hi: `उपलब्ध पूँजी ${vars.capital} बनाम स्टार्टअप आवश्यकता ${vars.startup}।`,
        hinglish: `Available capital ${vars.capital} vs startup need ${vars.startup}.`,
      }),
      improvement: {
        en: "Prepare the GRAMIQ business plan PDF — it is accepted as a project report draft.",
        hi: "GRAMIQ व्यापार योजना PDF तैयार करें — इसे परियोजना रिपोर्ट ड्राफ्ट के रूप में स्वीकारा जाता है।",
        hinglish: "GRAMIQ business plan PDF taiyaar karo — yeh project report draft ke taur par accept hota hai.",
      },
    },
    operational: {
      label: { en: "Operational Readiness", hi: "परिचालन तत्परता", hinglish: "Operational Readiness" },
      explanation: (vars: { count: number }) => ({
        en: `${vars.count} resource advantage(s) recorded, including family labor support.`,
        hi: `${vars.count} संसाधन लाभ दर्ज, जिसमें परिवार का श्रम सहयोग शामिल है।`,
        hinglish: `${vars.count} resource advantage(s) recorded, including family labor support.`,
      }),
      improvement: {
        en: "Fix a cold-chain arrangement (shared cooler) before summer months.",
        hi: "गर्मियों से पहले शीत-शृंखला व्यवस्था (साझा कूलर) तय करें।",
        hinglish: "Summer se pehle cold-chain arrangement (shared cooler) fix karo.",
      },
    },
  },

  /* ── Risks ── */
  risks: {
    cost: {
      title: { en: "Raw Material Price Volatility", hi: "कच्चा माल मूल्य अस्थिरता", hinglish: "Raw Material Price Volatility" },
      why: (vars: { pct: number }) => ({
        en: `Raw material is about ${vars.pct}% of your revenue. Small price changes move profit sharply.`,
        hi: `कच्चा माल आपके राजस्व का लगभग ${vars.pct}% है। छोटे मूल्य बदलाव लाभ को तेज़ी से बदलते हैं।`,
        hinglish: `Raw material aapke revenue ka about ${vars.pct}% hai. Chhote price change profit ko sharply move karte hain.`,
      }),
      impact: {
        en: "AI ESTIMATE: an 8% input price rise could cut monthly profit by roughly 25–40%.",
        hi: "AI ESTIMATE: 8% इनपुट मूल्य वृद्धि मासिक लाभ को लगभग 25–40% तक कम कर सकती है।",
        hinglish: "AI ESTIMATE: 8% input price rise se monthly profit roughly 25–40% tak kam ho sakta hai.",
      },
      mitigation: {
        en: "Agree fixed weekly rates with 2+ suppliers; revisit rates monthly using your copilot.",
        hi: "2+ आपूर्तिकर्ताओं के साथ निश्चित साप्ताहिक दरें तय करें; अपने कोपायलट से मासिक रूप से दरें दोबारा देखें।",
        hinglish: "2+ suppliers ke saath fixed weekly rates agree karo; copilot se monthly rates revisit karo.",
      },
    },
    demand: {
      title: { en: "Slower Customer Ramp-Up", hi: "धीमी ग्राहक बढ़ोतरी", hinglish: "Slower Customer Ramp-Up" },
      why: {
        en: "Your plan assumes full sales from month 1; new routes typically take 3–6 months to fill.",
        hi: "आपकी योजना पहले माह से पूर्ण बिक्री मानती है; नए रूट भरने में आमतौर पर 3–6 माह लगते हैं।",
        hinglish: "Plan month 1 se full sales assume karta hai; naye routes typically 3–6 months mein fill hote hain.",
      },
      impact: {
        en: "AI ESTIMATE: at 70% volume your monthly profit falls to about 40–55% of plan.",
        hi: "AI ESTIMATE: 70% मात्रा पर आपका मासिक लाभ योजना का लगभग 40–55% रह जाता है।",
        hinglish: "AI ESTIMATE: 70% volume par monthly profit plan ka about 40–55% reh jata hai.",
      },
      mitigation: {
        en: "Start with a smaller pilot route and scale only after collections are stable for 3 weeks.",
        hi: "छोटे पायलट रूट से शुरू करें और 3 सप्ताह तक संग्रह स्थिर होने के बाद ही बढ़ाएँ।",
        hinglish: "Chhote pilot route se start karo aur 3 weeks stable collection ke baad hi scale karo.",
      },
    },
    cashflow: {
      title: { en: "Working Capital Gap", hi: "कार्यशील पूँजी अंतर", hinglish: "Working Capital Gap" },
      why: (vars: { wc: string; fc: string }) => ({
        en: `You hold ${vars.wc} working capital vs fixed costs of ${vars.fc}/month.`,
        hi: `आपके पास ${vars.wc} कार्यशील पूँजी है बनाम ${vars.fc}/माह निश्चित लागत।`,
        hinglish: `Aapke paas ${vars.wc} working capital hai vs ${vars.fc}/month fixed cost.`,
      }),
      impact: {
        en: "Below 2 months of cover, one slow collection week can force borrowing at high cost.",
        hi: "2 माह के कवर से नीचे, एक धीमी वसूली सप्ताह उच्च लागत पर उधार लेने पर मजबूर कर सकता है।",
        hinglish: "2 months cover se neeche, ek slow collection week high cost par borrow karne par majboor kar sakta hai.",
      },
      mitigation: {
        en: "Reserve at least 2 months of fixed costs; collect household payments weekly, not monthly.",
        hi: "कम से कम 2 माह की निश्चित लागत आरक्षित रखें; घर भुगतान मासिक नहीं साप्ताहिक वसूलें।",
        hinglish: "At least 2 months ki fixed cost reserve rakh lo; household payments weekly collect karo, monthly nahi.",
      },
    },
    competition: {
      title: { en: "Established Local Seller", hi: "स्थापित स्थानीय विक्रेता", hinglish: "Established Local Seller" },
      why: {
        en: "DEMO DATA shows an existing private milk seller on the main route selling at ₹47–48/L.",
        hi: "DEMO DATA मुख्य रूट पर एक मौजूदा निजी दूध विक्रेता ₹47–48/लीटर पर बेचता है।",
        hinglish: "DEMO DATA main route par ek existing private milk seller ₹47–48/L par bechta hai.",
      },
      impact: {
        en: "Price undercutting on overlapping streets could slow customer acquisition.",
        hi: "ओवरलैपिंग गलियों पर मूल्य कटौती ग्राहक अधिग्रहण धीमा कर सकती है।",
        hinglish: "Overlapping streets par price undercutting customer acquisition slow kar sakta hai.",
      },
      mitigation: {
        en: "Compete on freshness and home delivery timing rather than matching price cuts.",
        hi: "मूल्य कटौती से मेल खाने के बजाय ताज़गी और होम डिलीवरी समय पर प्रतिस्पर्धा करें।",
        hinglish: "Price cut match karne ke bajaye freshness aur home delivery timing par compete karo.",
      },
    },
    weather: {
      title: { en: "Summer Spoilage & Cold Chain", hi: "गर्मी खराबी और शीत-शृंखला", hinglish: "Summer Spoilage & Cold Chain" },
      why: {
        en: "Rajasthan summer temperatures raise spoilage risk without reliable cooling.",
        hi: "राजस्थान की गर्मियों के तापमान भरोसेमंद कूलिंग के बिना खराबी का जोखिम बढ़ाते हैं।",
        hinglish: "Rajasthan summer temperature reliable cooling ke bina spoilage risk badhata hai.",
      },
      impact: {
        en: "Spoilage above 3% can erase roughly half your monthly profit (AI ESTIMATE).",
        hi: "3% से ऊपर खराबी आपके मासिक लाभ का लगभग आधा हिस्सा मिटा सकती है (AI ESTIMATE)।",
        hinglish: "3% se upar spoilage aapke monthly profit ka roughly aadha hissa mita sakti hai (AI ESTIMATE).",
      },
      mitigation: {
        en: "Arrange shared chiller access and plan morning-only delivery in May–July.",
        hi: "साझा चिलर पहुँच की व्यवस्था करें और मई–जुलाई में केवल सुबह डिलीवरी की योजना बनाएँ।",
        hinglish: "Shared chiller access arrange karo aur May–July mein morning-only delivery plan banao.",
      },
    },
    funding: {
      title: { en: "Single-Source Capital", hi: "एकल-स्रोत पूँजी", hinglish: "Single-Source Capital" },
      why: (vars: { need: string; avail: string }) => ({
        en: `Startup needs ${vars.need} against ${vars.avail} available.`,
        hi: `स्टार्टअप को ${vars.need} चाहिए बनाम ${vars.avail} उपलब्ध।`,
        hinglish: `Startup ko ${vars.need} chahiye vs ${vars.avail} available.`,
      }),
      impact: {
        en: "Any equipment failure early on would come straight out of working capital.",
        hi: "शुरुआत में किसी भी उपकरण विफलता सीधे कार्यशील पूँजी से आएगी।",
        hinglish: "Shuruaat mein kisi bhi equipment failure seedhe working capital se aayegi.",
      },
      mitigation: {
        en: "Check scheme matches on the Funding page before committing all savings.",
        hi: "सारी बचत लगाने से पहले वित्तपोषण पृष्ठ पर योजना मिलान जाँचें।",
        hinglish: "Saari saving lagane se pehle Funding page par scheme match check karo.",
      },
    },
  },

  /* ── Market intelligence ── */
  market: {
    factors: {
      demand: { en: "Demand Signal", hi: "माँग संकेत", hinglish: "Demand Signal" },
      competition: { en: "Low Competition", hi: "कम प्रतिस्पर्धा", hinglish: "Low Competition" },
      accessibility: { en: "Accessibility", hi: "पहुँच", hinglish: "Accessibility" },
      supplier: { en: "Supplier Proximity", hi: "आपूर्तिकर्ता निकटता", hinglish: "Supplier Proximity" },
      reach: { en: "Market Reach", hi: "बाज़ार पहुँच", hinglish: "Market Reach" },
      logistics: { en: "Logistics Ease", hi: "रसद सहजता", hinglish: "Logistics Ease" },
    },
    demandSegments: {
      households: { en: "Households", hi: "घर", hinglish: "Households" },
      teaStalls: { en: "Tea stalls", hi: "चाय दुकानें", hinglish: "Tea stalls" },
      shops: { en: "Shops", hi: "दुकानें", hinglish: "Shops" },
    },
  },

  /* ── Action plan task text ── */
  actionPlan: [
    { en: "Talk to 10 households about milk price they pay today", hi: "10 घरों से उनके द्वारा आज दूध मूल्य पूछें", hinglish: "10 households se unka doodh price pata karo" },
    { en: "Meet Farmer Collection Points A & B about daily supply", hi: "किसान संग्रह बिंदु A और B से दैनिक आपूर्ति मिलें", hinglish: "Farmer Collection Points A & B se daily supply ke baare mein milo" },
    { en: "Price milk cans, testing kit and cooling arrangement", hi: "दूध कैन, टेस्टिंग किट और कूलिंग व्यवस्था का मूल्य लगाएँ", hinglish: "Milk cans, testing kit aur cooling arrangement price lagao" },
    { en: "Finalize supplier rates and write them into your plan", hi: "आपूर्तिकर्ता दरें अंतिम करें और उन्हें अपनी योजना में लिखें", hinglish: "Supplier rates finalize karo aur plan mein likho" },
    { en: "Open/confirm a current account for business collections", hi: "व्यापार संग्रह के लिए चालू खाता खोलें/पुष्टि करें", hinglish: "Business collections ke liye current account open/confirm karo" },
    { en: "Check eligibility for demo dairy support scheme at district office", hi: "ज़िला कार्यालय में डेयरी सहायता योजना पात्रता जाँचें", hinglish: "District office mein demo dairy support scheme eligibility check karo" },
    { en: "Launch pilot route with 40 households", hi: "40 घरों के साथ पायलट रूट शुरू करें", hinglish: "40 households ke saath pilot route launch karo" },
    { en: "Track daily collections vs wastage; keep spoilage under 2%", hi: "दैनिक संग्रह बनाम क्षय पर नज़र रखें; खराबी 2% से नीचे रखें", hinglish: "Daily collections vs wastage track karo; spoilage 2% se neeche rakh lo" },
    { en: "Review actual vs planned profit with GRAMIQ copilot", hi: "GRAMIQ कोपायलट से वास्तविक बनाम योजनित लाभ समीक्षा करें", hinglish: "GRAMIQ copilot se actual vs planned profit review karo" },
    { en: "Add value-added products (paneer/curd) if margin allows", hi: "यदि मार्जिन अनुमति दे तो मूल्य-वर्धित उत्पाद (पनीर/दही) जोड़ें", hinglish: "Margin allow kare to value-added products (paneer/curd) add karo" },
    { en: "Hire one delivery helper during peak months", hi: "चरम माह में एक डिलीवरी सहायक रखें", hinglish: "Peak months mein ek delivery helper hire karo" },
    { en: "Re-run stress test and set aside 1 month of costs as buffer", hi: "तनाव परीक्षण दोबारा चलाएँ और 1 माह की लागत बफर रूप में रखें", hinglish: "Stress test re-run karo aur 1 month ki cost buffer rakh do" },
  ],

  /* ── Business plan report narrative ── */
  report: {
    coverLabel: { en: "GRAMIQ Business Plan", hi: "GRAMIQ व्यापार योजना", hinglish: "GRAMIQ Business Plan" },
    title: { en: "Small Dairy Enterprise", hi: "लघु डेयरी उद्यम", hinglish: "Small Dairy Enterprise" },
    preparedBy: { en: "Prepared by GRAMIQ", hi: "GRAMIQ द्वारा तैयार", hinglish: "Prepared by GRAMIQ" },
    summary: (vars: {
      name: string; village: string; startup: string; capital: string;
      revenue: string; be: string;
    }) => ({
      en: `${vars.name} plans to establish a small dairy collection-and-sale enterprise in ${vars.village}. With a startup investment of ${vars.startup} against ${vars.capital} of available capital, the business is projected to generate ${vars.revenue} monthly revenue at planned volume and reach break-even in approximately ${vars.be} months. All financial projections are deterministic model outputs based on the stated assumptions (AI ESTIMATE); they are not guarantees.`,
      hi: `${vars.name} ${vars.village} में एक लघु डेयरी संग्रह-और-विक्रय उद्यम स्थापित करने की योजना बना रहे हैं। ${vars.startup} के शुरुआती निवेश के साथ, ${vars.capital} उपलब्ध पूँजी के विरुद्ध, व्यवसाय से योजनित मात्रा पर ${vars.revenue} मासिक आय अनुमानित है और लगभग ${vars.be} माह में ब्रेक-ईन होने की उम्मीद है। सभी वित्तीय अनुमान बताए गए धारणाओं पर आधारित निर्धारक मॉडल आउटपुट हैं (AI ESTIMATE); ये गारंटी नहीं हैं।`,
      hinglish: `${vars.name} ${vars.village} mein ek small dairy collection-and-sale enterprise start karne ka plan ban rahe hain. ${vars.startup} startup investment ke saath, ${vars.capital} available capital ke against, business se planned volume par ${vars.revenue} monthly revenue projected hai aur approximately ${vars.be} months mein break-even ki ummeed hai. Saare financial projections stated assumptions par based deterministic model outputs hain (AI ESTIMATE); yeh guarantee nahi hain.`,
    }),
    ideaBody: {
      en: "Revenue comes from daily household delivery, shop supply and tea-stall contracts. Value-added products (curd, paneer) are a year-two expansion option once the base route is stable.",
      hi: "आय दैनिक घर डिलीवरी, दुकान आपूर्ति और चाय-दुकान अनुबंधों से आती है। मूल्य-वर्धित उत्पाद (दही, पनीर) आधार रूट स्थिर होने के बाद दूसरे वर्ष के विस्तार विकल्प हैं।",
      hinglish: "Revenue daily household delivery, shop supply aur tea-stall contracts se aati hai. Value-added products (curd, paneer) base route stable hone ke baad year-two expansion option hain.",
    },
    marketBullets: () => ({
      en: [
        `DEMO DATA: ~180 households within 4 km purchase milk daily.`,
        `DEMO DATA: two farmer collection points within 4 km; ~320 L/day combined potential.`,
        `AI ESTIMATE: capturing 35–40% of nearby demand covers the planned volume.`,
      ],
      hi: [
        `DEMO DATA: 4 किमी भीतर ~180 घर रोज़ दूध खरीदते हैं।`,
        `DEMO DATA: 4 किमी भीतर दो किसान संग्रह बिंदु; संयुक्त ~320 ली./दिन क्षमता।`,
        `AI ESTIMATE: पास की माँग का 35–40% पकड़ना योजनित मात्रा को कवर करता है।`,
      ],
      hinglish: [
        `DEMO DATA: 4 km ke andar ~180 households roz doodh kharidte hain.`,
        `DEMO DATA: 4 km ke andar two farmer collection points; ~320 L/day combined potential.`,
        `AI ESTIMATE: Paas ki demand ka 35–40% pakadna planned volume cover karta hai.`,
      ],
    }),
    timelineHorizons: {
      "7d": { en: "7 days", hi: "7 दिन", hinglish: "7 days" },
      "30d": { en: "30 days", hi: "30 दिन", hinglish: "30 days" },
      "90d": { en: "90 days", hi: "90 दिन", hinglish: "90 days" },
      "1y": { en: "Year 1", hi: "वर्ष 1", hinglish: "Year 1" },
    },
    assumptions: {
      en: [
        "All financial figures derive from GRAMIQ's deterministic calculation engine given the inputs above (AI ESTIMATE).",
        "Ramp-up assumes 55% of planned volume in month 1, reaching full volume by month 6.",
        "Market and scheme entries are clearly labeled DEMO DATA from the prototype knowledge base.",
        "This plan is decision support, not a guarantee of business success or scheme eligibility.",
      ],
      hi: [
        "सभी वित्तीय आंकड़े ऊपर दिए इनपुट के आधार पर GRAMIQ के निर्धारक गणना इंजन से आते हैं (AI ESTIMATE)।",
        "रैम्प-अप माह 1 में योजनित मात्रा का 55% मानता है, माह 6 तक पूर्ण मात्रा तक पहुँचता है।",
        "बाज़ार और योजना प्रविष्टियाँ प्रोटोटाइप ज्ञान आधार से स्पष्ट रूप से DEMO DATA लेबलित हैं।",
        "यह योजना निर्णय सहायता है, व्यापार सफलता या योजना पात्रता की गारंटी नहीं।",
      ],
      hinglish: [
        "Saare financial figures GRAMIQ ke deterministic calculation engine se aate hain given the inputs above (AI ESTIMATE).",
        "Ramp-up month 1 mein planned volume ka 55% assume karta hai, month 6 tak full volume pahunchta hai.",
        "Market aur scheme entries prototype knowledge base se clearly DEMO DATA labeled hain.",
        "Yeh plan decision support hai, business success ya scheme eligibility ki guarantee nahi.",
      ],
    } as Record<Lang, string[]>,
  },

  /* ── Copilot ── */
  copilot: {
    openingHeadline: { en: "Namaste! I'm your GRAMIQ copilot", hi: "नमस्ते! मैं आपका GRAMIQ कोपायलट हूँ", hinglish: "Namaste! Main aapka GRAMIQ copilot hoon" },
    openingText: {
      en: "I can see your live business model. Ask about profit, risks or schemes — or say \"what if I invest ₹1.5 lakh?\" and I'll simulate it.",
      hi: "मैं आपका लाइव व्यापार मॉडल देख सकता हूँ। लाभ, जोखिम या योजनाओं के बारे में पूछें — या कहें \"अगर मैं ₹1.5 लाख निवेश करूँ?\" और मैं इसे सिम्युलेट करूँगा।",
      hinglish: "Main aapka live business model dekh sakta hoon. Profit, risks ya schemes ke baare mein poocho — ya bolo \"agar main ₹1.5 lakh invest karoon?\" aur main simulate karunga.",
    },
  },
} as const;

/** Helper: pick the localized value for a key, falling back to English. */
export function pick<T>(map: Record<Lang, T>, lang: Lang): T {
  return map[lang] ?? map.en;
}
