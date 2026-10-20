# Helios Infiltrator: Solar Skimmer & Citadel Strike

Bir yıldızın kavurucu yüzeyinde süzülen hovercraft ile yıldızın hidrojenini çalan Dyson Karteli'nin kapsüllerini yok ettiğimiz, hidrojen plazma kredileri toplayıp araç ve ajan geliştirmeleri yaptığımız, ardından kartelin yıldız üstü devasa sızma kalelerine gizlilik ve silahlı çatışmayla baskın düzenlediğimiz 3D Android uyumlu bilim kurgu aksiyon oyunu.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Kullanıcı ile 1. Aşamada netleştirilen kritik tercihler sisteme entegre edilmiştir:
> - **Kamera & Hareket**: 3. şahıs takip kameralı hovercraft ve dokunmatik sanal joystick (Android ve masaüstü çift destekli).
> - **Sızma Modu Stili**: Saklanma (siper/gizlilik/görüş konileri) ve silahla saldırma (blaster, EMP, sabotaj) kombinasyonu.
> - **Yıldız Teması**: Kırmızı plazma, dev güneş püskürmeleri ve manyetik koronal fırtınalarla dolu hiper-aktif kızıl dev yıldız.

- **Onaylanan Karar 1**: İki birbirini besleyen temel 3D mod: (1) Yıldız Yüzeyi Hovercraft Avı ve (2) Kartel Kalesi Sızma & Çatışma Operasyonu.
- **Onaylanan Karar 2**: Gelişmiş yükseltme ağacı (Termal Kalkan, Plazma Topu, İtki Motoru, Gizlilik Kamuflajı, EMP Bozguncu, Şifre Çözücü).
- **Açık Tercih (Varsayılan)**: Sesler ve müzik için 100% kod tabanlı, sıfır dosya bağımlılığına sahip Web Audio API motoru (lazer sesleri, motor uğultusu, alarm sirenleri ve dinamik synthwave fon ritmi).

---

## 1. Overview & Core Concept

- **Oyunun Amacı**: Oyuncu, "Helios Görev Gücü" pilotu ve ajanı olarak, ölümcül bir kızıl dev yıldızın hidrojen enerjisini sülük gibi emerek yıldızı karartan gizli örgüt "Dyson Karteli"nin dev ekstraktör kapsüllerini parçalar. Toplanan H-Kredileriyle hovercraft'ını ve sızma ekipmanlarını güçlendirir; ardından kartelin devasa termal kulelerine sızıp reaktörlerini sabote eder.
- **Hedef Kitle & Platform**: Android mobil cihazlar (dokunmatik joystick, haptic titreşim, optimize edilmiş WebGL performansı, dikey/yatay responsive görünüm) ve masaüstü tarayıcılar (klavye/fare hibrit).
- **Temel Oyun Döngüsü**:
  1. **Yıldız Yüzey Devriyesi**: Yıldızın dalgalanan plazma okyanusunda hovercraft sürüşü, manyetik fırtınalardan kaçış.
  2. **Kapsül İmhası & Madencilik**: Hidrojen emen sarmal kuleleri ve emme podlarını plazma toplarıyla patlatıp hidrojen çekirdeklerini toplama.
  3. **Hangarda Yükseltme**: Kazanılan H-Kredileri ile hız, kalkan, ateş gücü ve ajan sızma yeteneklerini geliştirme.
  4. **Kartel Kalesine Sızma**: Tespit lazerleri ve devriye dronlarının arkasından saklanarak ilerleme, siper alma, susturuculu blaster veya açık çatışma ile çekirdek reaktörü havaya uçurma.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Ana Menü & Hangara Giriş**:
   - Güneşin kızıl lav dalgaları arkada akarken kartelin istatistikleri ve görev durumu.
   - Hangar ekranında 3D hovercraft ve ajan modeli, satın alınabilir geliştirmeler.
