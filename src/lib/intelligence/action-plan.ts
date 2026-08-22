/**
 * Dynamic action-plan generator — tasks derive from the DETECTED business
 * model, not from any hardcoded demo idea. First six tasks are
 * business-specific; the last six are universal good practice for any
 * micro-enterprise.
 */
import { detectBusinessModel } from "@/lib/intelligence/business-model";
import type { Lang } from "@/lib/i18n/strings";
import type { ActionItem } from "@/lib/types";

type Task = Record<Lang, string>;

/** Universal closing tasks — identical across all business families. */
const UNIVERSAL: Task[] = [
  {
    en: "Open/confirm a current account for business collections",
    hi: "व्यापार संग्रह के लिए चालू खाता खोलें/पुष्टि करें",
    hinglish: "Business collections ke liye current account open/confirm karo",
  },
  {
    en: "Check scheme eligibility at the district office (see Funding page)",
    hi: "ज़िला कार्यालय में योजना पात्रता जाँचें (वित्तपोषण पृष्ठ देखें)",
    hinglish: "District office mein scheme eligibility check karo (Funding page dekho)",
  },
  {
    en: "Launch a small pilot with your first real customers",
    hi: "अपने पहले असली ग्राहकों के साथ छोटा पायलट शुरू करें",
    hinglish: "Pehle real customers ke saath chhota pilot launch karo",
  },
  {
    en: "Track daily sales vs costs; compare with plan every week",
    hi: "रोज़ाना बिक्री बनाम लागत ट्रैक करें; हर सप्ताह योजना से तुलना करें",
    hinglish: "Daily sales vs cost track karo; har week plan se compare karo",
  },
  {
    en: "Review actual vs planned profit with the GRAMIQ copilot",
    hi: "GRAMIQ कोपायलट से वास्तविक बनाम योजनित लाभ की समीक्षा करें",
    hinglish: "GRAMIQ copilot se actual vs planned profit review karo",
  },
  {
    en: "Re-run stress test; keep 1 month of costs as cash buffer",
    hi: "तनाव परीक्षण दोबारा चलाएँ; 1 माह की लागत नकद बफर रखें",
    hinglish: "Stress test re-run karo; 1 month ki cost cash buffer rakh do",
  },
];

