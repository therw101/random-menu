 
'use client'
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

// -----------------------------
// Utility helpers
// -----------------------------
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const uniqByName = (arr) => {
  const seen = new Set();
  return arr.filter((x) => (seen.has(x.name) ? false : seen.add(x.name)));
};

// -----------------------------
// Menu Dataset
// Protein allowed: pork, chicken, fish, seafood
// No congee/porridge. No beef.
// Fields: name, protein, method, spicy, category
// -----------------------------
const MENUS = [
  { name: "ไก่ผัดเม็ดมะม่วง", protein: "chicken", method: "stir-fry", spicy: false, category: "กับข้าว" },
  { name: "ผัดพริกแกงหมูถั่วฝักยาว", protein: "pork", method: "stir-fry", spicy: true, category: "กับข้าว" },
  { name: "ต้มยำกุ้งน้ำใส", protein: "seafood", method: "soup", spicy: true, category: "แกง/ซุป" },
  { name: "ปลานึ่งมะนาว", protein: "fish", method: "steam", spicy: true, category: "นึ่ง" },
  { name: "หมูทอดกระเทียมพริกไทย", protein: "pork", method: "fry", spicy: false, category: "ทอด" },
  { name: "ไก่ย่างจิ้มแจ่ว", protein: "chicken", method: "grill", spicy: true, category: "ย่าง" },
  { name: "ผัดคะน้าหมูกรอบ", protein: "pork", method: "stir-fry", spicy: false, category: "ผัด" },
  { name: "ปลากะพงทอดน้ำปลา", protein: "fish", method: "fry", spicy: false, category: "ทอด" },
  { name: "กุ้งผัดผงกะหรี่", protein: "seafood", method: "stir-fry", spicy: mild(), category: "ผัด" },
  { name: "แกงเขียวหวานไก่", protein: "chicken", method: "curry", spicy: true, category: "แกง" },
  { name: "พะแนงหมู", protein: "pork", method: "curry", spicy: true, category: "แกง" },
  { name: "แกงส้มชะอมกุ้ง", protein: "seafood", method: "curry", spicy: true, category: "แกง" },
  { name: "แกงเลียงกุ้งสด", protein: "seafood", method: "soup", spicy: true, category: "แกง/ซุป" },
  { name: "ฉู่ฉี่ปลากะพง", protein: "fish", method: "curry", spicy: mild(), category: "แกง" },
  { name: "ยำทะเลรวม", protein: "seafood", method: "salad", spicy: true, category: "ยำ" },
  { name: "ยำไก่ฉีกสมุนไพร", protein: "chicken", method: "salad", spicy: true, category: "ยำ" },
  { name: "น้ำตกหมู", protein: "pork", method: "salad", spicy: true, category: "ยำ" },
  { name: "ลาบไก่", protein: "chicken", method: "salad", spicy: true, category: "ยำ" },
  { name: "ต้มแซ่บกระดูกหมูอ่อน", protein: "pork", method: "soup", spicy: true, category: "แกง/ซุป" },
  { name: "หมูสามชั้นคั่วเกลือ", protein: "pork", method: "stir-fry", spicy: false, category: "ผัด" },
  { name: "ไก่ทอดน้ำปลา", protein: "chicken", method: "fry", spicy: false, category: "ทอด" },
  { name: "ไก่เทอริยากิ", protein: "chicken", method: "pan-sear", spicy: false, category: "กับข้าว" },
  { name: "ก๋วยเตี๋ยวคั่วไก่", protein: "chicken", method: "stir-fry", spicy: false, category: "เส้น" },
  { name: "สุกี้แห้งทะเล", protein: "seafood", method: "stir-fry", spicy: mild(), category: "เส้น" },
  { name: "ราดหน้าหมูบร็อกโคลี", protein: "pork", method: "stir-fry", spicy: false, category: "เส้น" },
  { name: "ผัดซีอิ๊วไก่", protein: "chicken", method: "stir-fry", spicy: false, category: "เส้น" },
  { name: "ผัดไทยกุ้งสด", protein: "seafood", method: "stir-fry", spicy: mild(), category: "เส้น" },
  { name: "เย็นตาโฟทะเล", protein: "seafood", method: "noodle-soup", spicy: false, category: "เส้น" },
  { name: "ก๋วยจั๊บญวนไก่ฉีก", protein: "chicken", method: "noodle-soup", spicy: false, category: "เส้น" },
  { name: "บะหมี่เกี๊ยวกุ้งหมูแดง", protein: "seafood", method: "noodle", spicy: false, category: "เส้น" },
  { name: "โกยซีหมี่ไก่เห็ดหอม", protein: "chicken", method: "stir-fry", spicy: false, category: "เส้น" },
  { name: "ก๋วยเตี๋ยวน้ำตกหมู", protein: "pork", method: "noodle-soup", spicy: true, category: "เส้น" },
  { name: "ปลาทูทอด + น้ำพริกกะปิ + ผักลวก", protein: "fish", method: "fry", spicy: true, category: "กับข้าว" },
  { name: "ปลาช่อนลุยสวน", protein: "fish", method: "salad", spicy: true, category: "ยำ" },
  { name: "ปลาทอดสามรส", protein: "fish", method: "fry", spicy: mild(), category: "ทอด" },
  { name: "ปลาย่างสมุนไพร", protein: "fish", method: "grill", spicy: false, category: "ย่าง" },
  { name: "แซลมอนย่างเกลือ", protein: "fish", method: "grill", spicy: false, category: "ย่าง" },
  { name: "ปลาซาบะย่างซีอิ๊ว", protein: "fish", method: "grill", spicy: false, category: "ย่าง" },
  { name: "ซุปปลาใส่ขิง", protein: "fish", method: "soup", spicy: false, category: "แกง/ซุป" },
  { name: "หมูผัดน้ำมันหอยเห็ดฟาง", protein: "pork", method: "stir-fry", spicy: false, category: "ผัด" },
  { name: "หมูผัดพริกหยวก", protein: "pork", method: "stir-fry", spicy: mild(), category: "ผัด" },
  { name: "ไก่ผัดโหระพา", protein: "chicken", method: "stir-fry", spicy: true, category: "ผัด" },
  { name: "ไก่ผัดขิง", protein: "chicken", method: "stir-fry", spicy: false, category: "ผัด" },
  { name: "ไก่ผัดพริกแกงหน่อไม้", protein: "chicken", method: "stir-fry", spicy: true, category: "ผัด" },
  { name: "ไก่พะโล้ (กับข้าว)", protein: "chicken", method: "braise", spicy: false, category: "ตุ๋น" },
  { name: "หมูฮ่องกง", protein: "pork", method: "braise", spicy: false, category: "ตุ๋น" },
  { name: "กุ้งอบวุ้นเส้นหม้อดิน", protein: "seafood", method: "bake", spicy: false, category: "อบ" },
  { name: "ปลาหมึกผัดไข่เค็ม", protein: "seafood", method: "stir-fry", spicy: mild(), category: "ผัด" },
  { name: "ปลาหมึกผัดกระเทียมพริกไทย", protein: "seafood", method: "stir-fry", spicy: mild(), category: "ผัด" },
  { name: "หมึกย่างซีฟู้ดจิ้ม", protein: "seafood", method: "grill", spicy: true, category: "ย่าง" },
  { name: "กุ้งแช่น้ำปลา", protein: "seafood", method: "raw-dress", spicy: true, category: "ยำ" },
  { name: "หอยลายผัดพริกเผา", protein: "seafood", method: "stir-fry", spicy: mild(), category: "ผัด" },
  { name: "หอยแมลงภู่นึ่งตะไคร้", protein: "seafood", method: "steam", spicy: false, category: "นึ่ง" },
  { name: "ดงบุริไก่คัตสึ", protein: "chicken", method: "fry", spicy: false, category: "ข้าวหน้า" },
  { name: "ข้าวแกงกะหรี่ไก่", protein: "chicken", method: "curry", spicy: mild(), category: "ข้าวแกง" },
  { name: "ข้าวแกงกะหรี่หมูทอด", protein: "pork", method: "curry", spicy: mild(), category: "ข้าวแกง" },
  { name: "สปาเก็ตตี้ผัดขี้เมาทะเล", protein: "seafood", method: "stir-fry", spicy: true, category: "พาสต้า" },
  { name: "สปาเก็ตตี้กระเทียมพริกแห้งกุ้ง", protein: "seafood", method: "stir-fry", spicy: mild(), category: "พาสต้า" },
  { name: "เพนเน่ครีมเห็ดไก่", protein: "chicken", method: "saute", spicy: false, category: "พาสต้า" },
  { name: "ยากิโซบะหมูผัก", protein: "pork", method: "stir-fry", spicy: false, category: "เส้น" },
  { name: "อูด้งผัดซีฟู้ด", protein: "seafood", method: "stir-fry", spicy: false, category: "เส้น" },
  { name: "ราเมนโชยุหน้าหมูชาชู", protein: "pork", method: "noodle-soup", spicy: false, category: "เส้น" },
  { name: "กุ้งผัดเปรี้ยวหวานใส่สับปะรด", protein: "seafood", method: "stir-fry", spicy: mild(), category: "ผัด" },
  { name: "คั่วกลิ้งหมู", protein: "pork", method: "stir-fry", spicy: true, category: "ผัด" },
  { name: "ไก่อบโรสแมรี่", protein: "chicken", method: "bake", spicy: false, category: "อบ" },
  { name: "หมูทอดทงคัตสึ", protein: "pork", method: "fry", spicy: false, category: "ทอด" },
  { name: "ไก่คาราอาเกะ", protein: "chicken", method: "fry", spicy: false, category: "ทอด" },
  { name: "ไก่ย่างสมุนไพร", protein: "chicken", method: "grill", spicy: false, category: "ย่าง" },
  { name: "ปีกไก่อบซอสบาร์บีคิว", protein: "chicken", method: "bake", spicy: mild(), category: "อบ" },
  { name: "หมูย่างเกาหลี (ซัมกยอบซัล)", protein: "pork", method: "grill", spicy: false, category: "ย่าง" },
  { name: "หมูผัดกิมจิ", protein: "pork", method: "stir-fry", spicy: true, category: "ผัด" },
  { name: "กิมจิจีแก้หมู", protein: "pork", method: "soup", spicy: true, category: "ซุป" },
  { name: "ปลาดอลลี่ผัดเนยกระเทียม", protein: "fish", method: "saute", spicy: false, category: "ผัด" },
  { name: "ปลากระพงผัดฉ่า", protein: "fish", method: "stir-fry", spicy: true, category: "ผัด" },
  { name: "แกงป่าปลาย่าง", protein: "fish", method: "curry", spicy: true, category: "แกง" },
  { name: "แกงเผ็ดปลาดุกหน่อไม้", protein: "fish", method: "curry", spicy: true, category: "แกง" },
  { name: "ขนมจีนน้ำยาไก่", protein: "chicken", method: "noodle", spicy: true, category: "เส้น" },
  { name: "ขนมจีนแกงเขียวหวานไก่", protein: "chicken", method: "noodle", spicy: true, category: "เส้น" },
  { name: "ส้มตำไทย + ไก่ทอด", protein: "chicken", method: "salad", spicy: true, category: "ยำ" },
  { name: "ตำข้าวโพดกุ้ง", protein: "seafood", method: "salad", spicy: true, category: "ยำ" },
  { name: "พล่ากุ้ง", protein: "seafood", method: "salad", spicy: true, category: "ยำ" },
  { name: "พล่าแซลมอนสุก", protein: "fish", method: "salad", spicy: true, category: "ยำ" },
  { name: "ยำหมูยอ + หมูสับ", protein: "pork", method: "salad", spicy: true, category: "ยำ" },
  { name: "ยำอกไก่ลวกสมุนไพร", protein: "chicken", method: "salad", spicy: true, category: "ยำ" },
  { name: "ไข่เจียวหมูสับ", protein: "pork", method: "fry", spicy: false, category: "กับข้าว" },
  { name: "ไข่ตุ๋นกุ้งสับ", protein: "seafood", method: "steam", spicy: false, category: "นึ่ง" },
  { name: "ซุปข้าวโพดไก่ฉีก", protein: "chicken", method: "soup", spicy: false, category: "ซุป" },
  { name: "ซุปมิโสะปลาแซลมอน", protein: "fish", method: "soup", spicy: false, category: "ซุป" },
  // Extra items to enrich variety
  { name: "หมูผัดน้ำพริกเผาโหระพา", protein: "pork", method: "stir-fry", spicy: true, category: "ผัด" },
  { name: "ไก่ผัดสะตอพริกแกง", protein: "chicken", method: "stir-fry", spicy: true, category: "ผัด" },
  { name: "ปลากระพงทอดกระเทียม", protein: "fish", method: "fry", spicy: false, category: "ทอด" },
  { name: "หมึกทอดกระเทียมพริกไทย", protein: "seafood", method: "fry", spicy: false, category: "ทอด" },
  { name: "กุ้งอบชีสกระเทียม", protein: "seafood", method: "bake", spicy: false, category: "อบ" },
  { name: "หมูตุ๋นเห็ดหอม", protein: "pork", method: "braise", spicy: false, category: "ตุ๋น" },
  { name: "ไก่ตุ๋นมะระ", protein: "chicken", method: "braise", spicy: false, category: "ตุ๋น" },
  { name: "ปลานึ่งซีอิ๊วสไตล์จีน", protein: "fish", method: "steam", spicy: false, category: "นึ่ง" },
  { name: "หอยเชลล์ผัดกระเทียม", protein: "seafood", method: "saute", spicy: false, category: "ผัด" },
  { name: "สปาเก็ตตี้ซอสพริกกระเทียมหมู", protein: "pork", method: "stir-fry", spicy: true, category: "พาสต้า" },
  { name: "ยำสามกรอบทะเล", protein: "seafood", method: "salad", spicy: true, category: "ยำ" },
  { name: "แกงคั่วหอยแครงใบชะพลู", protein: "seafood", method: "curry", spicy: true, category: "แกง" },
  { name: "แกงเหลืองปลา", protein: "fish", method: "curry", spicy: true, category: "แกง" },
  { name: "สเต็กไก่พริกไทยดำ", protein: "chicken", method: "pan-sear", spicy: mild(), category: "กับข้าว" },
  { name: "หมูผัดกระเทียมดอง", protein: "pork", method: "stir-fry", spicy: false, category: "ผัด" },
  { name: "ปลาแดดเดียวทอด + น้ำจิ้มแจ่ว", protein: "fish", method: "fry", spicy: true, category: "ทอด" },
  { name: "กุ้งแม่น้ำเผา + น้ำจิ้มซีฟู้ด", protein: "seafood", method: "grill", spicy: true, category: "ย่าง" },
  { name: "หมึกผัดฉ่า", protein: "seafood", method: "stir-fry", spicy: true, category: "ผัด" },
  { name: "ปลาดุกฟูผัดพริกขิง", protein: "fish", method: "stir-fry", spicy: true, category: "ผัด" },
  { name: "ไก่ทอดซอสเกาหลี", protein: "chicken", method: "fry", spicy: true, category: "ทอด" },
  { name: "หมูพะโล้ไข่", protein: "pork", method: "braise", spicy: false, category: "ตุ๋น" },
];

