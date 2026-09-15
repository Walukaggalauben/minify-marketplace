export const REGIONS=['Central','Eastern','Northern','Western'];
export const DISTRICTS=['Kampala','Wakiso','Mukono','Entebbe','Jinja','Mbale','Mbarara','Gulu','Lira','Fort Portal','Masaka','Hoima','Arua','Kabale','Kasese','Iganga','Soroti','Busia','Tororo','Mityana','Mubende','Nansana','Kira','Other'];
export const DISTRICTS_BY_REGION:Record<string,string[]>= {
 Central:['Kampala','Wakiso','Mukono','Entebbe','Masaka','Hoima','Mityana','Mubende','Nansana','Kira','Other'],
 Eastern:['Jinja','Mbale','Iganga','Soroti','Busia','Tororo','Other'],
 Northern:['Gulu','Lira','Arua','Other'],
 Western:['Mbarara','Fort Portal','Kabale','Kasese','Other']
};
export const COLORS=['Black','White','Blue','Red','Green','Yellow','Gold','Silver','Gray','Purple','Pink','Orange','Brown','Beige','Bronze','Graphite','Rose Gold','Maroon','Burgundy','Pearl','Teal','Other'];
export const CONDITIONS=['Brand New','Used','Refurbished'];
export const PHONE_BRANDS=['Apple','Samsung','Tecno','Infinix','Google','Xiaomi','Huawei','Nokia','OnePlus','Oppo','Vivo','Realme','Motorola','Sony','Itel','Nothing','Other'];
export const PHONE_MODELS:Record<string,string[]>= {
 Apple:['iPhone 17 Pro Max','iPhone 17 Pro','iPhone 17','iPhone Air','iPhone 16 Pro Max','iPhone 16 Pro','iPhone 16 Plus','iPhone 16','iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15 Plus','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14 Plus','iPhone 14','iPhone 13 Pro Max','iPhone 13 Pro','iPhone 13','iPhone 13 mini','iPhone 12 Pro Max','iPhone 12 Pro','iPhone 12','iPhone 12 mini','iPhone 11 Pro Max','iPhone 11 Pro','iPhone 11','iPhone XR','iPhone XS Max','iPhone XS','iPhone X','Other'],
 Samsung:['Galaxy S25 Ultra','Galaxy S25+','Galaxy S25','Galaxy S24 Ultra','Galaxy S24+','Galaxy S24','Galaxy S23 Ultra','Galaxy S23+','Galaxy S23','Galaxy S22 Ultra','Galaxy S22+','Galaxy S22','Galaxy A56','Galaxy A36','Galaxy A26','Galaxy A16','Galaxy Z Fold7','Galaxy Z Flip7','Galaxy Z Fold6','Galaxy Z Flip6','Galaxy Z Fold5','Galaxy Z Flip5','Other'],
 Tecno:['Phantom V Fold2','Phantom V Flip2','Camon 40 Pro','Camon 40','Camon 30 Pro','Camon 30','Spark 30 Pro','Spark 30','Pova 6 Pro','Other'],
 Infinix:['Note 50 Pro+','Note 50 Pro','Note 50','Zero 40','Hot 50 Pro+','Hot 50 Pro','Hot 50','GT 30 Pro','Other'],
 Google:['Pixel 10 Pro XL','Pixel 10 Pro','Pixel 10','Pixel 9 Pro XL','Pixel 9 Pro','Pixel 9','Pixel 8 Pro','Pixel 8','Pixel 7 Pro','Pixel 7','Other'],
 Xiaomi:['Xiaomi 15 Ultra','Xiaomi 15 Pro','Xiaomi 15','Redmi Note 14 Pro+','Redmi Note 14 Pro','Redmi Note 14','Other']
};
export const CAR_MAKES=['Toyota','Subaru','Mercedes-Benz','Nissan','Mitsubishi','Audi','BMW','Ford','Honda','Hyundai','Isuzu','Jaguar','Jeep','Kia','Land Rover','Lexus','Mazda','Peugeot','Porsche','Renault','Suzuki','Volkswagen','Volvo','Other'];
export const CAR_COLORS=COLORS;
export const BODY_TYPES=['SUV','Sedan','Station Wagon','Pickup','Minivan','Hatchback','Crossover','Coupe','Convertible','Truck','Van','Other'];
export const TRANSMISSIONS=['Automatic','Manual','CVT','AMT','Other'];
export const FUEL_TYPES=['Petrol','Diesel','Hybrid','Electric','Other'];

export const ACCESSORIES=['Charger','Cable','Case','Screen Protector','Power Bank','Car Charger','Adapter','Stand','Other'];
export const PROPERTY_TYPES=['House','Apartment','Flat','Room','Studio','Office','Shop','Warehouse','Land','Other'];
export const FURNISHING=['Furnished','Unfurnished','Partly Furnished'];
export const YES_NO=['Yes','No'];
export const NETWORKS=['Unlocked / All networks','MTN','Airtel','Other'];
export const SIM_OPTIONS=['Single SIM','Dual SIM','Triple SIM','eSIM Only'];

