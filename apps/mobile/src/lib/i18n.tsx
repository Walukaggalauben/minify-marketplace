import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type Language = 'en' | 'sw' | 'lg';
export const languages: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
  { code: 'lg', label: 'Luganda', native: 'Luganda' },
];

type Dict = Record<string, string>;
const en: Dict = {
  home:'Home', saved:'Saved', sell:'Sell', messages:'Messages', profile:'Profile', search:'Search',
  searchPlaceholder:'Search phones, laptops, TVs & more', browse:'Browse departments', viewAll:'View all',
  fresh:'Fresh finds', freshSub:'The newest adverts from MINIFY MARKET', discover:'DISCOVER', recommended:'RECOMMENDED FOR YOU',
  settings:'Settings', language:'Language', changeLanguage:'Change language', selectLanguage:'Select language',
  allUganda:'All Uganda', looking:'I am looking for...', trending:'Trending', categories:'Categories',
  signIn:'Sign in', createAccount:'Create account', continueBrowsing:'Continue browsing',
  sellOn:'SELL ON MINIFY MARKET', signInToSell:'Sign in to sell', postAfter:'Create an account or sign in to post your advert.',
  phones:'Phones & Tablets', vehicles:'Vehicles', property:'Property', electronics:'Electronics',
  homeLiving:'Home, Furniture & Appliances', beauty:'Beauty & Personal Care', fashion:'Fashion', leisure:'Leisure & Activities',
  cvs:'Seeking Work - CVs', services:'Services', jobs:'Jobs', babies:'Babies & Kids', animals:'Animals & Pets',
  food:'Food, Agriculture & Farming', commercial:'Commercial Equipment & Tools',
};
const sw: Dict = {
  home:'Nyumbani', saved:'Zilizohifadhiwa', sell:'Uza', messages:'Ujumbe', profile:'Wasifu', search:'Tafuta',
  searchPlaceholder:'Tafuta simu, laptop, TV na zaidi', browse:'Vinjari idara', viewAll:'Tazama zote',
  fresh:'Matangazo mapya', freshSub:'Matangazo mapya zaidi kutoka MINIFY MARKET', discover:'GUNDUA', recommended:'UNAPENDEKEZEWA',
  settings:'Mipangilio', language:'Lugha', changeLanguage:'Badilisha lugha', selectLanguage:'Chagua lugha',
  allUganda:'Uganda yote', looking:'Ninatafuta...', trending:'Zinazovuma', categories:'Aina',
  signIn:'Ingia', createAccount:'Fungua akaunti', continueBrowsing:'Endelea kuvinjari',
  sellOn:'UZA KWENYE MINIFY MARKET', signInToSell:'Ingia ili kuuza', postAfter:'Fungua akaunti au ingia ili kuchapisha tangazo lako.',
  phones:'Simu na Tablets', vehicles:'Magari', property:'Mali', electronics:'Elektroniki',
  homeLiving:'Nyumba, Samani na Vifaa', beauty:'Urembo na Huduma Binafsi', fashion:'Mitindo', leisure:'Burudani na Shughuli',
  cvs:'Kutafuta Kazi - CV', services:'Huduma', jobs:'Kazi', babies:'Watoto', animals:'Wanyama na Pets',
  food:'Chakula, Kilimo na Uzalishaji', commercial:'Vifaa vya Biashara na Zana',
};
const lg: Dict = {
  home:'Awaka', saved:'Ebiterekeddwa', sell:'Tunda', messages:'Obubaka', profile:'Profayiro', search:'Noonya',
  searchPlaceholder:'Noonya essimu, laptop, TV n’ebirala', browse:'Kebera ebitundu', viewAll:'Laba byonna',
  fresh:'Ebirango ebipya', freshSub:'Ebirango ebipya okuva ku MINIFY MARKET', discover:'KEBERA', recommended:'BIKUSUUBIRWA',
  settings:'Enteekateeka', language:'Olulimi', changeLanguage:'Kyusa olulimi', selectLanguage:'Londa olulimi',
  allUganda:'Uganda yonna', looking:'Nnonya...', trending:'Ebikozesebwa ennyo', categories:'Ebika',
  signIn:'Yingira', createAccount:'Kola akawunti', continueBrowsing:'Weyongere okulambula',
  sellOn:'TUNDA KU MINIFY MARKET', signInToSell:'Yingira okutunda', postAfter:'Kola akawunti oba yingira okuteka ekirango kyo.',
  phones:'Essimu ne Tablets', vehicles:'Emmotoka', property:'Ebintu by’ettaka n’amayumba', electronics:'Ebyuma',
  homeLiving:'Amaka, Ebintu n’Ebyuma', beauty:'Obulungi n’Obuweereza', fashion:'Emisono', leisure:'Eby’essanyu n’Emirimu',
  cvs:'Kunoonya Kazi - CV', services:'Obuweereza', jobs:'Emirimu', babies:'Abana', animals:'Ensolo',
  food:'Emmere, Obulimi n’Obulunzi', commercial:'Ebyuma by’Obusuubuzi n’Emiggo',
};
const dictionaries = { en, sw, lg };
const LanguageContext = createContext<{language:Language; setLanguage:(l:Language)=>void; t:(key:string)=>string}>({ language:'en', setLanguage:()=>{}, t:key=>en[key]||key });

export function LanguageProvider({children}:{children:ReactNode}) {
  const [language,setLanguageState]=useState<Language>('en');
  useEffect(()=>{(async()=>{try{const value=Platform.OS==='web'?localStorage.getItem('minify_language'):await SecureStore.getItemAsync('minify_language');if(value==='en'||value==='sw'||value==='lg')setLanguageState(value)}catch{}})()},[]);
  const setLanguage=(value:Language)=>{setLanguageState(value);try{if(Platform.OS==='web')localStorage.setItem('minify_language',value);else void SecureStore.setItemAsync('minify_language',value)}catch{}};
  const t=useMemo(()=> (key:string)=>dictionaries[language][key]||en[key]||key,[language]);
  return <LanguageContext.Provider value={{language,setLanguage,t}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){return useContext(LanguageContext);}