2. **Yıldız Yüzeyi Görevi (Solar Skimmer Phase)**:
   - 3. şahıs bakış açısıyla akıcı hovercraft sürüşü (dönüşlerde gövde eğilimi, itki parçacıkları).
   - Sol el sanal joystick ile gaz/yön; sağ el butonları ile Hızlandırıcı (Boost), Plazma Ateşi (Fire) ve Hedef Kilitleme.
   - Yüzeyde hidrojen emen kapsüller devasa dikey kuleler şeklinde yükselir; etraflarında savunma mayınları bulunur.
   - Kapsül patlatıldığında etrafa saçılan mavi/altın hidrojen küreleri mıknatısla çekilir.
3. **Kale Sızma Görevi (Citadel Infiltration Phase)**:
   - Hovercraft istasyona kilitlenir; ajan 3D sızma moduna geçer.
   - Güvenlik dronlarının yerde beliren kırmızı görüş konileri (Vision Cones).
   - Kutuların arkasına eğilerek saklanma ("Siper / Crouch" butonu), gizlice arkadan geçme veya lazer silahıyla dronları etkisiz kılma.
   - Ana konsolu hackleyerek hidrojen tahliye sistemini devre dışı bırakma ve geri sayım bitmeden kaçış!
4. **Zafer & Geliştirme Ekranı**:
   - Görev sonu ödülleri, kazanılan H-Kredileri, yeni açılan kalkan tipleri ve silah modifikasyonları.

### Visual Identity & Theme

- **Aesthetic Direction**: Hi-tech Solar Cyberpunk & Brutalist Sci-Fi. Yıldızın vahşi organik plazma ısısı ile kartelin soğuk, endüstriyel koyu titanyum ve neon turuncu yapılarının kontrastı.
- **Color Palette**:
  - Dominant Neutral (60%): Koyu uzay siyahı (`#080509`), soğuk grafit titanyum (`#16161d`), derin magmatik zemin (`#1a0808`).
  - Structural Surface (30%): Plazma koru (`#d9480f`), akkor turuncu (`#ff922b`), koronal kırmızılık (`#c92a2a`).
  - High-Intent Accents (10%): Hidrojen mavisi (`#38d9a9` / `#22b8cf`), lazer kırmızısı (`#ff6b6b`), kritik alarm sarısı (`#fcc419`).
- **Typography**:
  - Display & HUD Başlıkları: `Orbitron` / `Chakra Petch` stilinde keskin köşeli bilim kurgu karakteri.
  - Okuma & Veri Metinleri: `Plus Jakarta Sans` ve `tabular-nums` ile net hız, kalkan, ısı ve kredi göstergeleri.
- **Ergonomic Mobile Layout**:
  - Ekranın sol altı: Yarı saydam dinamik sanal joystick (parmağın dokunduğu yerde beliren ergonomik touch ring).
  - Ekranın sağ altı: Başparmak yayında yerleştirilmiş eylem butonları (Ateş, Hızlandırıcı, Siper/Etkileşim).
  - Ekranın üstü: Minimalist Isı Göstergesi (Overheat bar), Kalkan durumu ve Toplanan Hidrojen Kredisi.

---

## 3. Key Product Decisions & Trade-Offs