export const VEHICLE_MODELS:Record<string,string[]>= {
 Toyota:['Premio','Fielder','Harrier','Prado','Land Cruiser','RAV4','Corolla','Vitz','Wish','Noah','Hiace','Hilux','Fortuner','Rush','Sienta','Voxy','Alphard','Other'],
 Subaru:['Forester','Impreza','Legacy','Outback','XV','Crosstrek','WRX','Other'],
 Nissan:['X-Trail','Patrol','Note','Serena','Dualis','Juke','Navara','Tiida','Other'],
 Mercedes-Benz:['C-Class','E-Class','S-Class','GLC','GLE','GLA','GLB','Sprinter','Other'],
 BMW:['3 Series','5 Series','7 Series','X1','X3','X5','X6','Other'],
 Volkswagen:['Golf','Passat','Tiguan','Touareg','Polo','Transporter','Other'],
};
export const LAPTOP_BRANDS=['Dell','HP','Lenovo','Apple','Asus','Acer','Microsoft','MSI','Toshiba','Samsung','Other'];
export const PROCESSORS=['Core i3','Core i5','Core i7','Core i9','Ryzen 3','Ryzen 5','Ryzen 7','Ryzen 9','Apple M1','Apple M2','Apple M3','Apple M4','Other'];
export const SCREEN_SIZES=['5 inch','6 inch','6.1 inch','6.5 inch','10 inch','11 inch','12 inch','13 inch','14 inch','15 inch','16 inch','17 inch','24 inch','32 inch','43 inch','50 inch','55 inch','65 inch','75 inch','85 inch','Other'];
export const ACCESSORY_BRANDS=['Apple','Samsung','Anker','Baseus','JBL','Sony','Oraimo','Ugreen','Belkin','Other'];
export const CONNECTIVITY=['Bluetooth','Wi-Fi','USB','USB-C','Lightning','3.5mm Jack','Wireless','Other'];
export const FASHION_SIZES=['XS','S','M','L','XL','XXL','XXXL','36','38','40','42','44','46','48','50','52','54','56','Other'];
export const JOB_TYPES=['Full-time','Part-time','Contract','Temporary','Internship','Volunteer'];
export const EDUCATION=['Primary','O-Level','A-Level','Certificate','Diploma','Bachelor','Masters','PhD','Other'];
export const EXPERIENCE=['No experience','Less than 1 year','1-2 years','3-5 years','6-10 years','10+ years'];
export const CATEGORY_FILTER_NOTE='Structured selectable attributes are designed for both posting and marketplace filtering/search, so buyers can narrow results by the same values sellers choose.';
export const VEHICLE_CONDITIONS=['Brand New','Foreign Used','Local Used'];
export const DRIVETRAINS=['Front Wheel','Rear Wheel','Four Wheel','All Wheel','4x4','4x2'];
export const PHONE_FEATURES=['5G','AMOLED','Dual SIM','eSIM Support','NFC','Wireless Charging','Dust & Water Resistant','High Refresh Rate','Expandable Storage','Foldable'];
export const PAYMENT_TERMS=['Cash','Mobile Money','Bank transfer','Negotiable'];
export const VEHICLE_POPULAR_FILTERS=['Low Mileage','4WD / AWD','Apple CarPlay / Android Auto','Automatic','Hybrid','SUV'];
export const PHONE_POPULAR_FILTERS=['5000 mAh and above','5G','AMOLED','Dual SIM','eSIM Support','NFC','Wireless Charging','Foldable'];
export const UGANDA_PAYMENT_METHODS=['Cash on meetup','Mobile Money','Bank transfer'];
export const PROPERTY_AMENITIES=['Parking','Security','Water','Power','Internet','Garden','Air Conditioning','Balcony','Servant Quarter','Swimming Pool','Other'];
export const VEHICLE_YEARS=Array.from({length:55},(_,i)=>String(new Date().getFullYear()+1-i));
export const CURRENCY='UGX';
export const SELLER_TYPES=['Individual','Business'];
export const AD_VISIBILITY=['Public','Private / Draft'];
export const DESCRIPTION_HINTS=['What is included','Condition details','Reason for selling','Delivery/meetup terms','Warranty or return information','Contact/application instructions'];
export const MODERATION_RULES=['Use original photos','No contact details inside photos','No duplicate adverts','Use the correct category','Use accurate price and specifications'];
export const SELECT_FIRST='Select an option';
export const DELIVERY_OPTIONS=['Meetup','Seller delivery','Buyer pickup','Courier'];
export const CONTACT_PREFERENCES=['Chat','Phone call','Both'];
export const AD_STATUS_LABELS=['Draft','Pending review','Active','Sold','Expired','Rejected'];
export const NEGOTIATION_OPTIONS=['Price is negotiable','Price is firm'];
export const REGION_LABEL='Region';
export const AD_FIELD_PHILOSOPHY='Use structured selections wherever a reliable predefined value exists; allow free text only where the value cannot reasonably be enumerated.';