function mild() { return "mild"; }

const PROTEINS = [
  { key: "chicken", label: "ไก่" },
  { key: "pork", label: "หมู" },
  { key: "fish", label: "ปลา" },
  { key: "seafood", label: "อาหารทะเล" },
];

const METHODS = [
  { key: "stir-fry", label: "ผัด" },
  { key: "curry", label: "แกง" },
  { key: "soup", label: "ซุป" },
  { key: "steam", label: "นึ่ง" },
  { key: "grill", label: "ย่าง" },
  { key: "fry", label: "ทอด" },
  { key: "noodle", label: "เส้น/ก๋วยเตี๋ยว" },
  { key: "noodle-soup", label: "ก๋วยเตี๋ยว/น้ำ" },
  { key: "bake", label: "อบ" },
  { key: "braise", label: "ตุ๋น" },
  { key: "saute", label: "ผัด/คั่ว" },
  { key: "pan-sear", label: "ย่างกระทะ" },
  { key: "raw-dress", label: "ลวก/ราดน้ำยำ" },
];

const SPICY = [
  { key: "any", label: "ทุกระดับ" },
  { key: "no", label: "ไม่เผ็ด" },
  { key: "mild", label: "เผ็ดน้อย" },
  { key: "yes", label: "เผ็ดจัด" },
];