- **3D Render Altyapısı**: Three.js (WebGL). Harici ağır 3D model dosyaları (GLB/OBJ) ağdan yükleme gecikmesi ve 404 riski yaratmaması için tüm hovercraft, sızma ajanı, kartel dronları, kapsüller ve kale mimarisi kod tabanlı modüler prosedürel 3D primitiflerden (`THREE.Group`, beveled extrusions, custom canvas textures) üretilecektir.
- **Yıldız Yüzeyi Simülasyonu**: Özel GLSL dalgalanan plazma shader'ı (Photosphere displacement & pulsing heat colors), dev güneş arkları (solar flares - particle curves) ve dinamik ısı mekaniği.
- **Android Dokunmatik Deneyimi**: Çift dokunmatik bölge (Left Move Stick + Right Action Cluster), çoklu dokunma (multitouch) engelsiz kontrol, titreşim (haptic feedback API).
- **Ses & Atmosfer**: Web Audio API ile sıfır harici dosya bağımlı uzamsal synth efektleri (motor torku, lazer patlamaları, kalkan çınlaması, alarm uyarısı).

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Root Container)                        │
├────────────────────────────────────────────────────────────────────────┤
│  State: GameState (Menu | SurfaceFlight | CitadelStealth | Hangar)    │
│  State: PlayerData (Credits, Upgrades, Health, Heat, MissionProgress)  │
└────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────┐                       ┌───────────────────────┐
│     ThreeCanvas       │                       │     MobileGameHUD     │
│  - WebGLRenderer      │                       │  - Virtual Joystick   │
│  - SolarPhotosphere   │ ◄── Input / Camera ───│  - Action Buttons     │
│  - HovercraftActor    │     Sync per frame    │  - Heat/Shield Gauges │
│  - SiphonCapsules     │                       │  - Stealth Alert HUD  │
│  - CitadelCorridors   │                       │  - Sound Toggle       │
│  - DronePatrols       │                       └───────────────────────┘
└───────────────────────┘                                   │
            │                                               ▼
            │                                   ┌───────────────────────┐
            ▼                                   │     HangarModal       │
┌───────────────────────┐                       │  - Engine Tuning      │
│     SoundEngine       │                       │  - Plasma Cannons     │
│  - Web Audio Context  │                       │  - Thermal Shielding  │
│  - Laser / Explosions │                       │  - Cloak & Silencer   │
│  - Thruster Synthesis │                       └───────────────────────┘
└───────────────────────┘
```

### Data Models & Upgrades

```typescript
export interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  category: 'vehicle' | 'weapons' | 'stealth' | 'shield';
  multiplier: number;
}

export interface PlayerStats {
  credits: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  heat: number;
  maxHeat: number;
  speed: number;
  firePower: number;
  stealthCamoDuration: number;
  empCount: number;
  clearedBases: number;
}
```

---

## 5. Implementation Steps (Planned Post-Approval)

1. **Paket Kurulumu**: `install_applet_package` ile `three` ve `@types/three` kütüphanelerinin kurulumu.
2. **Ses Motoru (`src/game/sound.ts`)**: Web Audio API tabanlı lazer ateşleri, patlama, hover motor uğultusu ve alarm efektleri.
3. **Yıldız & Yüzey Sistemi (`src/game/solarSurface.ts`)**: Akkor plazma okyanusu, konvektif solar dalgalanmalar, güneş püskürmeleri ve dönen manyetik alanlar.
4. **3D Araç & Aktörler (`src/game/models.ts`)**: 3-12 parçalı kompozit hovercraft (gövde, itki türbinleri, plazma kanonları, parlayan itki izi), hidrojen emici devasa kuleler, sızma ajanı, kartel devriye dronları ve güvenlik taretleri.
5. **Yıldız Yüzeyi Oynanışı (`src/game/surfaceGame.ts`)**: Fiziksel süspansiyonlu hover hareketi, kapsül tespiti, lazer ateşi, hidrojen çekirdeklerinin parçalanması ve toplanması.
6. **Kale İçi Sızma & Çatışma Sistemi (`src/game/citadelGame.ts`)**: Koridorlar, siper alma kutuları, dron görüş açıları (kırmızı koniler), hackleme konsolları, alarmlar ve reaktör sabotajı.
7. **Mobil Dokunmatik Kontroller & HUD (`src/components/TouchControls.tsx`, `src/components/HUD.tsx`)**: Akıcı sanal joystick, dokunmatik eylem butonları, ısı/kalkan barları, tespit radarı.
8. **Hangar & Yükseltmeler (`src/components/Hangar.tsx`)**: Kazanılan kredilerle aracın ve ajanın güçlendirilmesi, görev seçimi ve sesli/görsel geri bildirim.
9. **Entegrasyon & Doğrulama**: `compile_applet` ile sıfır hata testi ve kusursuz mobil performans onayı.