const MODEL_TASKS: Record<string, Task[]> = {
  dairy: [
    { en: "Ask 10 households what they pay for milk today", hi: "10 घरों से पूछें कि आज दूध के लिए कितना भुगतान करते हैं", hinglish: "10 households se poocho ki aaj doodh pe kitna dete hain" },
    { en: "Meet local farmers about daily milk supply and rates", hi: "स्थानीय किसानों से रोज़ाना दूध आपूर्ति और दरों पर बात करें", hinglish: "Local farmers se daily milk supply aur rates par baat karo" },
    { en: "Price milk cans, testing kit and cooling arrangement", hi: "दूध कैन, टेस्टिंग किट और कूलिंग व्यवस्था का मूल्य लगाएँ", hinglish: "Milk cans, testing kit aur cooling arrangement ka price lagao" },
    { en: "Finalize buy/sell rates with suppliers and buyers in writing", hi: "आपूर्तिकर्ताओं और खरीदारों के साथ खरीद/बिक्री दरें लिखित रूप में तय करें", hinglish: "Suppliers aur buyers ke saath buy/sell rates likhit mein finalize karo" },
    { en: "Plan a morning delivery route covering your first 40 households", hi: "पहले 40 घरों को कवर करने वाली सुबह की डिलीवरी रूट बनाएँ", hinglish: "Pehle 40 households cover karne wali morning delivery route banao" },
    { en: "Keep spoilage under 2% — track collection vs wastage daily", hi: "खराबी 2% से नीचे रखें — संग्रह बनाम क्षय रोज़ ट्रैक करें", hinglish: "Spoilage 2% se neeche rakho — collection vs wastage daily track karo" },
  ],
  crops: [
    { en: "Get your soil and water tested at the Krishi Vigyan Kendra", hi: "कृषि विज्ञान केंद्र में मिट्टी और पानी की जाँच कराएँ", hinglish: "Krishi Vigyan Kendra se soil aur water test karao" },
    { en: "Visit the local mandi to learn this season's real prices", hi: "इस सीज़न के असली दाम जानने के लिए स्थानीय मंडी जाएँ", hinglish: "Is season ke real daam jaanne ke liye local mandi visit karo" },
    { en: "Price seeds, fertilizer and irrigation setup from 2+ dealers", hi: "2+ डीलरों से बीज, उर्वरक और सिंचाई सेटअप का मूल्य लगाएँ", hinglish: "2+ dealers se seeds, fertilizer aur irrigation setup ka price lagao" },
    { en: "Choose crops by cycle length — mix short-cycle vegetables with staples", hi: "चक्र अवधि से फसलें चुनें — लघु-चक्र सब्ज़ियों को मुख्य फसलों के साथ मिलाएँ", hinglish: "Cycle length se crops choose karo — short-cycle sabzi + staples mix karo" },
    { en: "Fix irrigation: check pump, drip lines and water source before sowing", hi: "बुवाई से पहले सिंचाई तय करें: पंप, ड्रिप और जल स्रोत जाँचें", hinglish: "Sowing se pehle irrigation fix karo: pump, drip aur water source check karo" },
    { en: "Line up 2–3 buyers (mandi trader, shops, hotels) before harvest", hi: "कटाई से पहले 2–3 खरीदार (मंडी व्यापारी, दुकानें, होटल) तय करें", hinglish: "Harvest se pehle 2–3 buyers (mandi trader, shops, hotels) fix karo" },
  ],
  livestock: [
    { en: "Visit an operating poultry/livestock unit to learn daily routines", hi: "दैनिक दिनचर्या सीखने के लिए चालू पोल्ट्री/पशु इकाई देखें", hinglish: "Daily routine seekhne ke liye ek chalti hui poultry/livestock unit dekho" },
    { en: "Get quotes for chicks/animals, feed and medicines from 2+ suppliers", hi: "2+ आपूर्तिकर्ताओं से चूज़े/पशु, चारा और दवा के भाव लें", hinglish: "2+ suppliers se chicks/animals, feed aur dawai ke quotes lo" },
    { en: "Locate the nearest veterinary center and vaccination schedule", hi: "निकटतम पशु चिकित्सा केंद्र और टीकाकरण कार्यक्रम पता करें", hinglish: "Nearest vet center aur vaccination schedule pata karo" },
    { en: "Prepare shed space: ventilation, flooring and predator-proofing", hi: "शेड तैयार करें: हवादार, फर्श और जानवर-सुरक्षा", hinglish: "Shed ready karo: ventilation, flooring aur safety ka dhyan rakho" },
    { en: "Identify 2–3 buyers (meat shops, haat) before your first batch", hi: "पहले बैच से पहले 2–3 खरीदार (मांस की दुकानें, हाट) पहचानें", hinglish: "Pehle batch se pehle 2–3 buyers (meat shops, haat) identify karo" },
    { en: "Keep a mortality log from day one; act on anything above 5%", hi: "पहले दिन से मृत्यु दर लॉग रखें; 5% से ऊपर पर तुरंत कार्रवाई करें", hinglish: "Day 1 se mortality log rakho; 5% se upar ho to turant action lo" },
  ],
  "food-service": [
    { en: "Count footfall at your planned location (morning/evening)", hi: "योजनाबद्ध स्थान पर फुटफॉल गिनें (सुबह/शाम)", hinglish: "Planned location par footfall gino (morning/evening)" },
    { en: "Taste-test your menu with 20 potential customers", hi: "20 संभावित ग्राहकों के साथ मेन्यू का स्वाद परीक्षण करें", hinglish: "20 potential customers se menu taste-test karao" },
    { en: "Price equipment, vessels and seating from 2+ vendors", hi: "2+ विक्रेताओं से उपकरण, बर्तन और बैठने की व्यवस्था का मूल्य लगाएँ", hinglish: "2+ vendors se equipment, bartan aur seating ka price lagao" },
    { en: "Apply for FSSAI registration and check local license needs", hi: "FSSAI पंजीकरण के लिए आवेदन करें और स्थानीय लाइसेंस जाँचें", hinglish: "FSSAI registration apply karo aur local license check karo" },
    { en: "Fix weekly wholesale supply rates for your core ingredients", hi: "मुख्य सामग्री की साप्ताहिक थोक दरें तय करें", hinglish: "Core ingredients ki weekly wholesale rates fix karo" },
    { en: "Track food cost per order daily — keep it under 45% of price", hi: "प्रति ऑर्डर खाद्य लागत रोज़ ट्रैक करें — इसे कीमत के 45% से नीचे रखें", hinglish: "Per-order food cost roz track karo — 45% se neeche rakh do" },
  ],
  retail: [
    { en: "Survey 30 passers-by: what would they buy from your shop?", hi: "30 राहगीरों से पूछें: वे आपकी दुकान से क्या खरीदेंगे?", hinglish: "30 logon se poocho: wo aapki shop se kya khareedein ge?" },
    { en: "Compare wholesale rates at district market vs distributors", hi: "ज़िला मंडी बनाम डिस्ट्रीब्यूटर की थोक दरों की तुलना करें", hinglish: "District mandi vs distributor ki wholesale rates compare karo" },
    { en: "Price racks, counters and signage; decide shop layout", hi: "रैक, काउंटर और साइनेज का मूल्य लगाएँ; दुकान का लेआउट तय करें", hinglish: "Racks, counter aur signage ka price lagao; layout decide karo" },
    { en: "Check trade license / GST need based on expected turnover", hi: "अपेक्षित कारोबार के अनुसार ट्रेड लाइसेंस / GST आवश्यकता जाँचें", hinglish: "Expected turnover ke hisaab se trade license/GST requirement check karo" },
    { en: "Stock fast-moving items first; keep slow items minimal", hi: "पहले तेज़-चलने वाले सामान रखें; धीमे सामान न्यूनतम रखें", hinglish: "Fast-moving items pehle rakho; slow items minimum rakho" },
    { en: "Record daily sales by category to find your real bestsellers", hi: "श्रेणीवार रोज़ाना बिक्री दर्ज करें और असली बेस्टसेलर ढूँढें", hinglish: "Category-wise daily sales record karo, real bestsellers dhundo" },
  ],
  services: [
    { en: "List every service you can offer and its going local rate", hi: "हर सेवा और उसकी स्थानीय दर की सूची बनाएँ", hinglish: "Har service aur uski local rate ki list banao" },
    { en: "Price machines/tools from 2+ vendors (new vs refurbished)", hi: "2+ विक्रेताओं से मशीन/औज़ार का मूल्य लें (नया बनाम रिफंबिश्ड)", hinglish: "2+ vendors se machine/tools ka price lo (new vs refurbished)" },
    { en: "Announce your service in 3 nearby colonies/local groups", hi: "3 पास के कॉलोनियों/स्थानीय समूहों में अपनी सेवा की घोषणा करें", hinglish: "3 paas ke colonies/local groups mein apni service announce karo" },
    { en: "Do 5 discounted trial jobs and collect honest feedback", hi: "5 छूट वाले ट्रायल काम करें और ईमानदार फीडबैक लें", hinglish: "5 discounted trial jobs karo aur honest feedback lo" },
    { en: "Set up a simple booking register or WhatsApp ordering system", hi: "एक साधारण बुकिंग रजिस्टर या WhatsApp ऑर्डरिंग सिस्टम बनाएँ", hinglish: "Simple booking register ya WhatsApp ordering system set up karo" },
    { en: "Track time per job to know your true hourly earning", hi: "असली प्रति-घंटा कमाई जानने के लिए प्रति काम समय ट्रैक करें", hinglish: "Per job time track karo taaki true hourly earning pata chale" },
  ],
  digital: [
    { en: "Interview 10 potential users about their biggest problem", hi: "10 संभावित उपयोगकर्ताओं से उनकी सबसे बड़ी समस्या पूछें", hinglish: "10 potential users se unki sabse badi problem poocho" },
    { en: "Build the smallest working version (one core feature only)", hi: "सबसे छोटा चालू संस्करण बनाएँ (केवल एक मुख्य फ़ीचर)", hinglish: "Smallest working version banao (sirf ek core feature)" },
    { en: "Compare hosting/payment providers on cost at YOUR scale", hi: "अपने स्तर पर लागत के अनुसार होस्टिंग/पेमेंट प्रदाता तुलना करें", hinglish: "Apne scale pe cost ke hisaab se hosting/payment providers compare karo" },
    { en: "Onboard your first 10 users manually and watch how they use it", hi: "पहले 10 उपयोगकर्ताओं को मैन्युअल रूप से जोड़ें और उनका उपयोग देखें", hinglish: "Pehle 10 users manually onboard karo aur unka use observe karo" },
    { en: "Decide pricing only after seeing how much value users get", hi: "उपयोगकर्ताओं को कितना मूल्य मिलता है देखने के बाद ही कीमत तय करें", hinglish: "Users ko kitna value milta hai dekhne ke baad hi pricing decide karo" },
    { en: "Track retention week-on-week — signups without return visits mean nothing", hi: "साप्ताहिक रिटेंशन ट्रैक करें — बिना वापसी के साइनअप बेमायने हैं", hinglish: "Week-on-week retention track karo — bina return ke signup bekaar hai" },
  ],
  generic: [
    { en: "Write down exactly what you will sell and to whom", hi: "लिखें कि आप ठीक क्या बेचेंगे और किसे", hinglish: "Likho ki exact kya bechoge aur kisko" },
    { en: "Talk to 15 potential customers about what they'd pay", hi: "15 संभावित ग्राहकों से पूछें कि वे कितना भुगतान करेंगे", hinglish: "15 potential customers se poocho ki wo kitna denge" },
    { en: "Get supplier quotes from at least 2 sources", hi: "कम से कम 2 स्रोतों से आपूर्तिकर्ता भाव लें", hinglish: "Kam se kam 2 sources se supplier quotes lo" },
    { en: "Check licenses/registration needed for your line of business", hi: "अपने कारोबार के लिए आवश्यक लाइसेंस/पंजीकरण जाँचें", hinglish: "Apne business ke liye zaroori license/registration check karo" },
    { en: "Start with the smallest sellable version of your offer", hi: "अपने प्रस्ताव के सबसे छोटे बिक्री-योग्य संस्करण से शुरू करें", hinglish: "Apne offer ka smallest sellable version se start karo" },
    { en: "Log every sale and cost from day one — even ₹10 entries matter", hi: "पहले दिन से हर बिक्री और लागत दर्ज करें — ₹10 की प्रविष्टि भी मायने रखती है", hinglish: "Day 1 se har sale aur cost log karo — ₹10 entry bhi matter karti hai" },
  ],
};

const HORIZONS: ActionItem["horizon"][] = ["7d", "7d", "7d", "30d", "30d", "30d", "90d", "90d", "90d", "1y", "1y", "1y"];

/**
 * Build the action plan for the user's ACTUAL idea in their response language.
 * Business-specific tasks come first; universal good-practice tasks close.
 */
export function buildActionPlan(idea: string, lang: Lang): ActionItem[] {
  const model = detectBusinessModel(idea);
  const specific = MODEL_TASKS[model.key] ?? MODEL_TASKS.generic;
  const tasks = [...specific, ...UNIVERSAL];
  return tasks.map((t, i) => ({
    id: `a${i + 1}`,
    horizon: HORIZONS[i] ?? "1y",
    task: t[lang] ?? t.en,
    done: false,
  }));
}