function Tag({ children }) {
  return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">{children}</span>;
}

function Card({ children }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-sm p-4">
      {children}
    </div>
  );
}

function ToggleChip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition shadow-sm ${
        active
          ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
          : "bg-white/60 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}
    >
      {label}
    </button>
  );
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch (_) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [selectedProteins, setSelectedProteins] = useLocalStorage("menu.proteins", PROTEINS.map(p => p.key));
  const [selectedMethods, setSelectedMethods] = useLocalStorage("menu.methods", []);
  const [spicy, setSpicy] = useLocalStorage("menu.spicy", "any");
  const [count, setCount] = useLocalStorage("menu.count", 3);
  const [results, setResults] = useState([]);
  const [locked, setLocked] = useLocalStorage("menu.locked", []);
  const [excludeFried, setExcludeFried] = useLocalStorage("menu.excludeFried", false);
  const [customItems, setCustomItems] = useLocalStorage("menu.customItems", []);
  const [newItem, setNewItem] = useState({ name: "", protein: "chicken", method: "stir-fry", spicy: "no" });

  const data = useMemo(() => uniqByName([...MENUS, ...customItems]), [customItems]);

  const filtered = useMemo(() => {
    return data.filter((m) => {
      if (!selectedProteins.includes(m.protein)) return false;
      if (excludeFried && m.method === "fry") return false;
      if (selectedMethods.length > 0 && !selectedMethods.includes(m.method)) return false;
      if (spicy !== "any") {
        const level = m.spicy === true ? "yes" : m.spicy === false ? "no" : "mild";
        if (level !== spicy) return false;
      }
      return true;
    });
  }, [data, selectedProteins, selectedMethods, spicy, excludeFried]);

  const randomize = (n) => {
    // keep locked results in place, fill the rest randomly
    const lockedItems = results.filter((r) => locked.includes(r.name));
    const pool = filtered.filter((m) => !lockedItems.some((l) => l.name === m.name));
    const picks = [];
    const need = Math.max(0, n - lockedItems.length);
    const s = shuffle(pool);
    for (let i = 0; i < s.length && picks.length < need; i++) {
      picks.push(s[i]);
    }
    setResults(uniqByName([...lockedItems, ...picks]).slice(0, n));
  };

  const toggleProtein = (key) => {
    setSelectedProteins((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const toggleMethod = (key) => {
    setSelectedMethods((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const toggleLock = (name) => {
    setLocked((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const clearAll = () => {
    setResults([]);
    setLocked([]);
  };

  const copyList = async () => {
    const text = results.map((r, i) => `${i + 1}) ${r.name}`).join("\n");
    try {
      await navigator.clipboard.writeText(text || "");
      alert("คัดลอกเมนูไปยังคลิปบอร์ดแล้ว");
    } catch (_) {
      alert(text ? text : "ไม่มีรายการให้คัดลอก");
    }
  };

  const addCustom = () => {
    if (!newItem.name.trim()) return;
    const spicyVal = newItem.spicy === "yes" ? true : newItem.spicy === "no" ? false : "mild";
    setCustomItems((prev) => [{ name: newItem.name.trim(), protein: newItem.protein, method: newItem.method, spicy: spicyVal, category: "กำหนดเอง" }, ...prev]);
    setNewItem({ name: "", protein: "chicken", method: "stir-fry", spicy: "no" });
  };

  useEffect(() => {
    // initial generate
    if (results.length === 0) randomize(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">🍽️ Random Dinner Menu</h1>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">สุ่มเมนูอาหารตามเงื่อนไข (เฉพาะ หมู | ไก่ | ปลา | อาหารทะเล)</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyList} className="rounded-xl px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">คัดลอก</button>
            <button onClick={clearAll} className="rounded-xl px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">ล้างผล</button>
          </div>
        </header>

        {/* Controls */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protein */}
            <div>
              <h3 className="font-semibold mb-2">โปรตีน</h3>
              <div className="flex flex-wrap gap-2">
                {PROTEINS.map((p) => (
                  <ToggleChip key={p.key} active={selectedProteins.includes(p.key)} label={p.label} onClick={() => toggleProtein(p.key)} />
                ))}
              </div>
            </div>

            {/* Methods */}
            <div>
              <h3 className="font-semibold mb-2">วิธีทำ (เลือกได้หลายแบบ หรือเว้นว่าง = ทุกแบบ)</h3>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-auto pr-1">
                {METHODS.map((m) => (
                  <ToggleChip key={m.key} active={selectedMethods.includes(m.key)} label={m.label} onClick={() => toggleMethod(m.key)} />
                ))}
              </div>
            </div>

            {/* Spicy */}
            <div>
              <h3 className="font-semibold mb-2">ความเผ็ด</h3>
              <div className="flex flex-wrap gap-2">
                {SPICY.map((s) => (
                  <ToggleChip key={s.key} active={spicy === s.key} label={s.label} onClick={() => setSpicy(s.key)} />
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4" checked={excludeFried} onChange={(e) => setExcludeFried(e.target.checked)} />
                ตัดเมนูทอดออก
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm">จำนวนผลลัพธ์</span>
                <input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className="w-16 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1" />
                <button onClick={() => randomize(count)} className="rounded-xl px-3 py-2 text-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">สุ่ม</button>
              </div>
            </div>
          </div>
        </Card>

        {/* Add custom */}
        <div className="mt-4">
          <Card>
            <h3 className="font-semibold mb-3">เพิ่มเมนูกำหนดเอง</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="ชื่อเมนู (เช่น ไก่ผัดพริกหยวก)" className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2" />
              <select value={newItem.protein} onChange={(e) => setNewItem({ ...newItem, protein: e.target.value })} className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2">
                {PROTEINS.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
              <select value={newItem.method} onChange={(e) => setNewItem({ ...newItem, method: e.target.value })} className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2">
                {METHODS.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
              <select value={newItem.spicy} onChange={(e) => setNewItem({ ...newItem, spicy: e.target.value })} className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2">
                {SPICY.filter(s=>s.key!=="any").map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <button onClick={addCustom} className="rounded-xl px-4 py-2 text-sm bg-white/60 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">เพิ่มเมนู</button>
            </div>
            {customItems.length > 0 && (
              <p className="mt-2 text-xs text-zinc-500">บันทึกอัตโนมัติในเบราว์เซอร์ของคุณ (localStorage)</p>
            )}
          </Card>
        </div>

        {/* Results */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">ผลลัพธ์ ({results.length})</h2>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">เมนูทั้งหมดหลังกรอง: {filtered.length}</div>
          </div>

          {results.length === 0 ? (
            <Card>ไม่มีผลลัพธ์ ลองปรับตัวกรองหรือเพิ่มรายการ</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((item, idx) => (
                <motion.div key={item.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-tight">{item.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Tag>{labelProtein(item.protein)}</Tag>
                          <Tag>{labelMethod(item.method)}</Tag>
                          <Tag>{labelSpicy(item.spicy)}</Tag>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleLock(item.name)}
                        className={`rounded-lg px-2 py-1 text-xs border transition ${locked.includes(item.name) ? "bg-amber-400/20 border-amber-400 text-amber-600" : "border-zinc-300 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                        title={locked.includes(item.name) ? "ปลดล็อกเมนูนี้" : "ล็อกไว้ไม่ให้เปลี่ยน"}
                      >
                        {locked.includes(item.name) ? "🔒 ล็อก" : "🔓 ล็อก"}
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => randomize(1)} className="rounded-xl px-4 py-2 bg-white/60 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">สุ่ม 1</button>
          <button onClick={() => { setCount(3); randomize(3); }} className="rounded-xl px-4 py-2 bg-white/60 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">สุ่ม 3</button>
          <button onClick={() => { setCount(5); randomize(5); }} className="rounded-xl px-4 py-2 bg-white/60 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">สุ่ม 5</button>
          <button onClick={() => randomize(count)} className="rounded-xl px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">สุ่มตามจำนวน</button>
        </div>

        <footer className="mt-10 text-xs text-zinc-500 dark:text-zinc-400">
          เคล็ดลับ: ใช้ตัวกรองโปรตีน/วิธีทำ + ปุ่ม &quot;ล็อก&quot; เพื่อคงเมนูที่ชอบ แล้วกดสุ่มซ้ำเพื่อหาเมนูใหม่ที่เหลือ
        </footer>
      </div>
    </div>
  );
}

function labelProtein(p) {
  switch (p) {
    case "pork": return "หมู";
    case "chicken": return "ไก่";
    case "fish": return "ปลา";
    case "seafood": return "อาหารทะเล";
    default: return p;
  }
}

function labelMethod(m) {
  const mMap = Object.fromEntries(METHODS.map(x => [x.key, x.label]));
  return mMap[m] || m;
}

function labelSpicy(s) {
  if (s === true) return "เผ็ด";
  if (s === false) return "ไม่เผ็ด";
  if (s === "mild") return "เผ็ดน้อย";
  return "-";
}
